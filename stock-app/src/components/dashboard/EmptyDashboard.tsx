"use client";

import { TrendingUp, Users, BarChart3, Wallet, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: Users,
    title: "멀티 계좌 관리",
    desc: "여러 계좌를 한 곳에서 관리",
  },
  {
    icon: TrendingUp,
    title: "실시간 손익 계산",
    desc: "한국·미국 주식 수익률 추적",
  },
  {
    icon: BarChart3,
    title: "섹터별 분류",
    desc: "반도체·바이오 등 섹터 분석",
  },
  {
    icon: Wallet,
    title: "자산 시각화",
    desc: "현금·주식 비중 그래프",
  },
];

interface Props {
  onMenuToggle?: () => void;
}

export default function EmptyDashboard({ onMenuToggle }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[var(--border-subtle)]">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)]
            hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="hidden md:block" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-red-400
            px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={13} />
          로그아웃
        </button>
      </div>

      {/* 본문 */}
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20
          flex items-center justify-center mb-5">
          <TrendingUp size={24} className="text-[var(--accent)]" />
        </div>

        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1.5">
          계좌를 선택해주세요
        </h2>
        <p className="text-sm text-[var(--muted)] mb-10 max-w-xs">
          좌측 사이드바에서 계좌를 선택하거나,
          <br />새 계좌를 추가하여 시작하세요.
        </p>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--border)] flex items-center justify-center mb-3">
                <Icon size={14} className="text-[var(--muted)]" />
              </div>
              <p className="text-xs font-medium text-[var(--foreground)] mb-0.5">{title}</p>
              <p className="text-[11px] text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
