"use client";

import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip,
} from "recharts";
import { Stock, StockQuote } from "@/types";

interface Props {
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  quotesLoading?: boolean;
}

export default function StockReturnChart({ stocks, quotes, quotesLoading }: Props) {
  // 티커 기준 그룹핑 (여러 번 매수한 종목도 1개 바로 표시)
  const tickerMap: Record<string, { name: string; totalQty: number; totalCost: number }> = {};
  stocks.forEach((s) => {
    if (!tickerMap[s.ticker]) {
      tickerMap[s.ticker] = { name: s.name, totalQty: 0, totalCost: 0 };
    }
    tickerMap[s.ticker].totalQty += s.quantity;
    tickerMap[s.ticker].totalCost += s.avgPrice * s.quantity;
  });

  const data = Object.entries(tickerMap)
    .map(([ticker, g]) => {
      const avgCost = g.totalQty > 0 ? g.totalCost / g.totalQty : 0;
      const cur = quotes[ticker]?.price ?? avgCost;
      const returnPct = avgCost > 0 ? ((cur - avgCost) / avgCost) * 100 : 0;
      return { name: g.name, return: parseFloat(returnPct.toFixed(2)) };
    })
    .sort((a, b) => b.return - a.return);

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
        종목을 추가하면 수익률이 표시됩니다
      </div>
    );
  }

  if (quotesLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-[var(--muted)] text-xs">
        <div className="w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        시세 조회 중...
      </div>
    );
  }

  const absMax = Math.max(...data.map((d) => Math.abs(d.return)), 5);
  const step = absMax <= 5 ? 1 : absMax <= 10 ? 2 : absMax <= 25 ? 5 : absMax <= 50 ? 10 : 25;
  const maxTick = Math.ceil(absMax / step) * step;
  const ticks: number[] = [];
  for (let t = -maxTick; t <= maxTick; t += step) {
    ticks.push(Math.round(t * 1000) / 1000);
  }
  const domain: [number, number] = [-maxTick, maxTick];

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
          ticks={ticks}
          allowDataOverflow={false}
          tickFormatter={(v) => v === 0 ? "0" : `${v > 0 ? "+" : ""}${v}%`}
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
