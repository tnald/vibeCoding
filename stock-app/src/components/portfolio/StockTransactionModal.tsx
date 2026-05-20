"use client";

import { X, TrendingUp, Calendar, Hash, DollarSign } from "lucide-react";
import { Stock, StockQuote } from "@/types";

interface Props {
  ticker: string;
  name: string;
  market: "KR" | "US";
  transactions: Stock[];
  quote: StockQuote | null;
  onClose: () => void;
}

export default function StockTransactionModal({ ticker, name, market, transactions, quote, onClose }: Props) {
  const currency = transactions[0]?.currency ?? (market === "KR" ? "KRW" : "USD");

  const fmt = (v: number) =>
    currency === "KRW"
      ? `₩${Math.round(v).toLocaleString("ko-KR")}`
      : `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime()
  );

  const totalQty = sorted.reduce((s, t) => s + t.quantity, 0);
  const totalCost = sorted.reduce((s, t) => s + t.avgPrice * t.quantity, 0);
  const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
  const currentPrice = quote?.price ?? avgCost;
  const totalValue = currentPrice * totalQty;
  const totalProfit = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const isUp = totalProfit >= 0;

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm
              ${market === "KR" ? "bg-blue-500/10" : "bg-amber-500/10"}`}>
              {market === "KR" ? "🇰🇷" : "🇺🇸"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[var(--foreground)] font-mono">{ticker}</h2>
                <span className="text-xs text-[var(--muted)]">{name}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">거래 내역 {sorted.length}건</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)]
              hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] grid grid-cols-2 gap-3">
          <div className="bg-[var(--background)] rounded-xl px-4 py-3">
            <p className="text-[10px] text-[var(--muted)] mb-1">총 보유량 / 평균단가</p>
            <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">{totalQty.toLocaleString()}주</p>
            <p className="text-xs text-[var(--muted)] tabular-nums mt-0.5">{fmt(avgCost)}</p>
          </div>
          <div className="bg-[var(--background)] rounded-xl px-4 py-3">
            <p className="text-[10px] text-[var(--muted)] mb-1">현재가 / 평가금액</p>
            <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">{fmt(currentPrice)}</p>
            <p className="text-xs text-[var(--muted)] tabular-nums mt-0.5">{fmt(totalValue)}</p>
          </div>
          <div className="col-span-2 bg-[var(--background)] rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-[10px] text-[var(--muted)]">평가손익</p>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold tabular-nums ${isUp ? "text-red-400" : "text-blue-400"}`}>
                {isUp ? "+" : ""}{fmt(totalProfit)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg tabular-nums
                ${isUp ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                {isUp ? "+" : ""}{returnPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* 거래 내역 목록 */}
        <div className="overflow-y-auto flex-1">
          {/* 컬럼 헤더 */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-6 py-2.5 text-[10px] font-medium text-[var(--muted)] border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--surface-elevated)]">
            <span className="flex items-center gap-1"><Calendar size={9} />날짜</span>
            <span className="text-right flex items-center justify-end gap-1"><DollarSign size={9} />매수가</span>
            <span className="text-right flex items-center justify-end gap-1"><Hash size={9} />수량</span>
            <span className="text-right">매수금액</span>
          </div>

          {sorted.map((tx, i) => {
            const amount = tx.avgPrice * tx.quantity;
            return (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-6 py-3.5 items-center
                  border-b border-[var(--border-subtle)] last:border-0
                  hover:bg-[var(--background)]/40 transition-colors"
              >
                {/* 날짜 + 순서 */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[var(--accent)]/10 flex items-center justify-center">
                    <TrendingUp size={10} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[var(--foreground)]">{fmtDate(tx.buyDate)}</p>
                    <p className="text-[9px] text-[var(--muted)]">매수 #{i + 1}</p>
                  </div>
                </div>

                {/* 매수가 */}
                <p className="text-sm text-right text-[var(--foreground)] tabular-nums font-medium">
                  {fmt(tx.avgPrice)}
                </p>

                {/* 수량 */}
                <p className="text-sm text-right text-[var(--foreground)] tabular-nums">
                  {tx.quantity.toLocaleString()}<span className="text-[10px] text-[var(--muted)] ml-0.5">주</span>
                </p>

                {/* 매수금액 */}
                <p className="text-sm text-right text-[var(--muted)] tabular-nums">
                  {fmt(amount)}
                </p>
              </div>
            );
          })}
        </div>

        {/* 총 매수금액 푸터 */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">총 매수금액</p>
          <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">{fmt(totalCost)}</p>
        </div>
      </div>
    </div>
  );
}
