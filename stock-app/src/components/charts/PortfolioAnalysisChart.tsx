"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Stock, StockQuote, Account, Sector } from "@/types";

const USD_TO_KRW = 1380;

// 섹터별 고정 색상
const SECTOR_COLORS: Record<string, string> = {
  반도체: "#8b5cf6",
  전력:   "#f59e0b",
  바이오: "#10b981",
  IT:     "#3b82f6",
  금융:   "#f97316",
  소비재: "#ec4899",
  에너지: "#22c55e",
  기타:   "#94a3b8",
  현금:   "#64748b",
};

interface StockItem {
  ticker: string;
  name: string;
  sector: Sector | "현금";
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
  // 티커별 그룹핑 (매도 반영한 순 수량)
  const tickerMap: Record<string, {
    name: string; sector: Sector; netQty: number; totalBuyCost: number;
    currency: "KRW" | "USD";
  }> = {};

  stocks.forEach((s) => {
    if (!tickerMap[s.ticker]) {
      tickerMap[s.ticker] = { name: s.name, sector: s.sector, netQty: 0, totalBuyCost: 0, currency: s.currency };
    }
    tickerMap[s.ticker].netQty += s.quantity;
    if (s.quantity > 0) tickerMap[s.ticker].totalBuyCost += s.avgPrice * s.quantity;
    tickerMap[s.ticker].sector = s.sector; // 최신 섹터 반영
  });

  // 종목별 아이템 (섹터 색상 적용)
  const stockItems: StockItem[] = Object.entries(tickerMap)
    .filter(([, g]) => g.netQty > 0)
    .map(([ticker, g]) => {
      const price = quotes[ticker]?.price ?? (g.netQty > 0 ? g.totalBuyCost / g.netQty : 0);
      const displayValue = price * g.netQty;
      const valueKRW = g.currency === "USD" ? displayValue * USD_TO_KRW : displayValue;
      return {
        ticker,
        name: g.name,
        sector: g.sector,
        valueKRW,
        displayValue,
        currency: g.currency,
        color: SECTOR_COLORS[g.sector] ?? SECTOR_COLORS["기타"],
      };
    })
    .filter((d) => d.valueKRW > 0);

  // 현금
  const totalCashKRW = cashKRW + cashUSD * USD_TO_KRW;

  // 도넛 데이터: 섹터별 합산
  const sectorMap: Record<string, { valueKRW: number; color: string }> = {};
  stockItems.forEach((item) => {
    if (!sectorMap[item.sector]) {
      sectorMap[item.sector] = { valueKRW: 0, color: item.color };
    }
    sectorMap[item.sector].valueKRW += item.valueKRW;
  });
  if (totalCashKRW > 0) {
    sectorMap["현금"] = { valueKRW: totalCashKRW, color: SECTOR_COLORS["현금"] };
  }

  const donutData = Object.entries(sectorMap)
    .filter(([, v]) => v.valueKRW > 0)
    .map(([sector, v]) => ({ name: sector, valueKRW: v.valueKRW, color: v.color }));

  // 전체 합계 (현금 포함)
  const total = stockItems.reduce((s, d) => s + d.valueKRW, 0) + totalCashKRW;

  const fmtKRW = (v: number) => `₩${Math.round(v).toLocaleString("ko-KR")}`;
  const fmtDisplay = (item: StockItem) =>
    item.currency === "USD"
      ? `$${item.displayValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : fmtKRW(item.displayValue);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--muted)] text-xs">
        자산을 추가하면 분석이 표시됩니다
      </div>
    );
  }

  // 종목 리스트: 금액 내림차순
  const sortedItems = [...stockItems].sort((a, b) => b.valueKRW - a.valueKRW);

  return (
    <div className="flex flex-col">
      {/* 도넛 차트 — 섹터별 색상 */}
      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
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
              {donutData.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl leading-none mb-1">{account.icon}</span>
          <p className="text-[11px] font-semibold text-[var(--foreground)]">{account.name}</p>
          <p className="text-[11px] text-[var(--muted)] tabular-nums mt-0.5">{fmtKRW(total)}</p>
        </div>
      </div>

      {/* 종목별 리스트 (섹터 색상 표시) */}
      <div className="mt-4 flex flex-col divide-y divide-[var(--border-subtle)]">
        {sortedItems.map((item) => {
          const pct = ((item.valueKRW / total) * 100).toFixed(1);
          return (
            <div key={item.ticker} className="flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--foreground)] truncate font-medium">{item.name}</p>
                  <p className="text-[10px] text-[var(--muted)]">{item.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-[var(--muted)] tabular-nums w-10 text-right">{pct}%</span>
                <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums w-28 text-right">
                  {fmtDisplay(item)}
                </span>
              </div>
            </div>
          );
        })}

        {/* 현금 항목 */}
        {totalCashKRW > 0 && (
          <div className="flex items-center justify-between py-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SECTOR_COLORS["현금"] }} />
              <div>
                <p className="text-xs text-[var(--foreground)] font-medium">현금(예수금)</p>
                <p className="text-[10px] text-[var(--muted)]">현금</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-xs text-[var(--muted)] tabular-nums w-10 text-right">
                {((totalCashKRW / total) * 100).toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums w-28 text-right">
                {fmtKRW(totalCashKRW)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
