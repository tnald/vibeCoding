"use client";

import { Trash2 } from "lucide-react";
import { Stock, StockQuote, Sector } from "@/types";

const SECTORS: Sector[] = ["반도체", "전력", "바이오", "IT", "금융", "소비재", "에너지", "기타"];

interface StockRowProps {
  stock: Stock;
  quote: StockQuote | null;
  onDelete: (id: string) => void;
  onSectorChange: (id: string, sector: Sector) => void;
}

export default function StockRow({
  stock,
  quote,
  onDelete,
  onSectorChange,
}: StockRowProps) {
  const currentPrice = quote?.price ?? stock.avgPrice;
  const profitPerShare = currentPrice - stock.avgPrice;
  const totalProfit = profitPerShare * stock.quantity;
  const profitPercent = ((profitPerShare / stock.avgPrice) * 100).toFixed(2);
  const isUp = totalProfit >= 0;

  const formatPrice = (price: number) =>
    stock.currency === "KRW"
      ? `${price.toLocaleString("ko-KR")}원`
      : `$${price.toFixed(2)}`;

  return (
    <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]/50 transition-colors">
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--border)] flex items-center justify-center
            text-[10px] font-bold text-[var(--muted)] shrink-0">
            {stock.market}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{stock.ticker}</p>
            <p className="text-[11px] text-[var(--muted)]">{stock.name}</p>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <select
          value={stock.sector}
          onChange={(e) => onSectorChange(stock.id, e.target.value as Sector)}
          className="bg-[var(--border)] text-[var(--muted)] text-[11px] rounded-lg px-2 py-1
            border-none focus:outline-none cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
        >
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>

      <td className="py-3.5 px-4 text-right">
        <p className="text-sm text-[var(--foreground)]">{formatPrice(currentPrice)}</p>
        {quote && (
          <p className={`text-[11px] ${isUp ? "text-red-400" : "text-blue-400"}`}>
            {isUp ? "+" : ""}{quote.changePercent.toFixed(2)}%
          </p>
        )}
      </td>

      <td className="py-3.5 px-4 text-right text-sm text-[var(--muted)]">
        {stock.quantity.toLocaleString()}주
      </td>

      <td className="py-3.5 px-4 text-right">
        <p className={`text-sm font-medium ${isUp ? "text-red-400" : "text-blue-400"}`}>
          {isUp ? "+" : ""}{formatPrice(totalProfit)}
        </p>
        <p className={`text-[11px] ${isUp ? "text-red-500/80" : "text-blue-500/80"}`}>
          {isUp ? "+" : ""}{profitPercent}%
        </p>
      </td>

      <td className="py-3.5 px-4 text-right">
        <button
          onClick={() => onDelete(stock.id)}
          className="text-[var(--muted)] hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}
