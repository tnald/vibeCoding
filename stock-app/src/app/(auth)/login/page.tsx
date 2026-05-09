"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, User, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function toEmail(id: string) {
  return `${id.trim()}@portfoliox.app`;
}

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const sb = createClient();
    const { error: err } = await sb.auth.signInWithPassword({
      email: toEmail(id),
      password,
    });

    if (err) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-3">
            <TrendingUp size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">PortfolioX</h1>
          <p className="text-sm text-[var(--muted)] mt-1">로그인하여 포트폴리오를 관리하세요</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">아이디</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="아이디 입력"
                  required
                  autoFocus
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                    pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">비밀번호</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                    pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-50
                text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              로그인
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-[var(--accent)] hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
