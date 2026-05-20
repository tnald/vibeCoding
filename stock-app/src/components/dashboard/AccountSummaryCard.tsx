"use client";

import { Stock, StockQuote, Account } from "@/types";

const USD_TO_KRW = 1380;

interface Props {
  account: Account;
  stocks: Stock[];
  quotes: Record<string, StockQuote>;
  quotesLoading?: boolean;
}

function fmtKRW(v: number) {
  return `₩${Math.round(Math.abs(v)).toLocaleString("ko-KR")}`;
}
function fmtUSD(v: number, decimals = 0) {
  return `$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
function sign(v: number) { return v >= 0 ? "+" : "−"; }

function Skeleton() {
  return <div className="h-8 w-32 rounded-lg bg-[var(--border)] animate-pulse mt-1" />;
}

export default function AccountSummaryCard({ account, stocks, quotes, quotesLoading }: Props) {
  const krStocks = stocks.filter((s) => s.market === "KR");
  const usStocks = stocks.filter((s) => s.market === "US");

  // 국내 (KRW)
  const krValueKRW = krStocks.reduce((sum, s) => {
    const p = quotes[s.ticker]?.price ?? s.avgPrice;
    return sum + p * s.quantity;
  }, 0);
  const krCostKRW = krStocks.reduce((sum, s) => sum + s.avgPrice * s.quantity, 0);
  const krProfitKRW = krValueKRW - krCostKRW;

  // 해외 (USD 원본)
  const usValueUSD = usStocks.reduce((sum, s) => {
    const p = quotes[s.ticker]?.price ?? s.avgPrice;
    return sum + p * s.quantity;
  }, 0);
  const usCostUSD = usStocks.reduce((sum, s) => sum + s.avgPrice * s.quantity, 0);
  const usProfitUSD = usValueUSD - usCostUSD;

  // 전체 (KRW 환산)
  const usValueKRW = usValueUSD * USD_TO_KRW;
  const usProfitKRW = usProfitUSD * USD_TO_KRW;
  const stockValueKRW = krValueKRW + usValueKRW;
  const totalProfitKRW = krProfitKRW + usProfitKRW;

  const cashKRW = account.cashKRW + account.cashUSD * USD_TO_KRW;
  const totalAssetKRW = stockValueKRW + cashKRW;

  const investedKRW = krCostKRW + usCostUSD * USD_TO_KRW;
  const totalReturnPct = investedKRW > 0 ? (totalProfitKRW / investedKRW) * 100 : 0;

  const profitColor = (v: number) => v >= 0 ? "text-red-400" : "text-blue-400";

  // 시세 로딩 중이면 스켈레톤, 데이터 없으면 비활성 표시
  const loading = quotesLoading && stocks.length > 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-3">

        {/* 순자산총액 — 강조 카드 */}
        <div className="bg-[var(--background)] border border-[var(--accent)]/30 rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">순자산총액</p>
          <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums leading-tight">
            {fmtKRW(totalAssetKRW)}
          </p>
        </div>

        {/* 전체 평가손익 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">전체 평가손익</p>
          {loading ? <Skeleton /> : (
            <p className={`text-2xl font-bold tabular-nums leading-tight ${profitColor(totalProfitKRW)}`}>
              {sign(totalProfitKRW)}{fmtKRW(totalProfitKRW)}
            </p>
          )}
        </div>

        {/* 전체 수익률 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">전체 수익률</p>
          {loading ? <Skeleton /> : (
            <p className={`text-2xl font-bold tabular-nums leading-tight ${profitColor(totalReturnPct)}`}>
              {sign(totalReturnPct)}{Math.abs(totalReturnPct).toFixed(2)}%
            </p>
          )}
        </div>

        {/* 현금(예수금) */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">현금(예수금)</p>
          <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums leading-tight">
            {fmtKRW(cashKRW)}
          </p>
          {account.cashUSD > 0 && (
            <p className="text-xs text-[var(--muted)] mt-1 tabular-nums">
              ₩{Math.round(account.cashKRW).toLocaleString()} + ${account.cashUSD.toFixed(2)}
            </p>
          )}
        </div>

        {/* 국내 평가금액 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">국내 평가금액</p>
          {loading ? <Skeleton /> : (
            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums leading-tight">
              {fmtKRW(krValueKRW)}
            </p>
          )}
          <p className="text-xs text-[var(--muted)] mt-1">
            {new Set(krStocks.map(s => s.ticker)).size}종목
          </p>
        </div>

        {/* 국내 평가손익 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">국내 평가손익</p>
          {loading ? <Skeleton /> : (
            <p className={`text-2xl font-bold tabular-nums leading-tight ${profitColor(krProfitKRW)}`}>
              {sign(krProfitKRW)}{fmtKRW(krProfitKRW)}
            </p>
          )}
        </div>

        {/* 해외 평가금액 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">해외 평가금액</p>
          {loading ? <Skeleton /> : (
            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums leading-tight">
              {fmtUSD(usValueUSD)}
            </p>
          )}
          <p className="text-xs text-[var(--muted)] mt-1">
            {new Set(usStocks.map(s => s.ticker)).size}종목
          </p>
        </div>

        {/* 해외 평가손익 */}
        <div className="bg-[var(--background)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-2">해외 평가손익</p>
          {loading ? <Skeleton /> : (
            <p className={`text-2xl font-bold tabular-nums leading-tight ${profitColor(usProfitUSD)}`}>
              {sign(usProfitUSD)}{fmtUSD(Math.abs(usProfitUSD), 2)}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
