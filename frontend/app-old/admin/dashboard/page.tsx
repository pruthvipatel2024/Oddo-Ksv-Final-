"use client";

import React, { useEffect } from "react";
import AdminDashboard from "@/src/features/admin/components/AdminDashboard";
import { useSession } from "@/src/context/SessionContext";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user, loading, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (user.role === "EMPLOYEE") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === "EMPLOYEE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Verifying Admin Access...
          </span>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}
