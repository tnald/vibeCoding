"use client";

import { useEffect, useState, useCallback } from "react";
import { Stock, Sector } from "@/types";
import {
  fetchStocks,
  insertStock,
  deleteStock,
  updateStockSector,
  updateStockQuantity,
  updateStockAvgPrice,
  updateStockBuyDateAndPrice,
} from "@/lib/supabase/queries";

export function useStocks(accountId: string | null) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accountId) { setStocks([]); return; }
    setLoading(true);
    try {
      const data = await fetchStocks(accountId);
      setStocks(data);
    } catch (e) {
      console.error("종목 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { load(); }, [load]);

  const addStock = async (stock: Stock) => {
    await insertStock(stock);
    setStocks((prev) => [...prev, stock]);
  };

  const addSell = async (sell: Stock) => {
    await insertStock(sell);
    setStocks((prev) => [...prev, sell]);
  };

  const removeStock = async (id: string) => {
    await deleteStock(id);
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const changeSector = async (id: string, sector: Sector) => {
    await updateStockSector(id, sector);
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, sector } : s)));
  };

  const changeGroupSector = async (ids: string[], sector: Sector) => {
    await Promise.all(ids.map((id) => updateStockSector(id, sector)));
    setStocks((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, sector } : s)));
  };

  const changeQuantity = async (id: string, quantity: number) => {
    await updateStockQuantity(id, quantity);
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, quantity } : s)));
  };

  const changeAvgPrice = async (id: string, avgPrice: number) => {
    await updateStockAvgPrice(id, avgPrice);
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, avgPrice } : s)));
  };

  const changeBuyDate = async (id: string, buyDate: string, avgPrice: number) => {
    await updateStockBuyDateAndPrice(id, buyDate, avgPrice);
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, buyDate, avgPrice } : s)));
  };

  return { stocks, loading, addStock, addSell, removeStock, changeSector, changeGroupSector, changeBuyDate, changeAvgPrice, changeQuantity };
}
