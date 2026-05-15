"use client";

import { useEffect, useState, useCallback } from "react";
import { Account } from "@/types";
import {
  fetchAccounts,
  insertAccount,
  updateAccountCash,
  deleteAccount as deleteAccountQuery,
} from "@/lib/supabase/queries";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (e) {
      console.error("계좌 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAccount = async (account: Omit<Account, "id">) => {
    const created = await insertAccount(account);
    setAccounts((prev) => [...prev, created]);
    return created;
  };

  const updateCash = async (id: string, cashKRW: number, cashUSD: number) => {
    await updateAccountCash(id, cashKRW, cashUSD);
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, cashKRW, cashUSD } : a))
    );
  };

  const deleteAccount = async (id: string) => {
    await deleteAccountQuery(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return { accounts, loading, addAccount, updateCash, deleteAccount };
}
