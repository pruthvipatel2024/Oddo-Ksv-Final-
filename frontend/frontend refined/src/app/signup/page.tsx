"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function SignupPage() {
  const router = useRouter();

  return (
    <AuthLayout eyebrow="Create Account" title="Join your team">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
      >
        <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-ink-200 text-xs text-ink-400 dark:border-ink-600">
          Photo
        </div>
        <Input label="Full name" placeholder="Raj Patel" required />
        <Input label="Phone" placeholder="+91 98765 43210" required />
        <Input label="Email / Mobile" placeholder="raj.patel@corp.com" icon={<Icons.mail />} required />
        <Input label="Password" type="password" placeholder="••••••••" icon={<Icons.lock />} required />
        <Input label="Confirm password" type="password" placeholder="••••••••" icon={<Icons.lock />} required />

        <Button type="submit" className="mt-2 w-full">
          Sign up
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
