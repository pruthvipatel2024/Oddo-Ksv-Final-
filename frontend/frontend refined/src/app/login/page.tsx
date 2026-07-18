"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthLayout eyebrow="Employee Login" title="Welcome back">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
      >
        <Input label="Email / Mobile" placeholder="raj.patel@corp.com" icon={<Icons.mail />} required />
        <Input label="Password" type="password" placeholder="••••••••" icon={<Icons.lock />} required />

        <Button type="submit" className="mt-2 w-full">
          Log in
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
