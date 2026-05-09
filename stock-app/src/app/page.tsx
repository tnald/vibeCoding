"use client";

import { useState } from "react";
import { Account, Stock, StockQuote, Sector } from "@/types";
import { formatAsset, formatProfit } from "@/hooks/useCurrencyFormat";
import AccountSidebar from "@/components/sidebar/AccountSidebar";
import PortfolioTable from "@/components/portfolio/PortfolioTable";
import CashPanel from "@/components/portfolio/CashPanel";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";
import AssetOverviewSection from "@/components/dashboard/AssetOverviewSection";

const USD_TO_KRW = 1380;

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotes] = useState<Record<string, StockQuote>>({});
  const [displayCurrency, setDisplayCurrency] = useState<"KRW" | "USD">("KRW");

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

  // 핵심 집계값 (모두 KRW 기준)
  const stockValueKRW = accountStocks.reduce((sum, s) => {
    const price = (quotes[s.ticker]?.price ?? s.avgPrice);
    return sum + (s.currency === "USD" ? price * s.quantity * USD_TO_KRW : price * s.quantity);
  }, 0);

  const totalProfitKRW = accountStocks.reduce((sum, s) => {
    const cur = quotes[s.ticker]?.price ?? s.avgPrice;
    const profit = (cur - s.avgPrice) * s.quantity;
    return sum + (s.currency === "USD" ? profit * USD_TO_KRW : profit);
  }, 0);

  const investedKRW = accountStocks.reduce((sum, s) => {
    const val = s.avgPrice * s.quantity;
    return sum + (s.currency === "USD" ? val * USD_TO_KRW : val);
  }, 0);

  const totalAssetKRW =
    stockValueKRW + (selectedAccount?.cashKRW ?? 0) + (selectedAccount?.cashUSD ?? 0) * USD_TO_KRW;

  const profitPercent = investedKRW > 0 ? (totalProfitKRW / investedKRW) * 100 : 0;
  const isUp = totalProfitKRW >= 0;

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
          <div className="flex flex-col">
            {/* 헤더 (통화 토글 포함) */}
            <DashboardHeader
              account={selectedAccount}
              displayCurrency={displayCurrency}
              onCurrencyToggle={() =>
                setDisplayCurrency((c) => (c === "KRW" ? "USD" : "KRW"))
              }
            />

            <div className="px-8 pb-10 pt-6 space-y-5">

              {/* ① 전체 자산 오버뷰 (파이 + 선 그래프 포함) */}
              <AssetOverviewSection
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                stockValueKRW={stockValueKRW}
                totalProfitKRW={totalProfitKRW}
                displayCurrency={displayCurrency}
              />

              {/* ② 요약 스탯 카드 4개 */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="총 자산"
                  value={formatAsset(totalAssetKRW, displayCurrency)}
                  sub="현금 + 주식"
                />
                <StatCard
                  label="평가손익"
                  value={formatProfit(totalProfitKRW, displayCurrency)}
                  change={profitPercent}
                  highlight={isUp ? "up" : "down"}
                />
                <StatCard
                  label="보유 종목"
                  value={`${accountStocks.length}개`}
                  sub={`🇰🇷 ${accountStocks.filter((s) => s.market === "KR").length} · 🇺🇸 ${accountStocks.filter((s) => s.market === "US").length}`}
                />
                <StatCard
                  label="현금 잔액"
                  value={formatAsset(
                    (selectedAccount.cashKRW) + selectedAccount.cashUSD * USD_TO_KRW,
                    displayCurrency
                  )}
                  sub={`₩${Math.round(selectedAccount.cashKRW).toLocaleString()} · $${selectedAccount.cashUSD.toFixed(2)}`}
                />
              </div>

              {/* ③ 포트폴리오 테이블 */}
              <PortfolioTable
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                usdToKrw={USD_TO_KRW}
                onAddStock={handleAddStock}
                onDeleteStock={handleDeleteStock}
                onSectorChange={handleSectorChange}
              />

              {/* ④ 현금 관리 */}
              <div className="max-w-sm">
                <CashPanel
                  cashKRW={selectedAccount.cashKRW}
                  cashUSD={selectedAccount.cashUSD}
                  onUpdate={handleCashUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
