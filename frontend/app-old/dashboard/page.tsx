"use client";

import React, { useEffect } from "react";
import { DashboardView } from "@/src/features/dashboard/components/DashboardView";
import { useSession } from "@/src/context/SessionContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (user.role !== "EMPLOYEE") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "EMPLOYEE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Verifying Access...
          </span>
        </div>
      </div>
    );
  }

  return <DashboardView onLogout={logout} />;
}
