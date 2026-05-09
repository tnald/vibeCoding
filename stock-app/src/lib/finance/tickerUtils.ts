import { Market, Sector } from "@/types";

// 숫자로만 이루어진 코드 → 한국, 영문 포함 → 미국
export function detectMarket(ticker: string): Market {
  return /^\d+$/.test(ticker.trim()) ? "KR" : "US";
}

// 잘 알려진 종목 코드에 대한 자동완성 정보
const KNOWN_TICKERS: Record<string, { name: string; sector: Sector }> = {
  // 한국
  "005930": { name: "삼성전자", sector: "반도체" },
  "000660": { name: "SK하이닉스", sector: "반도체" },
  "035420": { name: "NAVER", sector: "IT" },
  "035720": { name: "카카오", sector: "IT" },
  "373220": { name: "LG에너지솔루션", sector: "에너지" },
  "207940": { name: "삼성바이오로직스", sector: "바이오" },
  "068270": { name: "셀트리온", sector: "바이오" },
  "005380": { name: "현대차", sector: "소비재" },
  "000270": { name: "기아", sector: "소비재" },
  "105560": { name: "KB금융", sector: "금융" },
  "015760": { name: "한국전력", sector: "전력" },
  "034020": { name: "두산에너빌리티", sector: "전력" },
  // 미국
  AAPL: { name: "Apple", sector: "IT" },
  MSFT: { name: "Microsoft", sector: "IT" },
  NVDA: { name: "NVIDIA", sector: "반도체" },
  TSLA: { name: "Tesla", sector: "소비재" },
  AMZN: { name: "Amazon", sector: "IT" },
  GOOGL: { name: "Alphabet", sector: "IT" },
  META: { name: "Meta", sector: "IT" },
  AMD: { name: "AMD", sector: "반도체" },
  INTC: { name: "Intel", sector: "반도체" },
  TSM: { name: "TSMC", sector: "반도체" },
  AVGO: { name: "Broadcom", sector: "반도체" },
  QCOM: { name: "Qualcomm", sector: "반도체" },
  PFE: { name: "Pfizer", sector: "바이오" },
  JNJ: { name: "Johnson & Johnson", sector: "바이오" },
  JPM: { name: "JPMorgan", sector: "금융" },
  NEE: { name: "NextEra Energy", sector: "전력" },
};

export function lookupTicker(ticker: string) {
  return KNOWN_TICKERS[ticker.toUpperCase()] ?? null;
}
