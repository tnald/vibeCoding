"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface CashPanelProps {
  cashKRW: number;
  cashUSD: number;
  onUpdate: (deltaKRW: number, deltaUSD: number) => void;
}

export default function CashPanel({ cashKRW, cashUSD, onUpdate }: CashPanelProps) {
  const [currency, setCurrency] = useState<"KRW" | "USD">("KRW");
  const [amount, setAmount] = useState("");

  const handleAction = (type: "deposit" | "withdraw") => {
    const value = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(value) || value <= 0) return;

    const delta = type === "deposit" ? value : -value;
    if (currency === "KRW") onUpdate(delta, 0);
    else onUpdate(0, delta);
    setAmount("");
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">현금 관리</h3>

      {/* 잔액 표시 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[var(--background)] rounded-xl p-3.5">
          <p className="text-[10px] text-[var(--muted)] mb-1.5">원화 (KRW)</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {cashKRW.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div className="flex-1 bg-[var(--background)] rounded-xl p-3.5">
          <p className="text-[10px] text-[var(--muted)] mb-1.5">달러 (USD)</p>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            ${cashUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* 통화 탭 */}
      <div className="flex gap-1.5 mb-3 bg-[var(--background)] p-1 rounded-xl">
        <button
          onClick={() => setCurrency("KRW")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
            ${currency === "KRW"
              ? "bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          ₩ KRW
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
            ${currency === "USD"
              ? "bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          $ USD
        </button>
      </div>

      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={currency === "KRW" ? "금액 입력 (원)" : "금액 입력 ($)"}
        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
          text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
          focus:outline-none focus:border-[var(--accent)]/60 transition-colors mb-3"
      />

      <div className="flex gap-2">
        <button
          onClick={() => handleAction("deposit")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20
            text-emerald-400 py-2.5 rounded-xl text-xs font-medium transition-colors border border-emerald-500/20"
        >
          <ArrowDownCircle size={13} />
          입금
        </button>
        <button
          onClick={() => handleAction("withdraw")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--border)] hover:bg-[var(--surface-elevated)]
            text-[var(--muted)] hover:text-[var(--foreground)] py-2.5 rounded-xl text-xs font-medium transition-colors"
        >
          <ArrowUpCircle size={13} />
          출금
        </button>
      </div>
    </div>
  );
}
