"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Account, Stock, StockQuote, Sector } from "@/types";
import StockRow from "./StockRow";
import AddStockModal from "./AddStockModal";

interface PortfolioTableProps {
  account: Account;
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  usdToKrw: number;
  onAddStock: (stock: Stock) => void;
  onDeleteStock: (id: string) => void;
  onSectorChange: (id: string, sector: Sector) => void;
}

export default function PortfolioTable({
  account,
  stocks,
  quotes,
  usdToKrw,
  onAddStock,
  onDeleteStock,
  onSectorChange,
}: PortfolioTableProps) {
  const [showModal, setShowModal] = useState(false);

  const totalProfitKRW = stocks.reduce((sum, stock) => {
    const quote = quotes[stock.ticker];
    const currentPrice = quote?.price ?? stock.avgPrice;
    const profit = (currentPrice - stock.avgPrice) * stock.quantity;
    return sum + (stock.currency === "USD" ? profit * usdToKrw : profit);
  }, 0);

  const isUp = totalProfitKRW >= 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">보유 종목</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{stocks.length}개 종목</p>
        </div>
        <div className="flex items-center gap-4">
          {stocks.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-[var(--muted)]">평가손익</p>
              <p className={`text-sm font-bold ${isUp ? "text-red-400" : "text-blue-400"}`}>
                {isUp ? "+" : ""}{Math.round(totalProfitKRW).toLocaleString("ko-KR")}원
              </p>
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90
              text-white text-xs px-3.5 py-2 rounded-xl transition-colors font-medium"
          >
            <Plus size={13} />
            종목 추가
          </button>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted)]">
          <p className="text-sm mb-1">보유 종목이 없습니다</p>
          <p className="text-xs">종목 추가 버튼을 눌러 주식을 등록하세요</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-[var(--muted)] border-b border-[var(--border-subtle)]">
              <th className="text-left py-2.5 px-5 font-medium">종목</th>
              <th className="text-left py-2.5 px-4 font-medium">섹터</th>
              <th className="text-right py-2.5 px-4 font-medium">현재가</th>
              <th className="text-right py-2.5 px-4 font-medium">수량</th>
              <th className="text-right py-2.5 px-4 font-medium">평가손익</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <StockRow
                key={stock.id}
                stock={stock}
                quote={quotes[stock.ticker] ?? null}
                onDelete={onDeleteStock}
                onSectorChange={onSectorChange}
              />
            ))}
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
