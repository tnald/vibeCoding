"use client";

import { Stock, StockQuote, Account } from "@/types";
import { formatAsset, formatProfit } from "@/hooks/useCurrencyFormat";
import AssetPieChart from "@/components/charts/AssetPieChart";
import PortfolioLineChart from "@/components/charts/PortfolioLineChart";

const USD_TO_KRW = 1380;

interface AssetOverviewSectionProps {
  account: Account;
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  stockValueKRW: number;
  totalProfitKRW: number;
  displayCurrency: "KRW" | "USD";
}

export default function AssetOverviewSection({
  account,
  stocks,
  quotes,
  stockValueKRW,
  totalProfitKRW,
  displayCurrency,
}: AssetOverviewSectionProps) {
  const totalAssetKRW =
    stockValueKRW + account.cashKRW + account.cashUSD * USD_TO_KRW;

  const investedKRW = stocks.reduce((sum, s) => {
    const val = s.avgPrice * s.quantity;
    return sum + (s.currency === "USD" ? val * USD_TO_KRW : val);
  }, 0);

  const profitPercent =
    investedKRW > 0 ? (totalProfitKRW / investedKRW) * 100 : 0;
  const isUp = totalProfitKRW >= 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[280px_1fr_1fr] divide-x divide-[var(--border-subtle)]">

        {/* ── 좌측: 총 자산 수치 ── */}
        <div className="px-6 py-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] text-[var(--muted)] mb-1">총 자산</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight tabular-nums leading-none mb-2">
              {formatAsset(totalAssetKRW, displayCurrency)}
            </p>
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold
              ${isUp ? "text-red-400" : "text-blue-400"}`}>
              <span>{isUp ? "▲" : "▼"}</span>
              <span>{formatProfit(totalProfitKRW, displayCurrency)}</span>
              <span className="text-xs opacity-70">({isUp ? "+" : ""}{profitPercent.toFixed(2)}%)</span>
            </div>
          </div>

          {/* 자산 세부 분류 */}
          <div className="mt-4 flex flex-col gap-2">
            {[
              {
                label: "주식",
                valueKRW: stockValueKRW,
                pct: totalAssetKRW > 0 ? (stockValueKRW / totalAssetKRW) * 100 : 0,
                color: "bg-[#4f6ef7]",
              },
              {
                label: "현금 (₩)",
                valueKRW: account.cashKRW,
                pct: totalAssetKRW > 0 ? (account.cashKRW / totalAssetKRW) * 100 : 0,
                color: "bg-emerald-500",
              },
              {
                label: "현금 ($)",
                valueKRW: account.cashUSD * USD_TO_KRW,
                pct: totalAssetKRW > 0 ? ((account.cashUSD * USD_TO_KRW) / totalAssetKRW) * 100 : 0,
                color: "bg-amber-500",
              },
            ]
              .filter((r) => r.valueKRW > 0)
              .map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${row.color}`} />
                      <span className="text-[11px] text-[var(--muted)]">{row.label}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[var(--foreground)] tabular-nums">
                      {formatAsset(row.valueKRW, displayCurrency)}
                    </span>
                  </div>
                  {/* 비중 바 */}
                  <div className="h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.color}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── 중앙: 파이 차트 ── */}
        <div className="px-6 py-5">
          <p className="text-[11px] text-[var(--muted)] mb-3">자산 구성</p>
          <div className="h-[160px]">
            <AssetPieChart
              cashKRW={account.cashKRW}
              cashUSD={account.cashUSD}
              stockValueKRW={stockValueKRW}
              displayCurrency={displayCurrency}
            />
          </div>
        </div>

        {/* ── 우측: 수익 추이 선 그래프 ── */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--muted)]">수익 추이</p>
            <span className="text-[10px] text-[var(--muted)] bg-[var(--border)] px-2 py-0.5 rounded-md">
              매수일 ~ 현재
            </span>
          </div>
          <div className="h-[160px]">
            <PortfolioLineChart
              stocks={stocks}
              quotes={quotes}
              displayCurrency={displayCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
