"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Account, Stock, StockQuote, Sector } from "@/types";
import AddStockModal from "./AddStockModal";

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

interface Props {
  market: "KR" | "US";
  account: Account;
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  onAddStock: (stock: Stock) => void;
  onDeleteStock: (id: string) => void;
}

export default function StockListSection({
  market, account, stocks, quotes, onAddStock, onDeleteStock,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const filtered = stocks.filter((s) => s.market === market);

  const fmtKR = (v: number) => `₩${Math.round(v).toLocaleString("ko-KR")}`;
  const fmtUS = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-base">{market === "KR" ? "🇰🇷" : "🇺🇸"}</span>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {market === "KR" ? "국내 주식" : "해외 주식"}
          </h2>
          <span className="text-xs text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-lg">
            {filtered.length}종목
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90
            text-white text-xs px-3.5 py-2 rounded-xl transition-colors font-medium"
        >
          <Plus size={13} />
          종목 추가
        </button>
      </div>

      {/* 빈 상태 */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--muted)]">보유 종목이 없습니다</p>
          <p className="text-xs text-[var(--muted)] mt-1 opacity-60">종목 추가 버튼으로 주식을 등록하세요</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-[var(--muted)] border-b border-[var(--border-subtle)]">
              <th className="text-left py-2.5 px-5 font-medium">종목명</th>
              <th className="text-left py-2.5 px-4 font-medium">섹터</th>
              <th className="text-right py-2.5 px-4 font-medium">보유량</th>
              <th className="text-right py-2.5 px-4 font-medium">평균단가</th>
              <th className="text-right py-2.5 px-4 font-medium">현재가</th>
              <th className="text-right py-2.5 px-4 font-medium">평가금액</th>
              <th className="text-right py-2.5 px-4 font-medium">평가손익</th>
              <th className="text-right py-2.5 px-4 font-medium">수익률</th>
              <th className="py-2.5 px-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock) => {
              const cur = quotes[stock.ticker]?.price ?? stock.avgPrice;
              const evalValue = cur * stock.quantity;
              const profit = (cur - stock.avgPrice) * stock.quantity;
              const returnPct =
                stock.avgPrice > 0 ? ((cur - stock.avgPrice) / stock.avgPrice) * 100 : 0;
              const isUp = profit >= 0;
              const fmt = stock.currency === "USD" ? fmtUS : fmtKR;

              return (
                <tr
                  key={stock.id}
                  className="border-b border-[var(--border-subtle)] last:border-0
                    hover:bg-[var(--background)]/50 transition-colors group"
                >
                  {/* 종목명 */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0
                        ${market === "KR"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-amber-500/15 text-amber-400"}`}>
                        {market}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{stock.name}</p>
                        <p className="text-[10px] text-[var(--muted)]">{stock.ticker}</p>
                      </div>
                    </div>
                  </td>
                  {/* 섹터 */}
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${SECTOR_COLORS[stock.sector]}`}>
                      {stock.sector}
                    </span>
                  </td>
                  {/* 보유량 */}
                  <td className="py-3.5 px-4 text-right text-sm text-[var(--foreground)] tabular-nums">
                    {stock.quantity.toLocaleString()}주
                  </td>
                  {/* 평균단가 */}
                  <td className="py-3.5 px-4 text-right text-sm text-[var(--muted)] tabular-nums">
                    {fmt(stock.avgPrice)}
                  </td>
                  {/* 현재가 */}
                  <td className="py-3.5 px-4 text-right text-sm font-medium text-[var(--foreground)] tabular-nums">
                    {fmt(cur)}
                  </td>
                  {/* 평가금액 */}
                  <td className="py-3.5 px-4 text-right text-sm text-[var(--foreground)] tabular-nums">
                    {fmt(evalValue)}
                  </td>
                  {/* 평가손익 */}
                  <td className="py-3.5 px-4 text-right tabular-nums">
                    <span className={`text-sm font-semibold ${isUp ? "text-red-400" : "text-blue-400"}`}>
                      {isUp ? "+" : ""}{fmt(profit)}
                    </span>
                  </td>
                  {/* 수익률 */}
                  <td className="py-3.5 px-4 text-right tabular-nums">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg
                      ${isUp ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {isUp ? "+" : ""}{returnPct.toFixed(2)}%
                    </span>
                  </td>
                  {/* 삭제 */}
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => onDeleteStock(stock.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center
                        rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <AddStockModal
          accountId={account.id}
          onClose={() => setShowModal(false)}
          onAdd={(stock) => {
            onAddStock(stock);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
