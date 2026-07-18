"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function DashboardPage() {
  const [mode, setMode] = useState<"find" | "offer">("find");
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [swapping, setSwapping] = useState(false);
  const router = useRouter();

  const handleSwap = () => {
    setSwapping(true);
    setStart(destination);
    setDestination(start);
    // brief animation pulse, then settle
    window.setTimeout(() => setSwapping(false), 300);
  };

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          {/* Mode switch */}
          <div className="mb-6 flex gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
            <button
              onClick={() => setMode("find")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                mode === "find" ? "bg-white text-teal-600 shadow-soft dark:bg-ink-700 dark:text-teal-300" : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Find Ride
            </button>
            <button
              onClick={() => setMode("offer")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                mode === "offer" ? "bg-white text-teal-600 shadow-soft dark:bg-ink-700 dark:text-teal-300" : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Offer Ride
            </button>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(mode === "find" ? "/available-rides" : "/dashboard?published=1");
            }}
          >
            <div className="relative">
              <div className={`transition-transform duration-300 ${swapping ? "scale-[0.99]" : ""}`}>
                <Input
                  label="Start Location"
                  placeholder="Enter your location"
                  icon={<Icons.pin />}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
                <div className="mt-4">
                  <Input
                    label="Destination Location"
                    placeholder="Enter drop location"
                    icon={<Icons.pin />}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label="Swap start and destination"
                onClick={handleSwap}
                className={`absolute right-3 top-9 flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-400 transition-all duration-300 hover:border-teal-400 hover:text-teal-500 dark:border-ink-600 dark:bg-ink-800 ${
                  swapping ? "rotate-180 text-teal-500" : ""
                }`}
              >
                <Icons.swap width={14} height={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date & time" type="datetime-local" defaultValue="2026-07-18T17:12" required />
              <Input label={mode === "find" ? "Seats required" : "Seats available"} type="number" min={1} defaultValue={1} required />
            </div>

            {mode === "offer" && <Input label="Fare per seat (₹)" type="number" defaultValue={120} required />}

            <label className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3 text-sm dark:border-ink-800">
              <span className="text-ink-600 dark:text-ink-300">Recurring ride — Mo, Tu, We, Th, Fr</span>
              <input type="checkbox" className="h-4 w-4 accent-teal-500" />
            </label>

            <Button type="submit" size="lg" className="mt-2 w-full">
              {mode === "find" ? "Find Ride" : "Publish Ride"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
