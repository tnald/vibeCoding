"use client";

import { Bell, Settings } from "lucide-react";
import { Account } from "@/types";

interface DashboardHeaderProps {
  account: Account;
}

export default function DashboardHeader({ account }: DashboardHeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)]">
      {/* 계좌 정보 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-xl">
          {account.icon}
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[var(--foreground)]">{account.name}</h1>
          <p className="text-xs text-[var(--muted)]">{account.accountNumber || "계좌번호 미등록"}</p>
        </div>
        <div className="h-4 w-px bg-[var(--border)] mx-1" />
        <p className="text-xs text-[var(--muted)]">{dateStr}</p>
      </div>

      {/* 우측 액션 */}
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)]
          hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-colors">
          <Bell size={15} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)]
          hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-colors">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
