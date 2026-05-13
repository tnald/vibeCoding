"use client";

import { useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useStocks } from "@/hooks/useStocks";
import { useQuotes } from "@/hooks/useQuotes";
import AccountSidebar from "@/components/sidebar/AccountSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";
import AccountSummaryCard from "@/components/dashboard/AccountSummaryCard";
import PortfolioAnalysisChart from "@/components/charts/PortfolioAnalysisChart";
import StockReturnChart from "@/components/charts/StockReturnChart";
import StockListSection from "@/components/portfolio/StockListSection";
import CashPanel from "@/components/portfolio/CashPanel";

export default function HomePage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<"KRW" | "USD">("KRW");

  const { accounts, loading: accountsLoading, addAccount, updateCash } = useAccounts();
  const { stocks: accountStocks, addStock, removeStock } = useStocks(selectedAccountId);
  const { quotes } = useQuotes(accountStocks);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;

  const handleAddAccount = async (account: Omit<typeof accounts[0], "id">) => {
    const created = await addAccount(account);
    if (!selectedAccountId) setSelectedAccountId(created.id);
  };

  const handleCashUpdate = async (deltaKRW: number, deltaUSD: number) => {
    if (!selectedAccount) return;
    await updateCash(
      selectedAccount.id,
      selectedAccount.cashKRW + deltaKRW,
      selectedAccount.cashUSD + deltaUSD
    );
  };

  if (accountsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted)]">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
            <DashboardHeader
              account={selectedAccount}
              displayCurrency={displayCurrency}
              onCurrencyToggle={() =>
                setDisplayCurrency((c) => (c === "KRW" ? "USD" : "KRW"))
              }
            />

            <div className="px-8 pb-10 pt-6 space-y-5">

              {/* ① 계좌 요약 */}
              <AccountSummaryCard
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                displayCurrency={displayCurrency}
              />

              {/* ② 포트폴리오 분석 + 종목별 수익률 */}
              <div className="grid grid-cols-[1fr_1.6fr] gap-5">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                  <p className="text-xs font-semibold text-[var(--muted)] mb-4">포트폴리오 분석</p>
                  <div className="h-[160px]">
                    <PortfolioAnalysisChart
                      stocks={accountStocks}
                      quotes={quotes}
                      cashKRW={selectedAccount.cashKRW}
                      cashUSD={selectedAccount.cashUSD}
                    />
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                  <p className="text-xs font-semibold text-[var(--muted)] mb-4">종목별 수익률</p>
                  <div className="h-[160px]">
                    <StockReturnChart stocks={accountStocks} quotes={quotes} />
                  </div>
                </div>
              </div>

              {/* ③ 국내 주식 리스트 */}
              <StockListSection
                market="KR"
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                onAddStock={addStock}
                onDeleteStock={removeStock}
              />

              {/* ④ 해외 주식 리스트 */}
              <StockListSection
                market="US"
                account={selectedAccount}
                stocks={accountStocks}
                quotes={quotes}
                onAddStock={addStock}
                onDeleteStock={removeStock}
              />

              {/* ⑤ 현금 관리 */}
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
