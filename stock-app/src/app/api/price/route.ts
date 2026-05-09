import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance 심볼로 변환
// 한국 종목: 6자리 숫자 → {ticker}.KS (KOSPI) 시도 후 .KQ (KOSDAQ) 폴백
function toYahooSymbol(ticker: string, market: string): string {
  if (market === "KR") return `${ticker}.KS`;
  return ticker.toUpperCase();
}

async function fetchYahoo(symbol: string, date?: string): Promise<{ price: number; currency: string; name: string } | null> {
  let url: string;

  if (date) {
    // 특정 날짜 조회: 해당 날짜 기준 앞뒤 5영업일 범위 → 주말/공휴일 대비
    const d = new Date(date + "T00:00:00Z");
    const period1 = Math.floor(d.getTime() / 1000) - 86400 * 4; // 4일 전
    const period2 = Math.floor(d.getTime() / 1000) + 86400 * 4; // 4일 후
    url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`;
  } else {
    url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
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

    // 목표 날짜와 가장 가까운 유효한 종가 선택
    let bestPrice: number | null = null;
    let bestDiff = Infinity;

    for (let i = 0; i < timestamps.length; i++) {
      const c = closes[i];
      if (c == null || c <= 0) continue;
      const diff = Math.abs(timestamps[i] - targetTs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestPrice = c;
      }
    }

    if (!bestPrice) return null;
    return { price: bestPrice, currency, name };
  } else {
    const price: number = meta.regularMarketPrice ?? meta.chartPreviousClose;
    if (!price) return null;
    return { price, currency, name };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase();
  const market = searchParams.get("market") ?? "US";
  const date = searchParams.get("date") ?? undefined; // "YYYY-MM-DD" or undefined

  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  // 한국 종목: KS 시도 → 실패 시 KQ 폴백
  if (market === "KR") {
    let data = await fetchYahoo(`${ticker}.KS`, date);
    if (!data) data = await fetchYahoo(`${ticker}.KQ`, date);
    if (!data) {
      return NextResponse.json({ error: "종목 정보를 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json({ ...data, ticker, market });
  }

  // 미국 종목
  const symbol = toYahooSymbol(ticker, market);
  const data = await fetchYahoo(symbol, date);
  if (!data) {
    return NextResponse.json({ error: "종목 정보를 찾을 수 없습니다" }, { status: 404 });
  }
  return NextResponse.json({ ...data, ticker, market });
}
