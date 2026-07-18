"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface SplashViewProps {
  onStart: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      className="relative flex min-h-screen w-full cursor-pointer flex-col items-center justify-between overflow-hidden bg-[#fafafa] px-6 py-16 transition-all duration-700"
    >
      {/* Decorative ambient background elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[50%] rounded-full bg-linear-to-br from-indigo-100/50 to-violet-100/30 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[50%] rounded-full bg-linear-to-tr from-sky-100/40 to-indigo-100/30 blur-3xl" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top Brand Name */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
          <span className="font-sans text-xl font-bold tracking-tight">O</span>
        </div>
        <span className="font-sans text-xl font-bold tracking-tight text-zinc-800">
          Carpooling
        </span>
      </div>

      {/* Center Illustration and Slogans */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12">
        {/* Floating Car SVG Container */}
        <div className="relative flex h-64 w-64 animate-[float_4s_ease-in-out_infinite] items-center justify-center">
          {/* Shadow beneath the floating car */}
          <div className="absolute bottom-4 h-4 w-40 animate-[shadow_4s_ease-in-out_infinite] rounded-full bg-indigo-900/10 blur-md" />

          {/* Premium SVG Car and Passengers */}
          <svg
            className="h-48 w-48 text-indigo-600"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Aura */}
            <circle cx="100" cy="95" r="70" fill="url(#circleGrad)" opacity="0.15" />

            {/* Passengers */}
            {/* Left Passenger */}
            <circle cx="75" cy="85" r="12" fill="#818CF8" />
            <path d="M60 110 C 60 98, 90 98, 90 110" fill="#818CF8" />

            {/* Right Passenger */}
            <circle cx="125" cy="85" r="12" fill="#818CF8" />
            <path d="M110 110 C 110 98, 140 98, 140 110" fill="#818CF8" />

            {/* Center/Driver Passenger (Slightly prominent) */}
            <circle cx="100" cy="80" r="14" fill="#4F46E5" />
            <path d="M82 110 C 82 95, 118 95, 118 110" fill="#4F46E5" />

            {/* Car body */}
            {/* Windshield Area */}
            <path
              d="M55 110 L70 75 Q73 70 80 70 L120 70 Q127 70 130 75 L145 110 Z"
              fill="white"
              stroke="#4F46E5"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Windshield divider / details */}
            <path d="M100 70 L100 110" stroke="#4F46E5" strokeWidth="2" strokeDasharray="3 3" />

            {/* Lower Main Car Body */}
            <rect
              x="35"
              y="105"
              width="130"
              height="50"
              rx="18"
              fill="white"
              stroke="#4F46E5"
              strokeWidth="5"
            />

            {/* Tires */}
            <rect x="50" y="152" width="22" height="15" rx="5" fill="#1F2937" />
            <rect x="128" y="152" width="22" height="15" rx="5" fill="#1F2937" />

            {/* Headlights */}
            <circle cx="55" cy="125" r="8" fill="#FBBF24" stroke="#4F46E5" strokeWidth="3" />
            <circle cx="145" cy="125" r="8" fill="#FBBF24" stroke="#4F46E5" strokeWidth="3" />
            {/* Light beam effect */}
            <path d="M55 125 L20 135 M55 125 L20 115" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M145 125 L180 135 M145 125 L180 115" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

            {/* Bumper and Grille details */}
            <rect x="75" y="125" width="50" height="8" rx="4" fill="#E5E7EB" stroke="#4F46E5" strokeWidth="3" />
            <line x1="85" y1="129" x2="115" y2="129" stroke="#4F46E5" strokeWidth="2" />

            {/* Gradients */}
            <defs>
              <linearGradient id="circleGrad" x1="30" y1="25" x2="170" y2="165" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text Slogans */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            <span className="block bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Ride Together
            </span>
            <span className="mt-1 block text-zinc-800">
              Save Together
            </span>
          </h2>
          <p className="max-w-xs text-sm font-medium text-zinc-500 sm:text-base">
            Share journeys, cut costs, and build connections at your organization.
          </p>
        </div>
      </div>

      {/* Touch/Click Action Prompt */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-md shadow-zinc-100 ring-1 ring-zinc-100 hover:scale-105 active:scale-95 transition-transform duration-300">
          <span className="text-sm font-semibold text-indigo-600">
            Touch anywhere to start
          </span>
          <ArrowRight className="h-4 w-4 animate-[pulse_1.5s_infinite] text-indigo-600" />
        </div>
      </div>
    </div>
  );
};
