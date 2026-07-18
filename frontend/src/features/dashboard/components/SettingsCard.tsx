"use client";

import React, { useState } from 'react';
import { Settings, User, Phone, Check } from 'lucide-react';

interface SettingsCardProps {
  user: any;
  onUpdateProfile: (payload: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export default function SettingsCard({
  user,
  onUpdateProfile,
  isSubmitting
}: SettingsCardProps) {
  const [first, setFirst] = useState(user?.firstName || '');
  const [last, setLast] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      await onUpdateProfile({
        firstName: first.trim(),
        lastName: last.trim(),
        phone: phone.trim()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 max-w-2xl mx-auto">
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Settings className="h-5 w-5 text-indigo-650" />
        <span>Profile Settings</span>
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        {success && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-650 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>Profile details updated successfully.</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-650 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">First Name</label>
            <input
              type="text"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Last Name</label>
            <input
              type="text"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Email Address (Read-only)</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full rounded-xl border border-zinc-150 bg-zinc-50 px-4 py-3 text-xs text-zinc-400 dark:border-zinc-850 dark:bg-zinc-950"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Role Scoping</label>
          <span className="block text-xs font-semibold text-zinc-650 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 dark:bg-zinc-950 dark:border-zinc-850 dark:text-zinc-400">
            {user?.role}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
