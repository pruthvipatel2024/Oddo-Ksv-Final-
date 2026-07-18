"use client";
import React, { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Verify Email</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the 6-digit confirmation code sent to your email box.
        </p>

        {submitted ? (
          <div className="mt-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              Email address verified successfully.
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700 transition"
            >
              Continue to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-zinc-200 py-2.5 text-center text-xl font-bold tracking-widest outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              Verify Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
