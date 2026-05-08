"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Account } from "@/types";

const ICON_OPTIONS = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧓", "🐶", "🐱", "🦊", "🐻", "🌟", "💼", "🏦", "💰"];

interface AddAccountModalProps {
  onClose: () => void;
  onAdd: (account: Account) => void;
}

export default function AddAccountModal({ onClose, onAdd }: AddAccountModalProps) {
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      icon,
      cashKRW: 0,
      cashUSD: 0,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">새 계좌 추가</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">계좌 정보를 입력해주세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)]
              hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* 아이콘 선택 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-2 block">아이콘 선택</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`relative h-10 rounded-xl text-lg transition-all
                    ${icon === emoji
                      ? "bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]"
                      : "bg-[var(--border)] hover:bg-[var(--surface)] "
                    }`}
                >
                  {emoji}
                  {icon === emoji && (
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-[var(--accent)] rounded-full flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 홍길동"
              autoFocus
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/20
                transition-colors"
            />
          </div>

          {/* 계좌번호 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">
              계좌번호 <span className="text-[var(--muted)]/60">(선택)</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="예) 123-456-789"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/20
                transition-colors"
            />
          </div>

          {/* 미리보기 */}
          {name && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-lg">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{name}</p>
                <p className="text-xs text-[var(--muted)]">{accountNumber || "계좌번호 없음"}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-40
              text-white rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            계좌 추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
