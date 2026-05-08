"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AssetPieChartProps {
  cashKRW: number;
  cashUSD: number;
  stockValueKRW: number;
  usdToKrw: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AssetPieChart({
  cashKRW,
  cashUSD,
  stockValueKRW,
  usdToKrw,
}: AssetPieChartProps) {
  const data = [
    { name: "현금 (KRW)", value: Math.round(cashKRW) },
    { name: "현금 (USD)", value: Math.round(cashUSD * usdToKrw) },
    { name: "주식", value: Math.round(stockValueKRW) },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">자산 구성</h3>
      {total === 0 ? (
        <div className="flex items-center justify-center py-14 text-[var(--muted)] text-xs">
          자산을 추가하면 비중이 표시됩니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? `${value.toLocaleString("ko-KR")}원` : value
              }
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
