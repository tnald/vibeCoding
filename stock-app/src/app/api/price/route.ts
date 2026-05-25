import { NextRequest, NextResponse } from "next/server";

// ── 네이버 금융 (한국 주식) ──────────────────────────────────

async function fetchNaverCurrent(
  ticker: string
): Promise<{ price: number; currency: string; name: string } | null> {
  // 1차: 모바일 API
  try {
    const res = await fetch(
      `https://m.stock.naver.com/api/stock/${ticker}/basic`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://finance.naver.com" },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const json = await res.json();
      const priceStr: string = json.closePrice ?? json.stockPrice ?? json.currentPrice ?? "";
      const price = parseFloat(priceStr.replace(/,/g, ""));
      if (price) return { price, currency: "KRW", name: json.stockName ?? json.name ?? ticker };
    }
  } catch { /* fallback */ }

  // 2차: polling API
  try {
    const res = await fetch(
      `https://polling.finance.naver.com/api/realtime/domestic/stock/${ticker}`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://finance.naver.com" },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const json = await res.json();
      const d = json?.datas?.[0];
      if (d) {
        const priceStr: string = d.closePrice ?? d.currentPrice ?? "";
        const price = parseFloat(priceStr.replace(/,/g, ""));
        if (price) return { price, currency: "KRW", name: d.stockName ?? d.name ?? ticker };
      }
    }
  } catch { /* fallback */ }

  // 3차: PC 시세 JSON API
  try {
    const res = await fetch(
      `https://finance.naver.com/item/sise.naver?code=${ticker}`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://finance.naver.com" },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const text = await res.text();
      const priceMatch = text.match(/"closePrice"\s*:\s*"([\d,]+)"/) ??
                         text.match(/"currentPrice"\s*:\s*"([\d,]+)"/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ""));
        if (price) return { price, currency: "KRW", name: ticker };
      }
    }
  } catch { /* all fallbacks failed */ }

  return null;
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

const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchYahooChart(
  host: string,
  symbol: string,
  date?: string
): Promise<{ price: number; currency: string; name: string } | null> {
  let url: string;
  if (date) {
    const d = new Date(date + "T00:00:00Z");
    const period1 = Math.floor(d.getTime() / 1000) - 86400 * 5;
    const period2 = Math.floor(d.getTime() / 1000) + 86400 * 5;
    url = `https://${host}/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`;
  } else {
    url = `https://${host}/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  }

  const res = await fetch(url, { headers: YAHOO_HEADERS, cache: "no-store" });
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
}

async function fetchYahoo(
  symbol: string,
  date?: string
): Promise<{ price: number; currency: string; name: string } | null> {
  // query1 → query2 순서로 fallback
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const result = await fetchYahooChart(host, symbol, date);
      if (result) return result;
    } catch {
      // 다음 host 시도
    }
  }
  return null;
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
