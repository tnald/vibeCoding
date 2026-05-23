"use client";

import { useState } from "react";
import { X, TrendingUp, Calendar, Hash, DollarSign, Check, Loader2 } from "lucide-react";
import { Stock, StockQuote } from "@/types";

interface Props {
  ticker: string;
  name: string;
  market: "KR" | "US";
  transactions: Stock[];
  quote: StockQuote | null;
  onClose: () => void;
  onUpdateDate?: (id: string, buyDate: string) => Promise<void>;
}

export default function StockTransactionModal({ ticker, name, market, transactions, quote, onClose, onUpdateDate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

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

  const startEdit = (tx: Stock) => {
    if (!onUpdateDate) return;
    setEditingId(tx.id);
    setEditDate(tx.buyDate.slice(0, 10));
  };

  const confirmEdit = async (id: string) => {
    if (!onUpdateDate || !editDate) return;
    setSaving(true);
    try {
      await onUpdateDate(id, editDate);
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate("");
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
            const isEditing = editingId === tx.id;

            return (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-6 py-3.5 items-center
                  border-b border-[var(--border-subtle)] last:border-0
                  hover:bg-[var(--background)]/40 transition-colors"
              >
                {/* 날짜 */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                    <TrendingUp size={10} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          max={new Date().toISOString().slice(0, 10)}
                          autoFocus
                          className="w-[110px] bg-[var(--background)] border border-[var(--accent)]/50 rounded-lg
                            px-1.5 py-0.5 text-[11px] text-[var(--foreground)]
                            focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                        <button
                          onClick={() => confirmEdit(tx.id)}
                          disabled={saving}
                          className="w-5 h-5 flex items-center justify-center rounded-md
                            bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-colors"
                        >
                          {saving ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-5 h-5 flex items-center justify-center rounded-md
                            text-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                        >
                          <X size={9} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(tx)}
                        className={`text-[11px] font-medium text-[var(--foreground)] text-left
                          hover:text-[var(--accent)] transition-colors
                          ${onUpdateDate ? "cursor-pointer underline-offset-2 hover:underline" : "cursor-default"}`}
                        title={onUpdateDate ? "클릭하여 날짜 수정" : undefined}
                      >
                        {fmtDate(tx.buyDate)}
                      </button>
                    )}
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
