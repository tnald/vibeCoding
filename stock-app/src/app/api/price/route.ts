import { NextRequest, NextResponse } from "next/server";

// ── 네이버 금융 (한국 주식) ──────────────────────────────────

async function fetchNaverCurrent(
  ticker: string
): Promise<{ price: number; currency: string; name: string } | null> {
  try {
    const res = await fetch(
      `https://m.stock.naver.com/api/stock/${ticker}/basic`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://finance.naver.com" },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const priceStr: string = json.closePrice ?? json.stockPrice ?? "";
    const price = parseFloat(priceStr.replace(/,/g, ""));
    if (!price) return null;
    return { price, currency: "KRW", name: json.stockName ?? ticker };
  } catch {
    return null;
  }
}

async function fetchNaverHistorical(
  ticker: string,
  date: string
): Promise<{ price: number; currency: string; name: string } | null> {
  try {
    const target = new Date(date + "T00:00:00Z");
    const start = new Date(target.getTime() - 7 * 86400 * 1000)
      .toISOString().slice(0, 10).replace(/-/g, "");
    const end = new Date(target.getTime() + 7 * 86400 * 1000)
      .toISOString().slice(0, 10).replace(/-/g, "");
    const targetYMD = date.replace(/-/g, "");

    const res = await fetch(
      `https://api.finance.naver.com/siseJson.naver?symbol=${ticker}&requestType=1&startTime=${start}&endTime=${end}&timeframe=day`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://finance.naver.com" },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;

    const text = await res.text();
    // 응답 형식: [['날짜','시가',...], ["YYYYMMDD", open, high, low, close, vol, ...], ...]
    const rows = text.match(/\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/g);
    if (!rows || rows.length === 0) return null;

    let bestPrice: number | null = null;
    let bestDiff = Infinity;

    for (const row of rows) {
      const m = row.match(/\["(\d{8})",\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)/);
      if (!m) continue;
      const rowDate = m[1];
      const close = parseFloat(m[2]);
      const diff = Math.abs(parseInt(rowDate) - parseInt(targetYMD));
      if (diff < bestDiff) { bestDiff = diff; bestPrice = close; }
    }

    if (!bestPrice) return null;

    // 종목명은 현재가 API에서 가져옴
    const basic = await fetchNaverCurrent(ticker);
    return { price: bestPrice, currency: "KRW", name: basic?.name ?? ticker };
  } catch {
    return null;
  }
}

// ── Yahoo Finance (미국 주식) ────────────────────────────────

async function fetchYahoo(
  symbol: string,
  date?: string
): Promise<{ price: number; currency: string; name: string } | null> {
  try {
    let url: string;
    if (date) {
      const d = new Date(date + "T00:00:00Z");
      const period1 = Math.floor(d.getTime() / 1000) - 86400 * 4;
      const period2 = Math.floor(d.getTime() / 1000) + 86400 * 4;
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`;
    } else {
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currency: string = meta.currency ?? "USD";
    const name: string = meta.longName ?? meta.shortName ?? symbol;

    if (date) {
      const timestamps: number[] = result.timestamp ?? [];
      const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
      const targetTs = new Date(date + "T00:00:00Z").getTime() / 1000;
      let bestPrice: number | null = null;
      let bestDiff = Infinity;
      for (let i = 0; i < timestamps.length; i++) {
        const c = closes[i];
        if (c == null || c <= 0) continue;
        const diff = Math.abs(timestamps[i] - targetTs);
        if (diff < bestDiff) { bestDiff = diff; bestPrice = c; }
      }
      if (!bestPrice) return null;
      return { price: bestPrice, currency, name };
    } else {
      const price: number = meta.regularMarketPrice ?? meta.chartPreviousClose;
      if (!price) return null;
      return { price, currency, name };
    }
  } catch {
    return null;
  }
}

// ── 라우트 핸들러 ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase();
  const market = searchParams.get("market") ?? "US";
  const date = searchParams.get("date") ?? undefined;

  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  // 한국 주식 → 네이버 금융
  if (market === "KR") {
    const data = date
      ? await fetchNaverHistorical(ticker, date)
      : await fetchNaverCurrent(ticker);
    if (!data) {
      return NextResponse.json({ error: "종목 정보를 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json({ ...data, ticker, market });
  }

  // 미국 주식 → Yahoo Finance
  const data = await fetchYahoo(ticker.toUpperCase(), date);
  if (!data) {
    return NextResponse.json({ error: "종목 정보를 찾을 수 없습니다" }, { status: 404 });
  }
  return NextResponse.json({ ...data, ticker, market });
}
