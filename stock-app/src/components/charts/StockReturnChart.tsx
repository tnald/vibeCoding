"use client";

import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip,
} from "recharts";
import { Stock, StockQuote } from "@/types";

interface Props {
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
}

export default function StockReturnChart({ stocks, quotes }: Props) {
  const data = stocks
    .map((s) => {
      const cur = quotes[s.ticker]?.price ?? s.avgPrice;
      const returnPct = s.avgPrice > 0 ? ((cur - s.avgPrice) / s.avgPrice) * 100 : 0;
      return { name: s.name, return: parseFloat(returnPct.toFixed(2)) };
    })
    .sort((a, b) => b.return - a.return);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
        종목을 추가하면 수익률이 표시됩니다
      </div>
    );
  }

  const absMax = Math.max(...data.map((d) => Math.abs(d.return)), 10);
  const domain: [number, number] = [-absMax * 1.15, absMax * 1.15];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 36, top: 4, bottom: 4 }}
        barCategoryGap="25%"
      >
        <XAxis
          type="number"
          domain={domain}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={72}
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1} />
        <Tooltip
          formatter={(v) => [`${Number(v) > 0 ? "+" : ""}${v}%`, "수익률"]}
          contentStyle={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 11,
          }}
          cursor={{ fill: "var(--border-subtle)", opacity: 0.3 }}
        />
        <Bar dataKey="return" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.return >= 0 ? "#ef4444" : "#3b82f6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
