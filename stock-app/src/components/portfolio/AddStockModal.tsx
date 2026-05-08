"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Stock, Sector, Market } from "@/types";

const SECTORS: Sector[] = ["반도체", "전력", "바이오", "IT", "금융", "소비재", "에너지", "기타"];

interface AddStockModalProps {
  accountId: string;
  onClose: () => void;
  onAdd: (stock: Stock) => void;
}

export default function AddStockModal({ accountId, onClose, onAdd }: AddStockModalProps) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [market, setMarket] = useState<Market>("KR");
  const [sector, setSector] = useState<Sector>("기타");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const price = parseFloat(avgPrice.replace(/,/g, ""));
    if (!ticker || isNaN(qty) || isNaN(price)) return;

    onAdd({
      id: crypto.randomUUID(),
      accountId,
      ticker: ticker.toUpperCase(),
      name: name || ticker.toUpperCase(),
      market,
      sector,
      quantity: qty,
      avgPrice: price,
      currency: market === "KR" ? "KRW" : "USD",
      buyDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1c2130] border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">종목 추가</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMarket("KR")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${market === "KR" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
            >
              🇰🇷 한국
            </button>
            <button
              type="button"
              onClick={() => setMarket("US")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${market === "US" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
            >
              🇺🇸 미국
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">종목 코드</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder={market === "KR" ? "005930" : "AAPL"}
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                  text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">종목명</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="삼성전자"
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                  text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">섹터</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector)}
              className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">수량</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                  text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                평균 매수가 ({market === "KR" ? "원" : "$"})
              </label>
              <input
                type="text"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                placeholder={market === "KR" ? "70000" : "150.00"}
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                  text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">매수일</label>
            <input
              type="date"
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2
                text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
