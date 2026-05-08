"use client";

import { useState } from "react";
import { Account, Stock, StockQuote, Sector } from "@/types";
import AccountSidebar from "@/components/sidebar/AccountSidebar";
import PortfolioTable from "@/components/portfolio/PortfolioTable";
import CashPanel from "@/components/portfolio/CashPanel";
import AssetPieChart from "@/components/charts/AssetPieChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";

const USD_TO_KRW = 1380;

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotes] = useState<Record<string, StockQuote>>({});

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;
  const accountStocks = stocks.filter((s) => s.accountId === selectedAccountId);

  const handleAddAccount = (account: Account) => {
    setAccounts((prev) => [...prev, account]);
    if (!selectedAccountId) setSelectedAccountId(account.id);
  };

  const handleAddStock = (stock: Stock) => setStocks((prev) => [...prev, stock]);
  const handleDeleteStock = (id: string) => setStocks((prev) => prev.filter((s) => s.id !== id));
  const handleSectorChange = (id: string, sector: Sector) =>
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, sector } : s)));

  const handleCashUpdate = (deltaKRW: number, deltaUSD: number) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedAccountId
          ? { ...a, cashKRW: a.cashKRW + deltaKRW, cashUSD: a.cashUSD + deltaUSD }
          : a
      )
    );
  };

  const stockValueKRW = accountStocks.reduce((sum, stock) => {
    const quote = quotes[stock.ticker];
    const price = quote?.price ?? stock.avgPrice;
    const value = price * stock.quantity;
    return sum + (stock.currency === "USD" ? value * USD_TO_KRW : value);
  }, 0);

  const totalProfitKRW = accountStocks.reduce((sum, stock) => {
    const quote = quotes[stock.ticker];
    const currentPrice = quote?.price ?? stock.avgPrice;
    const profit = (currentPrice - stock.avgPrice) * stock.quantity;
    return sum + (stock.currency === "USD" ? profit * USD_TO_KRW : profit);
  }, 0);

  const totalAssetKRW = stockValueKRW +
    (selectedAccount?.cashKRW ?? 0) +
    (selectedAccount?.cashUSD ?? 0) * USD_TO_KRW;

  const profitPercent = stockValueKRW > 0
    ? (totalProfitKRW / (stockValueKRW - totalProfitKRW)) * 100
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <AccountSidebar
        accounts={accounts}
        selectedId={selectedAccountId}
        onSelect={setSelectedAccountId}
        onAdd={handleAddAccount}
      />

      <main className="flex-1 overflow-y-auto">
        {!selectedAccount ? (
          <EmptyDashboard />
        ) : (
          <div className="flex flex-col h-full">
            {/* 상단 헤더 */}
            <DashboardHeader account={selectedAccount} />

            {/* 본문 */}
            <div className="flex-1 px-8 pb-8 space-y-6">

              {/* 요약 스탯 카드 4개 */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="총 자산"
                  value={`${Math.round(totalAssetKRW).toLocaleString("ko-KR")}원`}
                  sub="현금 + 주식 합산"
                />
                <StatCard
                  label="평가손익"
                  value={`${totalProfitKRW >= 0 ? "+" : ""}${Math.round(totalProfitKRW).toLocaleString("ko-KR")}원`}
                  change={profitPercent}
                />
                <StatCard
                  label="보유 종목"
                  value={`${accountStocks.length}개`}
                  sub={`한국 ${accountStocks.filter(s => s.market === "KR").length} · 미국 ${accountStocks.filter(s => s.market === "US").length}`}
                />
                <StatCard
                  label="현금 잔액"
                  value={`${Math.round(selectedAccount.cashKRW).toLocaleString("ko-KR")}원`}
                  sub={`$${selectedAccount.cashUSD.toFixed(2)}`}
                />
              </div>

              {/* 포트폴리오 테이블 */}
              <PortfolioTable
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                usdToKrw={USD_TO_KRW}
                onAddStock={handleAddStock}
                onDeleteStock={handleDeleteStock}
                onSectorChange={handleSectorChange}
              />

              {/* 하단 패널 */}
              <div className="grid grid-cols-2 gap-4">
                <CashPanel
                  cashKRW={selectedAccount.cashKRW}
                  cashUSD={selectedAccount.cashUSD}
                  onUpdate={handleCashUpdate}
                />
                <AssetPieChart
                  cashKRW={selectedAccount.cashKRW}
                  cashUSD={selectedAccount.cashUSD}
                  stockValueKRW={stockValueKRW}
                  usdToKrw={USD_TO_KRW}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
