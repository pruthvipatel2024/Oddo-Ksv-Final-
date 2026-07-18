"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useWallet } from "@/hooks/useWallet";

<<<<<<< HEAD
type Method = "card" | "upi" | "netbanking" | "cash";
=======
type Method = "card" | "upi" | "netbanking";
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318

const methods: { id: Method; label: string; hint: string }[] = [
  { id: "upi", label: "UPI", hint: "UPI ID or QR scan" },
  { id: "card", label: "Card", hint: "Debit or credit card" },
  { id: "netbanking", label: "Net Banking", hint: "Pay via your bank" },
<<<<<<< HEAD
  { id: "cash", label: "Cash", hint: "Add cash at a kiosk" },
=======
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
];

const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"];

export default function WalletPage() {
  const { wallet, recharge, isRecharging, isLoading } = useWallet();

  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState<Method>("upi");
  const [step, setStep] = useState<"form" | "success">("form");
  const [error, setError] = useState("");

  // per-method fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState(banks[0]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await recharge(amount);
      setStep("success");
    } catch (err: any) {
      setError(err?.message || "Failed to process payment. Try again.");
    }
  };

  const currentBalance = wallet?.availableBalance || 0;

  return (
    <AppShell title="Wallet">
      <div className="mx-auto max-w-xl">
        <Card className="mb-5 flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white border-none shadow-soft-lg">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-100">Wallet Balance</p>
            <p className="font-display text-3xl font-bold">₹ {isLoading ? "..." : currentBalance}</p>
          </div>
          <Icons.wallet width={32} height={32} />
        </Card>

        {step === "success" ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400">
              <Icons.wallet width={26} height={26} />
            </div>
            <p className="font-display text-lg font-bold text-ink-800 dark:text-white">₹{amount} added successfully</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Updated balance: <span className="font-mono font-semibold text-ink-700 dark:text-ink-200">₹{currentBalance}</span>
            </p>
            <Button className="mt-3" onClick={() => setStep("form")}>
              Recharge again
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Recharge Wallet</h2>
            <p className="mb-5 text-sm text-ink-400">Specify recharge amount and complete payment method details.</p>

            <form className="flex flex-col gap-5" onSubmit={handlePay}>
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              {/* Step 1: amount */}
              <div>
                <Input label="Amount" type="number" min={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
                <div className="mt-2 flex gap-2">
                  {[200, 500, 1000, 2000].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                        amount === v
                          ? "border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300"
                          : "border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-400"
                      }`}
                    >
                      ₹{v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: method */}
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-300">Payment method</span>
<<<<<<< HEAD
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
=======
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
                  {methods.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`rounded-xl border p-3 text-left text-xs transition-colors cursor-pointer ${
                        method === m.id
                          ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                          : "border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300"
                      }`}
                    >
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-[10px] text-ink-450">{m.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: method-specific detail */}
              {method === "card" && (
                <div className="flex flex-col gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                  <Input
                    label="Card number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                    <Input
                      label="CVV"
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-ink-400">Your card is charged once you tap Add ₹{amount} below.</p>
                </div>
              )}

              {method === "upi" && (
                <div className="flex flex-col gap-4 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                  <Input
                    label="UPI ID"
                    placeholder="yourname@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-ink-100 text-ink-450 dark:bg-ink-800">
                      <Icons.qr width={36} height={36} />
                    </div>
                    <div className="text-sm">
                      <p className="text-ink-500 dark:text-ink-400">Or scan to pay to</p>
                      <p className="font-mono font-semibold text-teal-650 dark:text-teal-400">RidesFare@ABCD</p>
                      <p className="mt-1 text-xs text-ink-400">You&apos;ll get a payment request on your UPI app.</p>
                    </div>
                  </div>
                </div>
              )}

              {method === "netbanking" && (
                <div className="flex flex-col gap-3 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                  <span className="text-sm font-medium text-ink-600 dark:text-ink-300">Select your bank</span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {banks.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBank(b)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm cursor-pointer ${
                          bank === b
                            ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                            : "border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-ink-400">You&apos;ll be redirected to {bank}&apos;s secure login to complete payment.</p>
                </div>
              )}

<<<<<<< HEAD
              {method === "cash" && (
                <div className="flex flex-col gap-2 rounded-xl border border-dashed border-ink-200 p-4 text-sm dark:border-ink-700">
                  <p className="font-medium text-ink-700 dark:text-ink-200">Add cash at a partner kiosk</p>
                  <p className="text-ink-500 dark:text-ink-400">
                    Show this reference code at any partner kiosk or your office admin desk. Your wallet updates within a few minutes of payment.
                  </p>
                  <div className="mt-1 w-fit rounded-lg bg-ink-100 px-3 py-1.5 font-mono text-xs font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                    REF-8842-CASH
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isRecharging}>
                {isRecharging ? "Processing..." : method === "cash" ? "Generate Reference Code" : `Add ₹${amount}`}
=======
              <Button type="submit" className="w-full" size="lg" disabled={isRecharging}>
                {isRecharging ? "Processing..." : `Add ₹${amount}`}
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
              </Button>
              <p className="text-center text-xs text-ink-400">Payments are encrypted and processed securely.</p>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
