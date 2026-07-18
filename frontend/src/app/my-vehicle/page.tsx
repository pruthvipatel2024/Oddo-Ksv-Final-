"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useVehicles } from "@/hooks/useVehicles";

export default function MyVehiclePage() {
  const { vehicles, createVehicle, deleteVehicle, isLoading, isCreating } = useVehicles();
  const [adding, setAdding] = useState(false);
  const [modelName, setModelName] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState<number | "">("");
  const [regNo, setRegNo] = useState("");
  const [color, setColor] = useState("");

  // Get the first registered vehicle
  const activeVehicle = vehicles[0] || null;

  const getManufacturer = (modelName: string) => {
    const lowerModel = modelName.toLowerCase();
    if (lowerModel.includes("swift") || lowerModel.includes("alto") || lowerModel.includes("baleno") || lowerModel.includes("ertiga")) return "Suzuki";
    if (lowerModel.includes("innova")) return "Toyota";
    if (lowerModel.includes("city")) return "Honda";
    if (lowerModel.includes("nexon")) return "Tata";
    return "Other";
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) return;
    if (seatingCapacity === "" || isNaN(Number(seatingCapacity)) || Number(seatingCapacity) <= 0) {
      return;
    }
    try {
      // If there is already a vehicle, remove it first
      if (activeVehicle) {
        await deleteVehicle(activeVehicle.id);
      }
      await createVehicle({
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
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-650 dark:bg-teal-500/10 dark:text-teal-300">
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

              <div className="flex gap-3 mt-2">
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
