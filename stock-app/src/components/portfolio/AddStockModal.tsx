"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Calendar, TrendingUp, ChevronDown, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Stock, Sector } from "@/types";
import { detectMarket, lookupTicker } from "@/lib/finance/tickerUtils";

const SECTORS: { value: Sector; icon: string }[] = [
  { value: "반도체", icon: "💾" },
  { value: "전력", icon: "⚡" },
  { value: "바이오", icon: "🧬" },
  { value: "IT", icon: "💻" },
  { value: "금융", icon: "🏦" },
  { value: "소비재", icon: "🛍️" },
  { value: "에너지", icon: "🔋" },
  { value: "기타", icon: "📦" },
];

type BuyMode = "current" | "date";
type PriceStatus = "idle" | "loading" | "success" | "error" | "manual";

interface AddStockModalProps {
  accountId: string;
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}

export default function AddStockModal({ accountId, onClose, onAdd }: AddStockModalProps) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState<Sector>("기타");
  const [quantity, setQuantity] = useState("");

  // 가격 관련 상태
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState("");
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("idle");
  const [priceError, setPriceError] = useState("");

  const [buyMode, setBuyMode] = useState<BuyMode>("current");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectedMarket = ticker.trim() ? detectMarket(ticker) : null;
  const currency = detectedMarket === "KR" ? "KRW" : "USD";

  // 표시할 가격: 자동 조회 우선, 없으면 수동 입력
  const effectivePrice = fetchedPrice ?? parseFloat(manualPrice.replace(/,/g, ""));

  // 가격 조회 함수
  const fetchPrice = useCallback(async (t: string, market: string, date?: string) => {
    if (!t.trim()) return;
    setPriceStatus("loading");
    setPriceError("");
    setFetchedPrice(null);
    try {
      const params = new URLSearchParams({ ticker: t, market });
      if (date) params.set("date", date);
      const res = await fetch(`/api/price?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setPriceStatus("error");
        setPriceError(data.error ?? "가격 조회 실패");
        return;
      }
      setFetchedPrice(data.price);
      // Yahoo Finance에서 종목명 받아왔을 때 자동완성되지 않은 경우 채우기
      if (!name.trim() && data.name) setName(data.name);
      setPriceStatus("success");
    } catch {
      setPriceStatus("error");
      setPriceError("네트워크 오류가 발생했습니다");
    }
  }, [name]);

  // 종목 코드 → 이름/섹터 자동완성
  useEffect(() => {
    if (!ticker.trim()) {
      setFetchedPrice(null);
      setPriceStatus("idle");
      return;
    }
    const info = lookupTicker(ticker);
    if (info) {
      setName(info.name);
      setSector(info.sector);
    }
  }, [ticker]);

  // ticker or buyMode/buyDate 변경 시 가격 자동 조회 (debounce 500ms)
  useEffect(() => {
    if (!ticker.trim() || !detectedMarket) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const date = buyMode === "date" ? buyDate : undefined;
      fetchPrice(ticker, detectedMarket, date);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, buyMode, buyDate]);

  const handleModeChange = (mode: BuyMode) => {
    setBuyMode(mode);
    setFetchedPrice(null);
    setPriceStatus("idle");
  };

  const formatPrice = (price: number) =>
    currency === "KRW"
      ? `${Math.round(price).toLocaleString("ko-KR")}원`
      : `$${price.toFixed(2)}`;

  const isValid =
    ticker.trim() !== "" &&
    name.trim() !== "" &&
    parseFloat(quantity) > 0 &&
    !isNaN(effectivePrice) && effectivePrice > 0;

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
      quantity: parseFloat(quantity),
      avgPrice: effectivePrice,
      currency,
      buyDate: buyMode === "current" ? new Date().toISOString().split("T")[0] : buyDate,
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
            <p className="text-xs text-[var(--muted)] mt-0.5">종목 코드 입력 시 가격이 자동으로 조회됩니다</p>
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
                  focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/20
                  transition-colors font-mono"
              />
              {detectedMarket && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5
                  text-[11px] font-medium px-2 py-0.5 rounded-md
                  ${detectedMarket === "KR"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                  {detectedMarket === "KR" ? "🇰🇷 한국" : "🇺🇸 미국"}
                </div>
              )}
            </div>
          </div>

          {/* ② 매수 시점 선택 + 날짜 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-2 block">매수 시점</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => handleModeChange("current")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${buyMode === "current"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                <TrendingUp size={13} />
                현재가
              </button>
              <button type="button" onClick={() => handleModeChange("date")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${buyMode === "date"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                <Calendar size={13} />
                날짜 지정
              </button>
            </div>
            {buyMode === "date" && (
              <input
                type="date"
                value={buyDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                  text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            )}
          </div>

          {/* ③ 가격 조회 결과 박스 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--muted)]">
                매수가 {currency === "KRW" ? "(원)" : "($)"}
              </label>
              {priceStatus === "success" && (
                <button type="button" onClick={() => fetchPrice(ticker, detectedMarket!, buyMode === "date" ? buyDate : undefined)}
                  className="flex items-center gap-1 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  <RefreshCw size={10} />
                  새로고침
                </button>
              )}
            </div>

            {/* 가격 상태별 UI */}
            {priceStatus === "idle" && ticker.trim() === "" && (
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs text-[var(--muted)]">
                종목 코드를 입력하면 자동으로 조회됩니다
              </div>
            )}

            {priceStatus === "loading" && (
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5
                flex items-center gap-2.5 text-xs text-[var(--muted)]">
                <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                <span>
                  {buyMode === "current"
                    ? "현재가 조회 중..."
                    : `${buyDate} 시점 가격 조회 중...`}
                </span>
              </div>
            )}

            {priceStatus === "success" && fetchedPrice !== null && (
              <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--accent)]" />
                    <span className="text-xs text-[var(--muted)]">
                      {buyMode === "current" ? "현재가" : `${buyDate} 종가`}
                    </span>
                  </div>
                  <p className="text-base font-bold text-[var(--foreground)] tabular-nums">
                    {formatPrice(fetchedPrice)}
                  </p>
                </div>
              </div>
            )}

            {priceStatus === "error" && (
              <div className="space-y-2">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3
                  flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={13} />
                  <span>{priceError} — 직접 입력해주세요</span>
                </div>
                <input
                  type="text"
                  value={manualPrice}
                  onChange={(e) => { setManualPrice(e.target.value); setPriceStatus("manual"); }}
                  placeholder={currency === "KRW" ? "직접 입력 (예: 70000)" : "직접 입력 (예: 150.00)"}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                    text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                    focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
                />
              </div>
            )}

            {priceStatus === "manual" && (
              <input
                type="text"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder={currency === "KRW" ? "직접 입력 (예: 70000)" : "직접 입력 (예: 150.00)"}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                  text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            )}

            {/* 조회 실패 없이 수동 입력 원할 때 */}
            {(priceStatus === "idle" && ticker.trim() !== "") && (
              <input
                type="text"
                value={manualPrice}
                onChange={(e) => { setManualPrice(e.target.value); setPriceStatus("manual"); }}
                placeholder={currency === "KRW" ? "조회 중... 또는 직접 입력" : "Fetching... or enter manually"}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                  text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
              />
            )}
          </div>

          {/* ④ 종목명 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--muted)]">종목명</label>
            </div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="직접 입력하세요"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors" />
          </div>

          {/* ⑤ 섹터 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">섹터</label>
            <div className="relative">
              <select value={sector} onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full appearance-none bg-[var(--background)] border border-[var(--border)] rounded-xl
                  px-3.5 py-2.5 text-sm text-[var(--foreground)]
                  focus:outline-none focus:border-[var(--accent)]/60 transition-colors cursor-pointer">
                {SECTORS.map(({ value, icon }) => (
                  <option key={value} value={value}>{icon} {value}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            </div>
          </div>

          {/* ⑥ 수량 */}
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1.5 block">수량 (주)</label>
            <input type="number" value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10" min="1" step="1"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]
                focus:outline-none focus:border-[var(--accent)]/60 transition-colors" />
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
                  {parseFloat(quantity).toLocaleString()}주
                </p>
                <p className="text-[11px] text-[var(--muted)] tabular-nums">
                  {formatPrice(effectivePrice)} × {parseFloat(quantity).toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-[var(--accent)] tabular-nums">
                  = {formatPrice(effectivePrice * parseFloat(quantity))}
                </p>
              </div>
            </div>
          )}

          <button type="submit" disabled={!isValid}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-30
              text-white rounded-xl py-2.5 text-sm font-medium transition-all">
            종목 추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
