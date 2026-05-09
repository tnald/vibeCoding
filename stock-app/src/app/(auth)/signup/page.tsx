"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    setLoading(true);
    setError("");

    const sb = createClient();
    const { error: err } = await sb.auth.signUp({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">가입 완료!</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            이메일로 확인 링크가 발송됐습니다.<br />확인 후 로그인해주세요.
          </p>
          <Link href="/login"
            className="text-sm text-[var(--accent)] hover:underline font-medium">
            로그인 페이지로 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-3">
            <TrendingUp size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">PortfolioX</h1>
          <p className="text-sm text-[var(--muted)] mt-1">새 계정을 만들어보세요</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">이메일</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                    pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">비밀번호 (6자 이상)</label>
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
              회원가입
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
