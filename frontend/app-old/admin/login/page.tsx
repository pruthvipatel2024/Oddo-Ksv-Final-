"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/context/SessionContext";
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, login } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "EMPLOYEE") {
        router.replace("/dashboard");
      } else {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your admin credentials.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (res.role === "EMPLOYEE") {
        setError("Access Denied: Standard employees cannot access the admin portal.");
      } else {
        router.replace("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid admin credentials. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-950 text-zinc-150 antialiased font-sans">
      {/* Top Navbar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-550 text-white shadow-md">
            <span className="text-sm font-bold">A</span>
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-white">
            Admin Console
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-3 text-center mb-8">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/25">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Authentication</h1>
            <p className="text-xs text-zinc-500">Sign in to manage employees, organizations, and platform stats.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-900/50 p-3.5 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-650" />
                <input
                  type="email"
                  placeholder="admin@carpool.platform"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-11 pr-4 py-3.5 text-xs text-zinc-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-655" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-11 pr-12 py-3.5 text-xs text-zinc-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-zinc-600 hover:text-zinc-400"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-sky-650 py-3.5 text-xs font-bold text-white hover:bg-sky-550 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/10 border border-sky-500/20 cursor-pointer"
            >
              {loginLoading ? "Authenticating..." : "Sign in to Dashboard"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
        &copy; {new Date().getFullYear()} Enterprise Carpooling Marketplace. All administrative rights reserved.
      </footer>
    </div>
  );
}
