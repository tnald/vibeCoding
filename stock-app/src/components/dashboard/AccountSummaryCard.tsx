"use client";

import { Stock, StockQuote, Account } from "@/types";
import { formatAsset, formatProfit } from "@/hooks/useCurrencyFormat";

const USD_TO_KRW = 1380;

interface Props {
  account: Account;
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  displayCurrency: "KRW" | "USD";
}

export default function AccountSummaryCard({ account, stocks, quotes, displayCurrency }: Props) {
  const krStocks = stocks.filter((s) => s.market === "KR");
  const usStocks = stocks.filter((s) => s.market === "US");

  const calcValue = (list: Stock[]) =>
    list.reduce((sum, s) => {
      const price = quotes[s.ticker]?.price ?? s.avgPrice;
      return sum + (s.currency === "USD" ? price * s.quantity * USD_TO_KRW : price * s.quantity);
    }, 0);

  const calcProfit = (list: Stock[]) =>
    list.reduce((sum, s) => {
      const cur = quotes[s.ticker]?.price ?? s.avgPrice;
      const profit = (cur - s.avgPrice) * s.quantity;
      return sum + (s.currency === "USD" ? profit * USD_TO_KRW : profit);
    }, 0);

  const krValueKRW = calcValue(krStocks);
  const usValueKRW = calcValue(usStocks);
  const krProfitKRW = calcProfit(krStocks);
  const usProfitKRW = calcProfit(usStocks);

  const stockValueKRW = krValueKRW + usValueKRW;
  const totalProfitKRW = krProfitKRW + usProfitKRW;
  const cashKRW = account.cashKRW + account.cashUSD * USD_TO_KRW;
  const totalAssetKRW = stockValueKRW + cashKRW;

  const investedKRW = stocks.reduce((sum, s) => {
    const val = s.avgPrice * s.quantity;
    return sum + (s.currency === "USD" ? val * USD_TO_KRW : val);
  }, 0);

  const totalReturnPct = investedKRW > 0 ? (totalProfitKRW / investedKRW) * 100 : 0;
  const isUp = totalProfitKRW >= 0;

  const metrics = [
    {
      label: "현금 (예수금)",
      value: formatAsset(cashKRW, displayCurrency),
      sub: `₩${Math.round(account.cashKRW).toLocaleString()} + $${account.cashUSD.toFixed(2)}`,
      profitAmount: null,
    },
    {
      label: "국내 평가금액",
      value: formatAsset(krValueKRW, displayCurrency),
      sub: `${krStocks.length}종목`,
      profitAmount: null,
    },
    {
      label: "국내 평가손익",
      value: formatProfit(krProfitKRW, displayCurrency),
      sub: null,
      profitAmount: krProfitKRW,
    },
    {
      label: "해외 평가금액",
      value: formatAsset(usValueKRW, displayCurrency),
      sub: `${usStocks.length}종목`,
      profitAmount: null,
    },
    {
      label: "해외 평가손익",
      value: formatProfit(usProfitKRW, displayCurrency),
      sub: null,
      profitAmount: usProfitKRW,
    },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
      {/* 순자산 총액 */}
      <div className="mb-5 pb-5 border-b border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--muted)] mb-1.5">순자산 총액</p>
        <p className="text-4xl font-bold text-[var(--foreground)] tracking-tight tabular-nums leading-none">
          {formatAsset(totalAssetKRW, displayCurrency)}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-sm font-semibold ${isUp ? "text-red-400" : "text-blue-400"}`}>
            {isUp ? "▲" : "▼"} {formatProfit(Math.abs(totalProfitKRW), displayCurrency)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-lg font-bold
            ${isUp ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
            {isUp ? "+" : ""}{totalReturnPct.toFixed(2)}%
          </span>
          <span className="text-xs text-[var(--muted)]">전체 수익률</span>
        </div>
      </div>

      {/* 5개 메트릭 */}
      <div className="grid grid-cols-5 gap-3">
        {metrics.map((m) => {
          const isProfit = m.profitAmount !== null;
          const profitUp = m.profitAmount !== null && m.profitAmount >= 0;
          return (
            <div key={m.label} className="bg-[var(--background)] rounded-xl p-3.5">
              <p className="text-[10px] text-[var(--muted)] mb-1.5">{m.label}</p>
              <p className={`text-sm font-semibold tabular-nums
                ${isProfit ? (profitUp ? "text-red-400" : "text-blue-400") : "text-[var(--foreground)]"}`}>
                {m.value}
              </p>
              {m.sub && (
                <p className="text-[10px] text-[var(--muted)] mt-1">{m.sub}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
