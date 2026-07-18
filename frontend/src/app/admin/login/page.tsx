"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email: email.trim(), password });
      // Enforce that only admin roles can access this portal
      if (response.role === "EMPLOYEE") {
        throw new Error("Access denied: You are logged in as an Employee. Please use the employee portal.");
      }
      router.push("/admin/employees");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Admin Portal" title="Sign in to Dashboard">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <Input
          label="Admin email"
          placeholder="admin@corp.com"
          icon={<Icons.mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <Button type="submit" variant="primary" className="mt-2 w-full bg-ink-800 hover:bg-ink-900 dark:bg-amber-400 dark:text-ink-900 dark:hover:bg-amber-300" disabled={loading}>
          {loading ? "Entering..." : "Enter Admin Dashboard"}
        </Button>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400">
          Not an admin?{" "}
          <Link href="/login" className="font-semibold text-teal-500 hover:underline">
            Go to employee login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
