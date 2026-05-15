"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, Sun, Moon, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { Account } from "@/types";

interface DashboardHeaderProps {
  account: Account;
  displayCurrency: "KRW" | "USD";
  onCurrencyToggle: () => void;
  onCashUpdate: (deltaKRW: number, deltaUSD: number) => void;
}

export default function DashboardHeader({
  account,
  displayCurrency,
  onCurrencyToggle,
  onCashUpdate,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showCash, setShowCash] = useState(false);
  const [currency, setCurrency] = useState<"KRW" | "USD">("KRW");
  const [amount, setAmount] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCash(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAction = (type: "deposit" | "withdraw") => {
    const value = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(value) || value <= 0) return;
    const delta = type === "deposit" ? value : -value;
    if (currency === "KRW") onCashUpdate(delta, 0);
    else onCashUpdate(0, delta);
    setAmount("");
  };

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)]">
      {/* 좌측: 계좌 정보 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-lg">
          {account.icon}
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[var(--foreground)]">{account.name}</h1>
          <p className="text-xs text-[var(--muted)]">{account.accountNumber || "계좌번호 미등록"}</p>
        </div>
        <div className="h-4 w-px bg-[var(--border)] mx-1" />
        <p className="text-xs text-[var(--muted)]">{dateStr}</p>
      </div>

      {/* 우측 */}
      <div className="flex items-center gap-2">
        {/* 통화 토글 */}
        <button
          onClick={onCurrencyToggle}
          className="flex items-center gap-0.5 bg-[var(--surface-elevated)] border border-[var(--border)]
            rounded-xl p-1 transition-colors hover:border-[var(--accent)]/40"
          title="통화 전환"
        >
          {(["KRW", "USD"] as const).map((c) => (
            <span
              key={c}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${displayCurrency === c
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
              {c === "KRW" ? "₩ 원화" : "$ 달러"}
            </span>
          ))}
        </button>

        {/* 현금 관리 드롭다운 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCash((v) => !v)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors
              ${showCash
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
              }`}
            title="현금 관리"
          >
            <Wallet size={15} />
          </button>

          {showCash && (
            <div className="absolute right-0 top-11 w-72 bg-[var(--surface)] border border-[var(--border)]
              rounded-2xl shadow-xl z-50 p-4">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-3">현금 관리</p>

              {/* 잔액 */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-[var(--background)] rounded-xl p-3">
                  <p className="text-[10px] text-[var(--muted)] mb-1">원화</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                    ₩{Math.round(account.cashKRW).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div className="flex-1 bg-[var(--background)] rounded-xl p-3">
                  <p className="text-[10px] text-[var(--muted)] mb-1">달러</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                    ${account.cashUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* 통화 탭 */}
              <div className="flex gap-1 mb-2.5 bg-[var(--background)] p-1 rounded-xl">
                {(["KRW", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${currency === c
                        ? "bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                  >
                    {c === "KRW" ? "₩ KRW" : "$ USD"}
                  </button>
                ))}
              </div>

              {/* 금액 입력 */}
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction("deposit")}
                placeholder={currency === "KRW" ? "금액 입력 (원)" : "금액 입력 ($)"}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2
                  text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors mb-2.5"
                autoFocus
              />

              {/* 입금 / 출금 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("deposit")}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10
                    hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-xl text-xs font-medium
                    transition-colors border border-emerald-500/20"
                >
                  <ArrowDownCircle size={13} />
                  입금
                </button>
                <button
                  onClick={() => handleAction("withdraw")}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--border)]
                    hover:bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--foreground)]
                    py-2 rounded-xl text-xs font-medium transition-colors"
                >
                  <ArrowUpCircle size={13} />
                  출금
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 다크/라이트 모드 */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)]
            hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-colors"
          title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)]
            hover:bg-[var(--surface-elevated)] hover:text-red-400 transition-colors"
          title="로그아웃"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
