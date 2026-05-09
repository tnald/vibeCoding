"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  highlight?: "up" | "down" | "neutral";
}

export default function StatCard({ label, value, sub, change, highlight }: StatCardProps) {
  const isUp = change !== undefined ? change >= 0 : null;

  const valueColor =
    highlight === "up"
      ? "text-red-400"
      : highlight === "down"
      ? "text-blue-400"
      : "text-[var(--foreground)]";

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-4">
      <p className="text-[11px] text-[var(--muted)] mb-2">{label}</p>
      <p className={`text-lg font-bold tracking-tight leading-none mb-1.5 tabular-nums ${valueColor}`}>
        {value}
      </p>

      {change !== undefined && (
        <p className={`text-xs font-medium ${isUp ? "text-red-400" : "text-blue-400"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
        </p>
      )}

      {sub && change === undefined && (
        <p className="text-[11px] text-[var(--muted)]">{sub}</p>
      )}
    </div>
  );
}
