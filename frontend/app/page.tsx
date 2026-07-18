"use client";

import React, { useState } from "react";
import { SplashView } from "./components/SplashView";
import { LoginView } from "./components/LoginView";
import { SignUpView } from "./components/SignUpView";
import { DashboardView } from "./components/DashboardView";

type ViewState = "splash" | "login" | "signup" | "success";

export default function Home() {
  const [view, setView] = useState<ViewState>("splash");
  const [transitioning, setTransitioning] = useState(false);

  const changeView = (nextView: ViewState) => {
    setTransitioning(true);
    setTimeout(() => {
      setView(nextView);
      setTransitioning(false);
    }, 300); // matches transition speed
  };

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
            onLoginSuccess={() => changeView("success")}
          />
        )}

        {view === "signup" && (
          <SignUpView
            onLoginClick={() => changeView("login")}
            onBackClick={() => changeView("splash")}
            onSignUpSuccess={() => changeView("success")}
          />
        )}

        {view === "success" && (
          <DashboardView onLogout={() => changeView("splash")} />
        )}
      </div>
    </div>
  );
}
