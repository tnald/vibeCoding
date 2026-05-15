"use client";

import { useRouter } from "next/navigation";
import { LogOut, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { Account } from "@/types";

interface DashboardHeaderProps {
  account: Account;
  displayCurrency: "KRW" | "USD";
  onCurrencyToggle: () => void;
}

export default function DashboardHeader({
  account,
  displayCurrency,
  onCurrencyToggle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const now = new Date();

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

      {/* 우측: 통화 토글 + 로그아웃 */}
      <div className="flex items-center gap-2">
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

        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)]
            hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-colors"
          title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

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
