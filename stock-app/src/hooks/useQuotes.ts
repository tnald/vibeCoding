"use client";

import { useEffect, useState, useCallback } from "react";
import { Stock, StockQuote } from "@/types";

export function useQuotes(stocks: Stock[]) {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);

  // stocks 배열이 바뀔 때만 재조회 (ticker 목록 기준)
  const tickerKey = stocks.map((s) => `${s.ticker}:${s.market}`).join(",");

  const fetchAll = useCallback(async () => {
    if (stocks.length === 0) {
      setQuotes({});
      return;
    }
    setLoading(true);

    const results = await Promise.allSettled(
      stocks.map(async (s) => {
        const res = await fetch(`/api/price?ticker=${s.ticker}&market=${s.market}`);
        if (!res.ok) throw new Error(`fetch failed: ${s.ticker}`);
        const data = await res.json();
        const quote: StockQuote = {
          ticker: s.ticker,
          name: data.name ?? s.name,
          price: data.price,
          change: data.change ?? 0,
          changePercent: data.changePercent ?? 0,
          currency: data.currency ?? s.currency,
        };
        return { ticker: s.ticker, quote };
      })
    );

    const newQuotes: Record<string, StockQuote> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        newQuotes[r.value.ticker] = r.value.quote;
      }
    });
    setQuotes(newQuotes);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { quotes, loading, refetch: fetchAll };
}
