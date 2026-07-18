"use client";
import React, { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirm) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => router.push("/auth/login")}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Define a new secure password for your account.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            Password has been reset successfully. You can now log in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                New Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
