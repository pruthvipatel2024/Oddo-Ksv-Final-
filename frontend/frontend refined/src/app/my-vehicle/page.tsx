"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { myVehicle as initialVehicle, vehicleCatalog } from "@/lib/mock-data";

type Vehicle = { model: string; regNo: string; role: string };

export default function MyVehiclePage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(initialVehicle);
  const [adding, setAdding] = useState(false);
  const [selectedModel, setSelectedModel] = useState(vehicleCatalog[0].model);
  const [regNo, setRegNo] = useState("");

  const selected = vehicleCatalog.find((v) => v.model === selectedModel)!;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicle({ model: selectedModel, regNo: regNo.toUpperCase(), role: "Driver" });
    setAdding(false);
    setRegNo("");
  };

  return (
    <AppShell title="My Vehicle">
      <div className="mx-auto max-w-xl">
        {vehicle && !adding && (
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icons.vehicle width={26} height={26} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink-800 dark:text-white">{vehicle.model}</p>
                  <p className="font-mono text-sm text-ink-400">{vehicle.regNo}</p>
                  <Badge tone="teal">{vehicle.role}</Badge>
                </div>
              </div>
              <button
                aria-label="Change vehicle"
                onClick={() => setAdding(true)}
                className="text-ink-400 hover:text-teal-500"
              >
                <Icons.settings width={18} height={18} />
              </button>
            </div>

            <div className="route-divider my-5 text-ink-100 dark:text-ink-800" />

            <p className="text-sm text-ink-500 dark:text-ink-400">
              This is the vehicle registered to your account. It&apos;s used whenever you publish a ride under
              <span className="font-semibold text-ink-700 dark:text-ink-200"> Offer Ride</span>.
            </p>

            <Button variant="secondary" className="mt-5 w-full" onClick={() => setAdding(true)}>
              Change Vehicle
            </Button>
          </Card>
        )}

        {!vehicle && !adding && (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
              <Icons.vehicle width={26} height={26} />
            </div>
            <p className="font-display text-lg font-bold text-ink-800 dark:text-white">No vehicle registered</p>
            <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
              Add your vehicle to start offering rides to your team.
            </p>
            <Button className="mt-2" onClick={() => setAdding(true)}>
              <Icons.plus width={16} height={16} /> Add Vehicle
            </Button>
          </Card>
        )}

        {adding && (
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">
              {vehicle ? "Change Vehicle" : "Add Vehicle"}
            </h2>
            <p className="mb-5 text-sm text-ink-400">Choose your vehicle from the list — seats fill in automatically.</p>

            <form className="flex flex-col gap-4" onSubmit={handleAdd}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-300">Vehicle model</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 outline-none focus:border-teal-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
                >
                  {vehicleCatalog.map((v) => (
                    <option key={v.model} value={v.model}>
                      {v.model} · {v.type}
                    </option>
                  ))}
                </select>
              </label>

              {/* Catalog picker as visual cards, for a quicker glanceable choice */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {vehicleCatalog.map((v) => (
                  <button
                    type="button"
                    key={v.model}
                    onClick={() => setSelectedModel(v.model)}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                      selectedModel === v.model
                        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                        : "border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300"
                    }`}
                  >
                    <p className="font-semibold">{v.model}</p>
                    <p className="text-ink-400">{v.type} · {v.seats} seats</p>
                  </button>
                ))}
              </div>

              <Input
                label="Registration number"
                placeholder="GJ01AB1234"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />

              <div className="rounded-xl border border-ink-100 px-4 py-3 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
                Seating capacity: <span className="font-semibold text-ink-700 dark:text-ink-200">{selected.seats}</span> (auto-filled from model)
              </div>

              <div className="flex gap-3">
                {vehicle && (
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  Save Vehicle
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
