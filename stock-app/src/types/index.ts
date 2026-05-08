export type Market = "KR" | "US";

export type Sector =
  | "반도체"
  | "전력"
  | "바이오"
  | "IT"
  | "금융"
  | "소비재"
  | "에너지"
  | "기타";

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  icon: string;
  cashKRW: number;
  cashUSD: number;
}

export interface Stock {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  market: Market;
  sector: Sector;
  quantity: number;
  avgPrice: number;
  currency: "KRW" | "USD";
  buyDate: string;
}

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: "KRW" | "USD";
}
