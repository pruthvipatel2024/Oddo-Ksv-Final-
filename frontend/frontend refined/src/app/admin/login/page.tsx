"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <AuthLayout eyebrow="Admin Portal" title="Sign in to Dashboard">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/admin/employees");
        }}
      >
        <Input label="Admin email" placeholder="admin@corp.com" icon={<Icons.mail />} required />
        <Input label="Password" type="password" placeholder="••••••••" icon={<Icons.lock />} required />

        <Button type="submit" variant="primary" className="mt-2 w-full bg-ink-800 hover:bg-ink-900 dark:bg-amber-400 dark:text-ink-900 dark:hover:bg-amber-300">
          Enter Admin Dashboard
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
