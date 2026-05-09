"use client";

import { useEffect, useState, useCallback } from "react";
import { Stock, Sector } from "@/types";
import {
  fetchStocks,
  insertStock,
  deleteStock,
  updateStockSector,
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

  const removeStock = async (id: string) => {
    await deleteStock(id);
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const changeSector = async (id: string, sector: Sector) => {
    await updateStockSector(id, sector);
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, sector } : s)));
  };

  return { stocks, loading, addStock, removeStock, changeSector };
}
