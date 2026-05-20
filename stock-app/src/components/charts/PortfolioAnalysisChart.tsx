"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Stock, StockQuote, Account } from "@/types";

const USD_TO_KRW = 1380;

const COLORS = [
  "#22c55e", "#4ade80", "#86efac",
  "#f59e0b", "#f97316", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#94a3b8",
];

interface ChartItem {
  name: string;
  valueKRW: number;
  displayValue: number;
  currency: "KRW" | "USD";
  color: string;
}

interface Props {
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  cashKRW: number;
  cashUSD: number;
  account: Account;
}

export default function PortfolioAnalysisChart({ stocks, quotes, cashKRW, cashUSD, account }: Props) {
  // 티커별 그룹핑
  const tickerMap: Record<string, { name: string; totalQty: number; totalCost: number; currency: "KRW" | "USD" }> = {};
  stocks.forEach((s) => {
    if (!tickerMap[s.ticker]) {
      tickerMap[s.ticker] = { name: s.name, totalQty: 0, totalCost: 0, currency: s.currency };
    }
    tickerMap[s.ticker].totalQty += s.quantity;
    tickerMap[s.ticker].totalCost += s.avgPrice * s.quantity;
  });

  const items: Omit<ChartItem, "color">[] = Object.entries(tickerMap).map(([ticker, g]) => {
    const price = quotes[ticker]?.price ?? (g.totalQty > 0 ? g.totalCost / g.totalQty : 0);
    const displayValue = price * g.totalQty;
    const valueKRW = g.currency === "USD" ? displayValue * USD_TO_KRW : displayValue;
    return { name: g.name, valueKRW, displayValue, currency: g.currency };
  });

  // 현금
  const totalCashKRW = cashKRW + cashUSD * USD_TO_KRW;
  if (totalCashKRW > 0) {
    items.push({ name: "현금(예수금)", valueKRW: totalCashKRW, displayValue: totalCashKRW, currency: "KRW" });
  }

  // 내림차순 정렬 + 색상 할당
  const sorted = items
    .filter((d) => d.valueKRW > 0)
    .sort((a, b) => b.valueKRW - a.valueKRW)
    .map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));

  const total = sorted.reduce((s, d) => s + d.valueKRW, 0);

  const fmtDisplay = (item: ChartItem) =>
    item.currency === "USD"
      ? `$${item.displayValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : `₩${Math.round(item.displayValue).toLocaleString("ko-KR")}`;

  const fmtTotal = `₩${Math.round(total).toLocaleString("ko-KR")}`;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--muted)] text-xs">
        자산을 추가하면 분석이 표시됩니다
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* 도넛 차트 */}
      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={100}
              paddingAngle={2}
              dataKey="valueKRW"
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {sorted.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl leading-none mb-1">{account.icon}</span>
          <p className="text-[11px] font-semibold text-[var(--foreground)]">{account.name}</p>
          <p className="text-[11px] text-[var(--muted)] tabular-nums mt-0.5">{fmtTotal}</p>
        </div>
      </div>

      {/* 범례 리스트 */}
      <div className="mt-4 flex flex-col divide-y divide-[var(--border-subtle)]">
        {sorted.map((d) => {
          const pct = ((d.valueKRW / total) * 100).toFixed(1);
          return (
            <div key={d.name} className="flex items-center justify-between py-2.5 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-sm text-[var(--foreground)] truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-3">
                <span className="text-sm text-[var(--muted)] tabular-nums w-12 text-right">{pct}%</span>
                <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums w-32 text-right">
                  {fmtDisplay(d)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
