"use client";

import React, { useEffect } from "react";
import { SplashView } from "@/src/components/ui/SplashView";
import { useSession } from "@/src/context/SessionContext";
import { storageService } from "@/src/services/storage/storage.service";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    const savedTheme = storageService.getItem("theme", "local");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Redirect to appropriate dashboard if user is authenticated
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "EMPLOYEE") {
        router.push("/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  // Render loading state while restoring session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Loading Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <div className="flex-1">
        <SplashView onStart={() => router.push("/auth/login")} />
      </div>
    </div>
  );
}
