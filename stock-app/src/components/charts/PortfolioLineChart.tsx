"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Stock, StockQuote } from "@/types";
import { formatAsset } from "@/hooks/useCurrencyFormat";

const USD_TO_KRW = 1380;
const POINTS = 40;

interface TrendPoint {
  date: string;
  value: number;
  invested: number;
}

// 매수일부터 오늘까지 포트폴리오 가치 추이를 선형 보간으로 생성
function buildTrendData(
  stocks: Stock[],
  quotes: Record<string, StockQuote>
): TrendPoint[] {
  if (stocks.length === 0) return [];

  const today = new Date();
  const earliest = stocks.reduce((min, s) => {
    const d = new Date(s.buyDate);
    return d < min ? d : min;
  }, today);

  const spanMs = Math.max(today.getTime() - earliest.getTime(), 86400000 * 7);

  return Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1);
    const pointDate = new Date(earliest.getTime() + t * spanMs);

    let portfolioValue = 0;
    let investedValue = 0;

    for (const stock of stocks) {
      const buyDate = new Date(stock.buyDate);
      if (pointDate < buyDate) continue;

      const currentPrice = quotes[stock.ticker]?.price ?? stock.avgPrice;
      const elapsed = Math.min(
        (pointDate.getTime() - buyDate.getTime()) /
          Math.max(today.getTime() - buyDate.getTime(), 1),
        1
      );

      const price = stock.avgPrice + (currentPrice - stock.avgPrice) * elapsed;
      const val = price * stock.quantity;
      const toKRW = stock.currency === "USD" ? USD_TO_KRW : 1;

      portfolioValue += val * toKRW;
      investedValue += stock.avgPrice * stock.quantity * toKRW;
    }

    return {
      date: pointDate.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      value: Math.round(portfolioValue),
      invested: Math.round(investedValue),
    };
  });
}

interface PortfolioLineChartProps {
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  displayCurrency: "KRW" | "USD";
}

export default function PortfolioLineChart({
  stocks,
  quotes,
  displayCurrency,
}: PortfolioLineChartProps) {
  const data = buildTrendData(stocks, quotes);
  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);

  const lastValue = data[data.length - 1]?.value ?? 0;
  const firstValue = data[0]?.value ?? 0;
  const totalReturn = lastValue - firstValue;
  const isUp = totalReturn >= 0;

  const lineColor = isUp ? "#f87171" : "#60a5fa";
  const gradientId = "portfolioGradient";

  const fmt = (v: number) => formatAsset(v, displayCurrency);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--muted)] text-xs gap-1">
        <p>종목을 추가하면 수익 추이가 표시됩니다</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          hide
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--foreground)",
          }}
          formatter={(value) => [
            typeof value === "number" ? fmt(value) : String(value),
            "포트폴리오",
          ]}
          labelStyle={{ color: "var(--muted)", marginBottom: 4 }}
        />
        <ReferenceLine
          y={firstValue}
          stroke="var(--border)"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: lineColor, stroke: "var(--background)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
