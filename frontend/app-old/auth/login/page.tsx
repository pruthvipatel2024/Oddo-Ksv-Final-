"use client";

import React, { useEffect } from "react";
import { LoginView } from "@/src/features/auth/components/LoginView";
import { useSession } from "@/src/context/SessionContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "EMPLOYEE") {
        router.push("/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <LoginView
        onSignUpClick={() => router.push("/auth/register")}
        onBackClick={() => router.push("/")}
        onLoginSuccess={() => {}}
      />
    </div>
  );
}
