"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 p-6 dark:bg-ink-950">
      <Card className="flex max-w-md flex-col items-center gap-4 p-8 text-center shadow-soft-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-650 dark:bg-teal-950/20 dark:text-teal-400">
          <Icons.pin width={28} height={28} />
        </div>
        <h1 className="font-display text-3xl font-black text-ink-800 dark:text-white">404</h1>
        <p className="font-display text-base font-bold text-ink-800 dark:text-ink-200">Page Not Found</p>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" className="w-full mt-2">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
