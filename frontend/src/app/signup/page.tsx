"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useSession();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "Doe";

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        firstName,
        lastName,
        phone: phone.trim(),
        organizationCode: organizationCode.trim().toUpperCase(),
        employeeCode: employeeCode.trim() || undefined,
        userType: "INTERNAL",
      });
      router.push("/login?signup_success=1");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Verify your invite code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Create Account" title="Join your team">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <Input
          label="Full name"
          placeholder="Raj Patel"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Phone"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Input
          label="Email Address"
          placeholder="raj.patel@corp.com"
          icon={<Icons.mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Org Invite Code"
            placeholder="CORPA"
            value={organizationCode}
            onChange={(e) => setOrganizationCode(e.target.value)}
            required
          />
          <Input
            label="Employee ID (Optional)"
            placeholder="EMP-001"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
        </div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Icons.lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          icon={<Icons.lock />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="mt-2 w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Sign up"}
        </Button>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-teal-500 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
