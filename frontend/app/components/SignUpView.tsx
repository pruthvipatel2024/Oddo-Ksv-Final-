"use client";

import React, { useState, useRef } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Camera, ArrowLeft, ArrowRight } from "lucide-react";

interface SignUpViewProps {
  onLoginClick: () => void;
  onBackClick: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onLoginClick,
  onBackClick,
  onSignUpSuccess,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate file upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setAvatarUrl(reader.result as string);
          setUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!emailOrMobile.trim()) {
      setError("Please enter your email or mobile.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    // Simulate API registration
    setTimeout(() => {
      setLoading(false);
      onSignUpSuccess();
    }, 1200);
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Welcome
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
            <User className="h-4 w-4 text-zinc-600" />
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
            <div className="md:mt-32">
              <h1 className="text-3xl font-black tracking-tight text-indigo-600 md:text-4xl uppercase md:[writing-mode:vertical-lr] md:rotate-180 md:transform md:leading-none">
                Sign Up
              </h1>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="flex-1 px-6 py-10 md:px-16 md:py-12">

            {/* Header + Photo Upload side-by-side */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">
                    Join Us
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                  Create Account
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Fill in your details to start sharing rides.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden shadow-sm"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : uploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  ) : (
                    <Camera className="h-6 w-6 text-zinc-400" />
                  )}
                </button>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Upload
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border  bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Phone
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border  bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                  />
                </div>
              </div>

              {/* Email / Mobile Field */}
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
                    className="w-full rounded-xl border  bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border  bg-white py-3 pl-11 pr-11 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
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

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border  bg-white py-3 pl-11 pr-11 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-zinc-400 hover:text-zinc-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 mt-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Redirect */}
            <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
              <span className="text-sm font-medium text-zinc-500">
                Already have an account?{" "}
              </span>
              <button
                onClick={onLoginClick}
                className="text-sm font-bold text-indigo-600 hover:underline"
              >
                Log In
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
