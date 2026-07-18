"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useVehicles } from "@/hooks/useVehicles";
<<<<<<< HEAD
import { vehicleCatalog } from "@/lib/mock-data";

export default function MyVehiclePage() {
  const { vehicles, createVehicle, deleteVehicle, isLoading, isCreating } = useVehicles();
  const [adding, setAdding] = useState(false);
  const [selectedModel, setSelectedModel] = useState(vehicleCatalog[0].model);
  const [regNo, setRegNo] = useState("");
  const [color, setColor] = useState("White");
=======
export default function MyVehiclePage() {
  const { vehicles, createVehicle, deleteVehicle, isLoading, isCreating } = useVehicles();
  const [adding, setAdding] = useState(false);
  const [modelName, setModelName] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState<number | "">("");
  const [regNo, setRegNo] = useState("");
  const [color, setColor] = useState("");
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318

  // Get the first registered vehicle
  const activeVehicle = vehicles[0] || null;

<<<<<<< HEAD
  const selected = vehicleCatalog.find((v) => v.model === selectedModel)!;

  const getManufacturer = (modelName: string) => {
    if (modelName.includes("Swift") || modelName.includes("Alto") || modelName.includes("Baleno") || modelName.includes("Ertiga")) return "Suzuki";
    if (modelName.includes("Innova")) return "Toyota";
    if (modelName.includes("City")) return "Honda";
    if (modelName.includes("Nexon")) return "Tata";
=======
  const getManufacturer = (modelName: string) => {
    const lowerModel = modelName.toLowerCase();
    if (lowerModel.includes("swift") || lowerModel.includes("alto") || lowerModel.includes("baleno") || lowerModel.includes("ertiga")) return "Suzuki";
    if (lowerModel.includes("innova")) return "Toyota";
    if (lowerModel.includes("city")) return "Honda";
    if (lowerModel.includes("nexon")) return "Tata";
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
    return "Other";
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
=======
    if (!modelName.trim()) return;
    if (seatingCapacity === "" || isNaN(Number(seatingCapacity)) || Number(seatingCapacity) <= 0) {
      return;
    }
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
    try {
      // If there is already a vehicle, remove it first
      if (activeVehicle) {
        await deleteVehicle(activeVehicle.id);
      }
      await createVehicle({
<<<<<<< HEAD
        manufacturer: getManufacturer(selectedModel),
        model: selectedModel,
        color: color.trim(),
        registrationNumber: regNo.toUpperCase().trim(),
        seatingCapacity: selected.seats,
      });
      setAdding(false);
      setRegNo("");
      setColor("White");
=======
        manufacturer: getManufacturer(modelName),
        model: modelName.trim(),
        color: color.trim(),
        registrationNumber: regNo.toUpperCase().trim(),
        seatingCapacity: Number(seatingCapacity),
      });
      setAdding(false);
      setModelName("");
      setSeatingCapacity("");
      setRegNo("");
      setColor("");
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
    } catch (err) {
      console.error("Failed to add vehicle", err);
    }
  };

  const handleDelete = async () => {
    if (activeVehicle) {
      try {
        await deleteVehicle(activeVehicle.id);
        setAdding(true);
      } catch (err) {
        console.error("Failed to delete vehicle", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge tone="teal">Verified</Badge>;
      case "REJECTED":
        return <Badge tone="danger">Rejected</Badge>;
      case "SUSPENDED":
        return <Badge tone="danger">Suspended</Badge>;
      case "PENDING":
      default:
        return <Badge tone="warning">Pending Verification</Badge>;
    }
  };

  return (
    <AppShell title="My Vehicle">
      <div className="mx-auto max-w-xl">
        {isLoading ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <span className="text-sm text-ink-500">Loading vehicle details...</span>
          </Card>
        ) : activeVehicle && !adding ? (
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icons.vehicle width={26} height={26} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink-800 dark:text-white">
                    {activeVehicle.model} <span className="text-sm text-ink-400">({activeVehicle.color})</span>
                  </p>
                  <p className="font-mono text-sm text-ink-400">{activeVehicle.registrationNumber}</p>
                  <div className="mt-1">{getStatusBadge(activeVehicle.verificationStatus)}</div>
                </div>
              </div>
              <button
                aria-label="Change vehicle"
                onClick={handleDelete}
                className="text-ink-400 hover:text-teal-500 cursor-pointer"
              >
                <Icons.settings width={18} height={18} />
              </button>
            </div>

            <div className="route-divider my-5 text-ink-100 dark:text-ink-800" />

            <p className="text-sm text-ink-500 dark:text-ink-400">
              This is the vehicle registered to your account. It&apos;s used whenever you publish a ride under
              <span className="font-semibold text-teal-500"> Offer Ride</span>.
            </p>

            <Button variant="secondary" className="mt-5 w-full" onClick={handleDelete}>
              Change Vehicle
            </Button>
          </Card>
        ) : !activeVehicle && !adding ? (
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
        ) : (
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">
              {activeVehicle ? "Change Vehicle" : "Add Vehicle"}
            </h2>
<<<<<<< HEAD
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

              {/* Catalog picker as visual cards */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {vehicleCatalog.map((v) => (
                  <button
                    type="button"
                    key={v.model}
                    onClick={() => setSelectedModel(v.model)}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors cursor-pointer ${
                      selectedModel === v.model
                        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                        : "border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300"
                    }`}
                  >
                    <p className="font-semibold">{v.model}</p>
                    <p className="text-[10px] text-ink-450">{v.type} · {v.seats} seats</p>
                  </button>
                ))}
              </div>
=======
            <p className="mb-5 text-sm text-ink-400">Enter your vehicle details below.</p>

            <form className="flex flex-col gap-4" onSubmit={handleAdd}>
              <Input
                label="Vehicle model"
                placeholder="e.g. Swift Dzire, Innova Crysta"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />

              <Input
                label="Seating capacity"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 4"
                value={seatingCapacity}
                onChange={(e) => {
                  const val = e.target.value;
                  setSeatingCapacity(val === "" ? "" : Number(val));
                }}
                required
              />
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Registration number"
                  placeholder="GJ01AB1234"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  required
                />
                <Input
                  label="Color"
                  placeholder="e.g. White, Silver"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                />
              </div>

<<<<<<< HEAD
              <div className="rounded-xl border border-ink-100 px-4 py-3 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
                Seating capacity: <span className="font-semibold text-ink-700 dark:text-ink-200">{selected.seats}</span> (auto-filled from model)
              </div>

              <div className="flex gap-3">
=======
              <div className="flex gap-3 mt-2">
>>>>>>> 3de08a7cd47a1e32b768d64f5b93e40265f4b318
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save Vehicle"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
