"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Stock, StockQuote } from "@/types";

const USD_TO_KRW = 1380;

const SECTOR_COLORS: Record<string, string> = {
  반도체: "#818cf8",
  전력: "#f59e0b",
  바이오: "#10b981",
  IT: "#38bdf8",
  금융: "#f97316",
  소비재: "#f43f5e",
  에너지: "#22c55e",
  기타: "#6b7280",
  현금: "#94a3b8",
};

function getColor(name: string, i: number) {
  return SECTOR_COLORS[name] ?? `hsl(${(i * 53) % 360}, 55%, 58%)`;
}

interface Props {
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  cashKRW: number;
  cashUSD: number;
}

export default function PortfolioAnalysisChart({ stocks, quotes, cashKRW, cashUSD }: Props) {
  const sectorMap: Record<string, number> = {};

  stocks.forEach((s) => {
    const price = quotes[s.ticker]?.price ?? s.avgPrice;
    const valueKRW =
      s.currency === "USD" ? price * s.quantity * USD_TO_KRW : price * s.quantity;
    sectorMap[s.sector] = (sectorMap[s.sector] ?? 0) + valueKRW;
  });

  const totalCash = cashKRW + cashUSD * USD_TO_KRW;
  if (totalCash > 0) sectorMap["현금"] = totalCash;

  const data = Object.entries(sectorMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
        자산을 추가하면 분석이 표시됩니다
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 h-full">
      <div className="w-[130px] h-[130px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={58}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={getColor(d.name, i)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? `₩${value.toLocaleString()}` : String(value),
                "",
              ]}
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {data.map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={d.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: getColor(d.name, i) }}
                />
                <span className="text-[11px] text-[var(--muted)] truncate">{d.name}</span>
              </div>
              <span className="text-[11px] font-semibold text-[var(--foreground)] tabular-nums shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
