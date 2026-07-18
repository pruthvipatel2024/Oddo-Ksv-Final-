"use client";
import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { organizationsApi } from "@/src/api/organizations";

export default function OrganizationCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data: res } = await organizationsApi.findAll();
      if (res.success && res.data) {
        const found = res.data.find(
          (o: any) => o.code.toUpperCase() === code.toUpperCase()
        );
        if (found) {
          setResult(found);
        } else {
          setError("No organization registered with this code.");
        }
      }
    } catch (err) {
      setError("Failed to fetch organizations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Organization Code</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Verify your organization affiliation code to register.
        </p>

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Organization Code
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CORPA"
                className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-4 uppercase outline-none focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-400">
              {result.name}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {result.city}, {result.state}, {result.country}
            </p>
            <button
              onClick={() => router.push(`/auth/register?code=${result.code}`)}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Register with this Organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
