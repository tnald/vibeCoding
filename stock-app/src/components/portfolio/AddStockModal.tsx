"use client";

import { useState, useEffect } from "react";
import { X, Search, ChevronDown, Loader2 } from "lucide-react";
import { Stock, Sector } from "@/types";
import { detectMarket, lookupTicker } from "@/lib/finance/tickerUtils";

const SECTORS: { value: Sector; icon: string }[] = [
  { value: "반도체", icon: "💾" },
  { value: "전력",   icon: "⚡" },
  { value: "바이오", icon: "🧬" },
  { value: "IT",     icon: "💻" },
  { value: "금융",   icon: "🏦" },
  { value: "소비재", icon: "🛍️" },
  { value: "에너지", icon: "🔋" },
  { value: "기타",   icon: "📦" },
];

interface Props {
  accountId: string;
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}

export default function AddStockModal({ accountId, onClose, onAdd }: Props) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState<Sector>("기타");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fetchingName, setFetchingName] = useState(false);

  const detectedMarket = ticker.trim() ? detectMarket(ticker) : null;
  const currency = detectedMarket === "KR" ? "KRW" : "USD";

  // 종목 코드 입력 시 이름/섹터 자동완성
  useEffect(() => {
    if (!ticker.trim()) { setName(""); return; }

    // 1순위: 로컬 하드코딩 목록 (즉시)
    const info = lookupTicker(ticker);
    if (info) {
      setName(info.name);
      setSector(info.sector);
      return;
    }

    // 2순위: API 조회 (600ms debounce)
    const market = detectMarket(ticker);
    const timer = setTimeout(async () => {
      setFetchingName(true);
      try {
        const res = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}&market=${market}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setName(data.name);
        }
      } catch { /* 무시 */ } finally {
        setFetchingName(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [ticker]);

  const parsedPrice = parseFloat(price.replace(/,/g, ""));
  const parsedQty = parseFloat(quantity);
  const isValid =
    ticker.trim() !== "" &&
    name.trim() !== "" &&
    detectedMarket !== null &&
    parsedQty > 0 &&
    !isNaN(parsedPrice) && parsedPrice > 0;

  const formatPrice = (p: number) =>
    currency === "KRW"
      ? `${Math.round(p).toLocaleString("ko-KR")}원`
      : `$${p.toFixed(2)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !detectedMarket) return;
    onAdd({
      id: crypto.randomUUID(),
      accountId,
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      market: detectedMarket,
      sector,
      quantity: parsedQty,
      avgPrice: parsedPrice,
      currency,
      buyDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--surface-elevated)] z-10">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">종목 추가</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">종목 정보와 매수가를 직접 입력하세요</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)]
              hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* ① 종목 코드 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">종목 코드</label>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="005930 또는 AAPL"
                autoFocus
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                  pl-9 pr-24 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors font-mono"
              />
              {detectedMarket && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2
                  text-[11px] font-medium px-2 py-0.5 rounded-md
                  ${detectedMarket === "KR"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {detectedMarket === "KR" ? "🇰🇷 한국" : "🇺🇸 미국"}
                </div>
              )}
            </div>
          </div>

          {/* ② 종목명 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 flex items-center gap-1.5">
              종목명
              {fetchingName && <Loader2 size={10} className="animate-spin text-[var(--accent)]" />}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={fetchingName ? "조회 중..." : "직접 입력 또는 자동완성"}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
          </div>

          {/* ③ 섹터 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">섹터</label>
            <div className="relative">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full appearance-none bg-[var(--background)] border border-[var(--border)] rounded-xl
                  px-3.5 py-2.5 text-sm text-[var(--foreground)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors cursor-pointer"
              >
                {SECTORS.map(({ value, icon }) => (
                  <option key={value} value={value}>{icon} {value}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            </div>
          </div>

          {/* ④ 수량 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">수량 (주)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              min="1"
              step="1"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
          </div>

          {/* ⑤ 매수가 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">
              매수가 {detectedMarket === "KR" ? "(원)" : detectedMarket === "US" ? "($)" : ""}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                {currency === "KRW" ? "₩" : "$"}
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currency === "KRW" ? "70000" : "150.00"}
                min="0"
                step="any"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl
                  pl-8 pr-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            </div>
          </div>

          {/* 요약 미리보기 */}
          {isValid && detectedMarket && (
            <div className="flex items-center justify-between p-3.5 rounded-xl
              bg-[var(--background)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base
                  ${detectedMarket === "KR" ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                  {detectedMarket === "KR" ? "🇰🇷" : "🇺🇸"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)] font-mono">{ticker}</p>
                  <p className="text-[11px] text-[var(--muted)]">{name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--foreground)] tabular-nums">
                  {parsedQty.toLocaleString()}주
                </p>
                <p className="text-[11px] text-[var(--muted)] tabular-nums">
                  {formatPrice(parsedPrice)} × {parsedQty.toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-[var(--accent)] tabular-nums">
                  = {formatPrice(parsedPrice * parsedQty)}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-30
              text-white rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            종목 추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
