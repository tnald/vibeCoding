import { createClient } from "./client";
import { Account, Stock } from "@/types";

// ─── 계좌 ────────────────────────────────────────────────

export async function fetchAccounts(): Promise<Account[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    accountNumber: r.account_number ?? "",
    icon: r.icon,
    cashKRW: Number(r.cash_krw),
    cashUSD: Number(r.cash_usd),
  }));
}

export async function insertAccount(
  account: Omit<Account, "id">
): Promise<Account> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  const { data, error } = await sb
    .from("accounts")
    .insert({
      user_id: user.id,
      name: account.name,
      account_number: account.accountNumber,
      icon: account.icon,
      cash_krw: account.cashKRW,
      cash_usd: account.cashUSD,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    accountNumber: data.account_number ?? "",
    icon: data.icon,
    cashKRW: Number(data.cash_krw),
    cashUSD: Number(data.cash_usd),
  };
}

export async function updateAccountCash(
  id: string,
  cashKRW: number,
  cashUSD: number
): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("accounts")
    .update({ cash_krw: cashKRW, cash_usd: cashUSD })
    .eq("id", id);
  if (error) throw error;
}

// ─── 종목 ────────────────────────────────────────────────

export async function fetchStocks(accountId: string): Promise<Stock[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("stocks")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    accountId: r.account_id,
    ticker: r.ticker,
    name: r.name,
    market: r.market,
    sector: r.sector,
    quantity: Number(r.quantity),
    avgPrice: Number(r.avg_price),
    currency: r.currency,
    buyDate: r.buy_date,
  }));
}

export async function insertStock(stock: Stock): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("stocks").insert({
    id: stock.id,
    account_id: stock.accountId,
    ticker: stock.ticker,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    quantity: stock.quantity,
    avg_price: stock.avgPrice,
    currency: stock.currency,
    buy_date: stock.buyDate,
  });
  if (error) throw error;
}

export async function deleteStock(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("stocks").delete().eq("id", id);
  if (error) throw error;
}

export async function updateStockSector(
  id: string,
  sector: string
): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("stocks")
    .update({ sector })
    .eq("id", id);
  if (error) throw error;
}
