"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

const options = [
  { id: "cash", label: "Cash Payment" },
  { id: "card", label: "Card Payment" },
  { id: "upi", label: "UPI Payment" },
  { id: "wallet", label: "Wallet Payment" },
];

export default function MyTripsPage() {
  const [selected, setSelected] = useState("upi");

  return (
    <AppShell title="My Trips">
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Complete Payment</h2>
          <p className="mb-5 text-sm text-ink-400">Trip: Iskcon → Infocity with Raj Patel</p>

          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                  selected === opt.id
                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                    : "border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {selected === "upi" && (
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-ink-100 text-ink-400 dark:bg-ink-800">
                <Icons.qr width={36} height={36} />
              </div>
              <div>
                <p className="text-sm text-ink-500 dark:text-ink-400">Pay via UPI ID</p>
                <p className="font-mono text-sm font-semibold text-ink-800 dark:text-ink-100">RidesFare@ABCD</p>
                <p className="mt-1 text-xs text-ink-400">or scan the QR code</p>
              </div>
            </div>
          )}

          <Button className="mt-6 w-full" size="lg">
            Pay ₹120
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
