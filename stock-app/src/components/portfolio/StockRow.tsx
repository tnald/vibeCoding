"use client";

import { Trash2 } from "lucide-react";
import { Stock, StockQuote, Sector } from "@/types";

const SECTORS: Sector[] = ["반도체", "전력", "바이오", "IT", "금융", "소비재", "에너지", "기타"];

const SECTOR_COLORS: Record<Sector, string> = {
  반도체: "bg-violet-500/10 text-violet-400",
  전력: "bg-yellow-500/10 text-yellow-400",
  바이오: "bg-emerald-500/10 text-emerald-400",
  IT: "bg-blue-500/10 text-blue-400",
  금융: "bg-orange-500/10 text-orange-400",
  소비재: "bg-pink-500/10 text-pink-400",
  에너지: "bg-green-500/10 text-green-400",
  기타: "bg-slate-500/10 text-slate-400",
};

interface StockRowProps {
  stock: Stock;
  quote: StockQuote | null;
  onDelete: (id: string) => void;
  onSectorChange: (id: string, sector: Sector) => void;
}

export default function StockRow({ stock, quote, onDelete, onSectorChange }: StockRowProps) {
  const currentPrice = quote?.price ?? stock.avgPrice;
  const profitPerShare = currentPrice - stock.avgPrice;
  const totalProfit = profitPerShare * stock.quantity;
  const totalValue = currentPrice * stock.quantity;
  const profitPercent = stock.avgPrice > 0
    ? ((profitPerShare / stock.avgPrice) * 100)
    : 0;
  const isUp = totalProfit >= 0;
  const isFlat = totalProfit === 0;

  const fmtPrice = (price: number) =>
    stock.currency === "KRW"
      ? `${Math.round(price).toLocaleString("ko-KR")}원`
      : `$${price.toFixed(2)}`;

  const profitColor = isFlat
    ? "text-[var(--muted)]"
    : isUp
    ? "text-red-400"
    : "text-blue-400";

  return (
    <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]/40 transition-colors group">

      {/* 종목 */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0
            ${stock.market === "KR" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
            {stock.market === "KR" ? "🇰🇷" : "🇺🇸"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] font-mono">{stock.ticker}</p>
            <p className="text-[11px] text-[var(--muted)] truncate max-w-[120px]">{stock.name}</p>
          </div>
        </div>
      </td>

      {/* 섹터 */}
      <td className="py-3.5 px-4">
        <div className="relative">
          <select
            value={stock.sector}
            onChange={(e) => onSectorChange(stock.id, e.target.value as Sector)}
            className={`appearance-none text-[11px] font-medium rounded-lg px-2.5 py-1 border-none
              focus:outline-none cursor-pointer transition-colors ${SECTOR_COLORS[stock.sector]}`}
            style={{ background: "transparent" }}
          >
            {SECTORS.map((s) => (
              <option key={s} value={s} className="bg-[#1a1e28] text-[var(--foreground)]">{s}</option>
            ))}
          </select>
        </div>
      </td>

      {/* 현재가 */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm text-[var(--foreground)] tabular-nums">{fmtPrice(currentPrice)}</p>
        {quote ? (
          <p className={`text-[11px] tabular-nums ${quote.changePercent >= 0 ? "text-red-400" : "text-blue-400"}`}>
            {quote.changePercent >= 0 ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
          </p>
        ) : (
          <p className="text-[11px] text-[var(--muted)]">매수가 기준</p>
        )}
      </td>

      {/* 수량 */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm text-[var(--foreground)] tabular-nums">{stock.quantity.toLocaleString()}주</p>
        <p className="text-[11px] text-[var(--muted)] tabular-nums">{fmtPrice(stock.avgPrice)}</p>
      </td>

      {/* 평가금액 */}
      <td className="py-3.5 px-4 text-right">
        <p className="text-sm text-[var(--foreground)] tabular-nums">{fmtPrice(totalValue)}</p>
        <p className="text-[11px] text-[var(--muted)]">평가금액</p>
      </td>

      {/* 평가손익 */}
      <td className="py-3.5 px-4 text-right">
        <p className={`text-sm font-semibold tabular-nums ${profitColor}`}>
          {!isFlat && (isUp ? "+" : "")}{fmtPrice(totalProfit)}
        </p>
        <p className={`text-[11px] tabular-nums font-medium ${profitColor}`}>
          {!isFlat && (isUp ? "+" : "")}{profitPercent.toFixed(2)}%
        </p>
      </td>

      {/* 삭제 */}
      <td className="py-3.5 px-4 text-right">
        <button
          onClick={() => onDelete(stock.id)}
          className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-400 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}
