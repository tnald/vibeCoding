"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number;
}

export default function StatCard({ label, value, sub, change }: StatCardProps) {
  const isUp = change !== undefined ? change >= 0 : null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-4">
      <p className="text-xs text-[var(--muted)] mb-2">{label}</p>
      <p className="text-xl font-semibold text-[var(--foreground)] tracking-tight leading-none mb-1.5">
        {value}
      </p>

      {change !== undefined && (
        <p className={`text-xs font-medium ${isUp ? "text-red-400" : "text-blue-400"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
        </p>
      )}

      {sub && change === undefined && (
        <p className="text-xs text-[var(--muted)]">{sub}</p>
      )}
    </div>
  );
}
