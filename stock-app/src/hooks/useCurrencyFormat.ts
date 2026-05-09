const USD_TO_KRW = 1380;

export function formatAsset(valueKRW: number, currency: "KRW" | "USD"): string {
  if (currency === "USD") {
    const usd = valueKRW / USD_TO_KRW;
    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `₩${Math.round(valueKRW).toLocaleString("ko-KR")}`;
}

export function formatProfit(valueKRW: number, currency: "KRW" | "USD"): string {
  const sign = valueKRW >= 0 ? "+" : "";
  if (currency === "USD") {
    const usd = valueKRW / USD_TO_KRW;
    return `${sign}$${Math.abs(usd).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `${sign}₩${Math.abs(Math.round(valueKRW)).toLocaleString("ko-KR")}`;
}
