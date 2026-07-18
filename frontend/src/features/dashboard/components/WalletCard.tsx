"use client";

import React from 'react';
import { Wallet, TrendingUp, CreditCard, Clock } from 'lucide-react';

interface WalletCardProps {
  balance: number;
  pendingEarnings: number;
  transactions: any[];
  onTriggerRecharge: () => void;
  isLoading?: boolean;
}

export default function WalletCard({
  balance,
  pendingEarnings,
  transactions,
  onTriggerRecharge,
  isLoading
}: WalletCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse h-40"></div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-650" />
          <span>Wallet Balance</span>
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-850">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Available Cash</span>
            <span className="text-2xl font-black text-zinc-900 mt-1 block dark:text-zinc-100">₹{balance.toFixed(2)}</span>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-850">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pending Earnings</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block dark:text-emerald-400">₹{pendingEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onTriggerRecharge}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <CreditCard className="h-4 w-4" />
          <span>Recharge Wallet</span>
        </button>
      </div>

      {transactions && transactions.length > 0 && (
        <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-850">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>Recent Transactions Ledger</span>
          </span>

          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
            {transactions.slice(0, 5).map((tx) => {
              const isCredit = tx.type === 'DEPOSIT' || tx.type === 'CREDIT' || tx.type === 'REFUND';
              return (
                <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-zinc-850 dark:text-zinc-300 block">{tx.description || tx.type}</span>
                    <span className="text-[9px] text-zinc-400 block">{new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'} ₹{Number(tx.amount).toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
