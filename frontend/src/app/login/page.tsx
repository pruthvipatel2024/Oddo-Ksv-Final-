"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email: emailOrMobile.trim(), password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Employee Login" title="Welcome back">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <Input
          label="Email / Mobile"
          placeholder="raj.patel@corp.com"
          icon={<Icons.mail />}
          value={emailOrMobile}
          onChange={(e) => setEmailOrMobile(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Icons.lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="mt-2 w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <div className="my-1 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
          or
          <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
        </div>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-teal-500 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
