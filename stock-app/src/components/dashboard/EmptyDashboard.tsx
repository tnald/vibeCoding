"use client";

import { TrendingUp, Users, BarChart3, Wallet } from "lucide-react";

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

export default function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
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
  );
}
