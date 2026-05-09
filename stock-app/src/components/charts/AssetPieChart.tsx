"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatAsset } from "@/hooks/useCurrencyFormat";

const USD_TO_KRW = 1380;

const SLICES = [
  { key: "stock",    label: "주식",      color: "#4f6ef7" },
  { key: "cashKRW",  label: "현금 (₩)",  color: "#10b981" },
  { key: "cashUSD",  label: "현금 ($)",  color: "#f59e0b" },
];

interface AssetPieChartProps {
  cashKRW: number;
  cashUSD: number;
  stockValueKRW: number;
  displayCurrency: "KRW" | "USD";
}

export default function AssetPieChart({
  cashKRW,
  cashUSD,
  stockValueKRW,
  displayCurrency,
}: AssetPieChartProps) {
  const rawData = [
    { key: "stock",   value: Math.round(stockValueKRW) },
    { key: "cashKRW", value: Math.round(cashKRW) },
    { key: "cashUSD", value: Math.round(cashUSD * USD_TO_KRW) },
  ].filter((d) => d.value > 0);

  const total = rawData.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
        자산을 추가하면 비중이 표시됩니다
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 h-full">
      {/* 도넛 차트 */}
      <div className="w-[130px] h-[130px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rawData}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {rawData.map((d) => {
                const slice = SLICES.find((s) => s.key === d.key);
                return <Cell key={d.key} fill={slice?.color ?? "#888"} />;
              })}
            </Pie>
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? formatAsset(value, displayCurrency) : String(value),
                "",
              ]}
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 11,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 + 비중 */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {rawData.map((d) => {
          const slice = SLICES.find((s) => s.key === d.key)!;
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={d.key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: slice.color }} />
                <span className="text-[11px] text-[var(--muted)] truncate">{slice.label}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-semibold text-[var(--foreground)]">{pct}%</span>
                <p className="text-[10px] text-[var(--muted)] tabular-nums">
                  {formatAsset(d.value, displayCurrency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
