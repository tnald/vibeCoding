"use client";

import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { Account } from "@/types";
import AddAccountModal from "./AddAccountModal";

interface AccountSidebarProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (account: Account) => void;
}

export default function AccountSidebar({
  accounts,
  selectedId,
  onSelect,
  onAdd,
}: AccountSidebarProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="w-64 shrink-0 flex flex-col h-screen bg-[var(--surface)] border-r border-[var(--border)]">
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
            PortfolioX
          </span>
        </div>

        {/* 계좌 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest px-2 mb-3">
            계좌
          </p>

          <div className="flex flex-col gap-0.5">
            {accounts.length === 0 && (
              <p className="text-xs text-[var(--muted)] px-2 py-3 text-center">
                아직 계좌가 없습니다
              </p>
            )}

            {accounts.map((account) => {
              const isSelected = selectedId === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => onSelect(account.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                    ${isSelected
                      ? "bg-[var(--surface-elevated)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                    }`}
                >
                  {/* 아바타 */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0
                    ${isSelected ? "bg-[var(--accent)]/15" : "bg-[var(--border)]"}`}>
                    {account.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-[var(--foreground)]" : ""}`}>
                      {account.name}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                      {account.accountNumber || "계좌번호 없음"}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 계좌 추가 버튼 */}
        <div className="px-3 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
              border border-dashed border-[var(--border)] text-[var(--muted)]
              hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5
              transition-all text-sm"
          >
            <Plus size={15} />
            <span>계좌 추가</span>
          </button>
        </div>
      </aside>

      {showModal && (
        <AddAccountModal
          onClose={() => setShowModal(false)}
          onAdd={(account) => {
            onAdd(account);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
