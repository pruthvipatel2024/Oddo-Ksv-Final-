"use client";

import React, { useState } from "react";
import { SplashView } from "./components/SplashView";
import { LoginView } from "./components/LoginView";
import { SignUpView } from "./components/SignUpView";
import { DashboardView } from "./components/DashboardView";
import AdminDashboard from "@/admin/dashboard";
import { useSession } from "@/src/context/SessionContext";

type ViewState = "splash" | "login" | "signup";

export default function Home() {
  const [view, setView] = useState<ViewState>("splash");
  const [transitioning, setTransitioning] = useState(false);
  const { user, loading, logout } = useSession();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const changeView = (nextView: ViewState) => {
    setTransitioning(true);
    setTimeout(() => {
      setView(nextView);
      setTransitioning(false);
    }, 300); // matches transition speed
  };

  // Render loading state while restoring session from localStorage
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

  // Redirect to appropriate dashboard if user is authenticated
  if (user) {
    if (user.role === "EMPLOYEE") {
      return <DashboardView onLogout={logout} />;
    } else {
      return <AdminDashboard onLogout={logout} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      {/* View Transition wrapper */}
      <div
        className={`flex-1 transition-all duration-300 ${
          transitioning ? "opacity-0 translate-y-2 scale-[0.99]" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {view === "splash" && (
          <SplashView onStart={() => changeView("login")} />
        )}

        {view === "login" && (
          <LoginView
            onSignUpClick={() => changeView("signup")}
            onBackClick={() => changeView("splash")}
            onLoginSuccess={() => {}}
          />
        )}

        {view === "signup" && (
          <SignUpView
            onLoginClick={() => changeView("login")}
            onBackClick={() => changeView("splash")}
            onSignUpSuccess={() => changeView("login")}
          />
        )}
      </div>
    </div>
  );
}

