"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, Calendar, Hash, DollarSign, Check, Loader2 } from "lucide-react";
import { Stock, StockQuote } from "@/types";
import SellStockModal from "./SellStockModal";

type EditField = "date" | "price";

interface Props {
  ticker: string;
  name: string;
  market: "KR" | "US";
  transactions: Stock[];
  quote: StockQuote | null;
  onClose: () => void;
  onUpdateDate?: (id: string, buyDate: string, avgPrice: number) => Promise<void>;
  onUpdatePrice?: (id: string, avgPrice: number) => Promise<void>;
  onAddSell?: (sell: Stock) => Promise<void>;
}

export default function StockTransactionModal({
  ticker, name, market, transactions, quote, onClose, onUpdateDate, onUpdatePrice, onAddSell,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<EditField>("date");
  const [editDate, setEditDate] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const currency = transactions[0]?.currency ?? (market === "KR" ? "KRW" : "USD");
  const accountId = transactions[0]?.accountId ?? "";
  const sector = transactions[0]?.sector ?? "기타";

  const fmt = (v: number) =>
    currency === "KRW"
      ? `₩${Math.round(v).toLocaleString("ko-KR")}`
      : `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const buys = transactions.filter((t) => t.quantity > 0);
  const sells = transactions.filter((t) => t.quantity < 0);
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime()
  );

  const totalBuyQty = buys.reduce((s, t) => s + t.quantity, 0);
  const totalSellQty = Math.abs(sells.reduce((s, t) => s + t.quantity, 0));
  const netQty = totalBuyQty - totalSellQty;
  const totalCost = buys.reduce((s, t) => s + t.avgPrice * t.quantity, 0);
  const avgCost = totalBuyQty > 0 ? totalCost / totalBuyQty : 0;
  const currentPrice = quote?.price ?? avgCost;
  const totalValue = currentPrice * netQty;
  const totalProfit = totalValue - avgCost * netQty;
  const returnPct = avgCost > 0 && netQty > 0 ? (totalProfit / (avgCost * netQty)) * 100 : 0;
  const isUp = totalProfit >= 0;

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
  };

  const startEdit = (tx: Stock, field: EditField) => {
    if (field === "date" && !onUpdateDate) return;
    if (field === "price" && !onUpdatePrice) return;
    setEditingId(tx.id);
    setEditField(field);
    if (field === "date") setEditDate(tx.buyDate.slice(0, 10));
    if (field === "price") setEditPrice(String(tx.avgPrice));
  };

  const confirmEdit = async (tx: Stock) => {
    setSaving(true);
    try {
      if (editField === "date" && onUpdateDate) {
        await onUpdateDate(tx.id, editDate, tx.avgPrice);
      } else if (editField === "price" && onUpdatePrice) {
        const newPrice = parseFloat(editPrice);
        if (!isNaN(newPrice) && newPrice > 0) {
          await onUpdatePrice(tx.id, newPrice);
        }
      }
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <>
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
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  매수 {buys.length}건{sells.length > 0 ? ` · 매도 ${sells.length}건` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onAddSell && netQty > 0 && (
                <button
                  onClick={() => setShowSellModal(true)}
                  className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20
                    text-blue-400 text-xs px-3 py-1.5 rounded-xl transition-colors font-medium border border-blue-500/20"
                >
                  <TrendingDown size={12} />
                  매도
                </button>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)]
                  hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* 요약 카드 */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] grid grid-cols-2 gap-3">
            <div className="bg-[var(--background)] rounded-xl px-4 py-3">
              <p className="text-[10px] text-[var(--muted)] mb-1">보유량 / 평균단가</p>
              <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">{netQty.toLocaleString()}주</p>
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

          {/* 거래 내역 */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-2 px-6 py-2.5
              text-[10px] font-medium text-[var(--muted)] border-b border-[var(--border-subtle)]
              sticky top-0 bg-[var(--surface-elevated)]">
              <span className="flex items-center gap-1"><Calendar size={9} />날짜</span>
              <span className="flex items-center gap-1"><DollarSign size={9} />단가</span>
              <span className="text-right flex items-center justify-end gap-1"><Hash size={9} />수량</span>
              <span className="text-right">금액</span>
            </div>

            {sorted.map((tx) => {
              const isSell = tx.quantity < 0;
              const displayQty = Math.abs(tx.quantity);
              const amount = tx.avgPrice * displayQty;
              const isEditing = editingId === tx.id;
              const buyIdx = buys.filter((b) => new Date(b.buyDate) <= new Date(tx.buyDate)).length;

              return (
                <div
                  key={tx.id}
                  className={`grid grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-2 px-6 py-3.5 items-center
                    border-b border-[var(--border-subtle)] last:border-0 transition-colors
                    ${isSell ? "hover:bg-blue-500/5" : "hover:bg-[var(--background)]/40"}`}
                >
                  {/* 날짜 */}
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0
                      ${isSell ? "bg-blue-500/10" : "bg-[var(--accent)]/10"}`}>
                      {isSell
                        ? <TrendingDown size={10} className="text-blue-400" />
                        : <TrendingUp size={10} className="text-[var(--accent)]" />}
                    </div>
                    <div className="min-w-0">
                      {!isSell && isEditing && editField === "date" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            max={new Date().toISOString().slice(0, 10)}
                            autoFocus
                            className="w-[108px] bg-[var(--background)] border border-[var(--accent)]/50 rounded-lg
                              px-1.5 py-0.5 text-[11px] text-[var(--foreground)]
                              focus:outline-none focus:border-[var(--accent)] transition-colors"
                          />
                          <button onClick={() => confirmEdit(tx)} disabled={saving}
                            className="w-5 h-5 flex items-center justify-center rounded-md
                              bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-colors">
                            {saving ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />}
                          </button>
                          <button onClick={cancelEdit}
                            className="w-5 h-5 flex items-center justify-center rounded-md
                              text-[var(--muted)] hover:bg-[var(--border)] transition-colors">
                            <X size={9} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => !isSell && startEdit(tx, "date")}
                          className={`text-[11px] font-medium text-left transition-colors
                            ${!isSell && onUpdateDate
                              ? "text-[var(--foreground)] hover:text-[var(--accent)] cursor-pointer underline-offset-2 hover:underline"
                              : "text-[var(--foreground)] cursor-default"}`}
                        >
                          {fmtDate(tx.buyDate)}
                        </button>
                      )}
                      <p className={`text-[9px] mt-0.5 ${isSell ? "text-blue-400/70" : "text-[var(--muted)]"}`}>
                        {isSell ? "매도" : `매수 #${buyIdx}`}
                      </p>
                    </div>
                  </div>

                  {/* 단가 (클릭 시 수정) */}
                  <div>
                    {!isSell && isEditing && editField === "price" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          min="0"
                          step="any"
                          autoFocus
                          className="w-[90px] bg-[var(--background)] border border-[var(--accent)]/50 rounded-lg
                            px-1.5 py-0.5 text-[11px] text-[var(--foreground)]
                            focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                        <button onClick={() => confirmEdit(tx)} disabled={saving}
                          className="w-5 h-5 flex items-center justify-center rounded-md
                            bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-colors">
                          {saving ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />}
                        </button>
                        <button onClick={cancelEdit}
                          className="w-5 h-5 flex items-center justify-center rounded-md
                            text-[var(--muted)] hover:bg-[var(--border)] transition-colors">
                          <X size={9} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => !isSell && startEdit(tx, "price")}
                        className={`text-sm tabular-nums font-medium transition-colors text-left
                          ${!isSell && onUpdatePrice
                            ? "text-[var(--foreground)] hover:text-[var(--accent)] cursor-pointer underline-offset-2 hover:underline"
                            : isSell ? "text-blue-400" : "text-[var(--foreground)] cursor-default"}`}
                      >
                        {fmt(tx.avgPrice)}
                      </button>
                    )}
                  </div>

                  {/* 수량 */}
                  <p className={`text-sm text-right tabular-nums ${isSell ? "text-blue-400" : "text-[var(--foreground)]"}`}>
                    {isSell ? "-" : "+"}{displayQty.toLocaleString()}
                    <span className="text-[10px] text-[var(--muted)] ml-0.5">주</span>
                  </p>

                  {/* 금액 */}
                  <p className={`text-sm text-right tabular-nums ${isSell ? "text-blue-400/70" : "text-[var(--muted)]"}`}>
                    {fmt(amount)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">총 매수금액</p>
            <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">{fmt(totalCost)}</p>
          </div>
        </div>
      </div>

      {showSellModal && (
        <SellStockModal
          ticker={ticker}
          name={name}
          market={market}
          sector={sector}
          currency={currency}
          accountId={accountId}
          maxQuantity={netQty}
          onClose={() => setShowSellModal(false)}
          onSell={async (sell) => {
            await onAddSell?.(sell);
            setShowSellModal(false);
          }}
        />
      )}
    </>
  );
}
