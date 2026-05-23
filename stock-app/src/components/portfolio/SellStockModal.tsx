"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";
import { Stock, Sector } from "@/types";

interface Props {
  ticker: string;
  name: string;
  market: "KR" | "US";
  sector: Sector;
  currency: "KRW" | "USD";
  accountId: string;
  maxQuantity: number;
  onClose: () => void;
  onSell: (sell: Stock) => Promise<void>;
}

export default function SellStockModal({
  ticker, name, market, sector, currency, accountId, maxQuantity, onClose, onSell,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(today);
  const [price, setPrice] = useState("");
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [saving, setSaving] = useState(false);

  const fmt = (v: number) =>
    currency === "KRW"
      ? `₩${Math.round(v).toLocaleString("ko-KR")}`
      : `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fetchPrice = useCallback(async (d: string) => {
    setFetchingPrice(true);
    setPriceError("");
    try {
      const isToday = d === today;
      const url = isToday
        ? `/api/price?ticker=${ticker}&market=${market}`
        : `/api/price?ticker=${ticker}&market=${market}&date=${d}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPrice(String(data.price));
    } catch {
      setPriceError("가격 조회 실패. 직접 입력하세요.");
    } finally {
      setFetchingPrice(false);
    }
  }, [ticker, market, today]);

  useEffect(() => {
    fetchPrice(date);
  }, [date, fetchPrice]);

  const handleSell = async () => {
    const qty = parseInt(quantity);
    const pr = parseFloat(price);
    if (!qty || qty <= 0 || qty > maxQuantity || !pr || pr <= 0) return;

    setSaving(true);
    try {
      const sell: Stock = {
        id: crypto.randomUUID(),
        accountId,
        ticker,
        name,
        market,
        sector,
        quantity: -qty,
        avgPrice: pr,
        currency,
        buyDate: date,
      };
      await onSell(sell);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const qty = parseInt(quantity) || 0;
  const pr = parseFloat(price) || 0;
  const totalValue = qty * pr;
  const isQtyValid = qty > 0 && qty <= maxQuantity;
  const canConfirm = isQtyValid && pr > 0 && !fetchingPrice && !saving;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">매도</h3>
              <p className="text-[11px] text-[var(--muted)]">{name} · {ticker}</p>
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

        <div className="p-5 flex flex-col gap-4">
          {/* 보유 수량 표시 */}
          <div className="bg-[var(--background)] rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-[11px] text-[var(--muted)]">현재 보유량</p>
            <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">
              {maxQuantity.toLocaleString()}주
            </p>
          </div>

          {/* 수량 */}
          <div>
            <label className="text-[11px] font-medium text-[var(--muted)] mb-1.5 block">
              매도 수량
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              max={maxQuantity}
              placeholder={`1 ~ ${maxQuantity}`}
              autoFocus
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
            {quantity && qty > maxQuantity && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> 보유 수량({maxQuantity}주)을 초과할 수 없습니다
              </p>
            )}
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-[11px] font-medium text-[var(--muted)] mb-1.5 block">매도 날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                px-3 py-2.5 text-sm text-[var(--foreground)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
          </div>

          {/* 매도가 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1.5">
                매도가
                {fetchingPrice && <Loader2 size={9} className="animate-spin text-[var(--accent)]" />}
              </label>
              <button
                onClick={() => fetchPrice(date)}
                disabled={fetchingPrice}
                className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5 disabled:opacity-40"
              >
                <RefreshCw size={9} /> 재조회
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
                {currency === "KRW" ? "₩" : "$"}
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="자동 조회됩니다"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                  pl-7 pr-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            </div>
            {priceError && (
              <p className="text-[11px] text-[var(--muted)] mt-1">{priceError}</p>
            )}
          </div>

          {/* 예상 매도금액 */}
          {isQtyValid && pr > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3
              flex items-center justify-between">
              <p className="text-[11px] text-[var(--muted)]">예상 매도금액</p>
              <p className="text-sm font-bold text-blue-400 tabular-nums">{fmt(totalValue)}</p>
            </div>
          )}

          {/* 확인 버튼 */}
          <button
            onClick={handleSell}
            disabled={!canConfirm}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40
              text-white rounded-xl py-2.5 text-sm font-medium transition-all
              flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            매도 확정
          </button>
        </div>
      </div>
    </div>
  );
}
