"use client";

import React, { useEffect } from "react";
import { SignUpView } from "@/src/features/auth/components/SignUpView";
import { useSession } from "@/src/context/SessionContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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
      <SignUpView
        onLoginClick={() => router.push("/auth/login")}
        onBackClick={() => router.push("/")}
        onSignUpSuccess={() => router.push("/auth/login")}
      />
    </div>
  );
}
