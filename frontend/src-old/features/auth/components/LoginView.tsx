"use client";

import React, { useState } from "react";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, User } from "lucide-react";
import { useSession } from "@/src/context/SessionContext";


interface LoginViewProps {
  onSignUpClick: () => void;
  onBackClick: () => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSignUpClick,
  onBackClick,
  onLoginSuccess,
}) => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOrMobile.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: emailOrMobile.trim(), password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#fdfdfd] text-zinc-800 antialiased">
      {/* Top Navbar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <span className="text-sm font-bold">O</span>
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-zinc-800">
            Carpooling
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Welcome
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
              <User className="h-4 w-4 text-zinc-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-100/50 md:flex">

          {/* Left Vertical Info/Label Sidebar */}
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-6 md:w-48 md:flex-col md:items-start md:justify-start md:border-b-0 md:border-r md:px-8 md:py-12">
            <button
              onClick={onBackClick}
              className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            <div className="md:mt-24">
              <h1 className="text-3xl font-black tracking-tight text-indigo-600 md:text-4xl uppercase md:[writing-mode:vertical-lr] md:rotate-180 md:transform md:leading-none">
                Login
              </h1>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="flex-1 px-6 py-10 md:px-16 md:py-16">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">
                  Getting Started
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Login To Continue
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Enter your registered details to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / Mobile Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Email / Mobile
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="name@company.com or 10-digit mobile"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    className="w-full rounded-xl border  bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-indigo-600 hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border  bg-white py-3.5 pl-11 pr-11 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-zinc-500 select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="my-8 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Or</span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Sign Up Redirect section */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <span className="text-sm font-medium text-zinc-500">
                Create New Account
              </span>
              <button
                onClick={onSignUpClick}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-95"
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
