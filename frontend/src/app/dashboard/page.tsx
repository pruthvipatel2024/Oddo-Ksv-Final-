"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useVehicles } from "@/hooks/useVehicles";
import { useRides } from "@/hooks/useRides";
import { useSession } from "@/context/SessionContext";
import { nominatimService, GeocodingResult } from "@/services/maps/nominatim.service";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useSession();
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { createRide, isCreating } = useRides();

  // Filter vehicles to show only those owned by the current logged-in employee
  const myVehicles = vehicles.filter((v) => v.ownerId === user?.id);

  const [mode, setMode] = useState<"find" | "offer">("find");
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [swapping, setSwapping] = useState(false);

  // Geocoding states
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<GeocodingResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [lastSelectedStart, setLastSelectedStart] = useState("");
  const [lastSelectedDest, setLastSelectedDest] = useState("");

  // Form Inputs
  const [dateTime, setDateTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [farePerSeat, setFarePerSeat] = useState(120);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Set default datetime to today + 1 hour
  useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    // Format to yyyy-MM-ddThh:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    const localDateTimeString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setDateTime(localDateTimeString);
  }, []);

  // Fetch suggestions for Start Location
  useEffect(() => {
    if (start.trim().length > 3 && start !== lastSelectedStart) {
      const delay = setTimeout(async () => {
        const results = await nominatimService.searchAddress(start);
        setStartSuggestions(results);
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setStartSuggestions([]);
    }
  }, [start, lastSelectedStart]);

  // Fetch suggestions for Destination Location
  useEffect(() => {
    if (destination.trim().length > 3 && destination !== lastSelectedDest) {
      const delay = setTimeout(async () => {
        const results = await nominatimService.searchAddress(destination);
        setDestSuggestions(results);
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setDestSuggestions([]);
    }
  }, [destination, lastSelectedDest]);

  // Sync selected vehicle
  useEffect(() => {
    if (myVehicles && myVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(myVehicles[0].id);
    }
  }, [myVehicles, selectedVehicleId]);

  const handleSwap = () => {
    setSwapping(true);
    const tempStart = start;
    const tempStartCoords = startCoords;
    const tempLastSelectedStart = lastSelectedStart;

    setStart(destination);
    setStartCoords(destCoords);
    setLastSelectedStart(lastSelectedDest);

    setDestination(tempStart);
    setDestCoords(tempStartCoords);
    setLastSelectedDest(tempLastSelectedStart);

    // brief animation pulse, then settle
    window.setTimeout(() => setSwapping(false), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!startCoords || !destCoords) {
      setError("Please select valid locations from the suggestions list.");
      return;
    }

    if (mode === "find") {
      // Forward to available rides list with parameters
      const url = `/available-rides?pickupLat=${startCoords[0]}&pickupLng=${startCoords[1]}&destinationLat=${destCoords[0]}&destinationLng=${destCoords[1]}&seats=${seats}&date=${encodeURIComponent(new Date(dateTime).toISOString())}&startAddress=${encodeURIComponent(start)}&destAddress=${encodeURIComponent(destination)}`;
      router.push(url);
    } else {
      // Offer Ride (Publish)
      if (!selectedVehicleId) {
        setError("You must select a vehicle to publish a ride offer.");
        return;
      }

      try {
        const isoDate = new Date(dateTime);
        const timeString = `${String(isoDate.getHours()).padStart(2, "0")}:${String(isoDate.getMinutes()).padStart(2, "0")}`;

        await createRide({
          vehicleId: selectedVehicleId,
          pickupAddress: start,
          pickupLat: startCoords[0],
          pickupLng: startCoords[1],
          destinationAddress: destination,
          destinationLat: destCoords[0],
          destinationLng: destCoords[1],
          date: isoDate.toISOString(),
          time: timeString,
          availableSeats: seats,
          farePerSeat: Number(farePerSeat),
        });

        setSuccessMsg("Ride offer published successfully!");
        setStart("");
        setDestination("");
        setStartCoords(null);
        setDestCoords(null);
      } catch (err: any) {
        setError(err?.message || "Failed to publish ride. Please try again.");
      }
    }
  };

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          {/* Mode switch */}
          <div className="mb-6 flex gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
            <button
              onClick={() => { setMode("find"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                mode === "find" ? "bg-white text-teal-600 shadow-soft dark:bg-ink-700 dark:text-teal-300" : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Find Ride
            </button>
            <button
              onClick={() => { setMode("offer"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                mode === "offer" ? "bg-white text-teal-600 shadow-soft dark:bg-ink-700 dark:text-teal-300" : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Offer Ride
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl bg-teal-50 p-3 text-xs font-semibold text-teal-650 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30">
              {successMsg}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <div className={`transition-transform duration-300 ${swapping ? "scale-[0.99]" : ""}`}>
                <div className="relative">
                  <Input
                    label="Start Location"
                    placeholder="Search pickup point..."
                    icon={<Icons.pin />}
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {startSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 z-[1000] max-h-48 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-lg dark:border-ink-800 dark:bg-ink-900">
                      {startSuggestions.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setStart(s.label);
                            setStartCoords([s.lat, s.lng]);
                            setLastSelectedStart(s.label);
                            setStartSuggestions([]);
                          }}
                          className="cursor-pointer rounded-lg p-2.5 text-xs text-ink-650 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 relative">
                  <Input
                    label="Destination Location"
                    placeholder="Search drop location..."
                    icon={<Icons.pin />}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {destSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 z-[1000] max-h-48 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-lg dark:border-ink-800 dark:bg-ink-900">
                      {destSuggestions.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDestination(s.label);
                            setDestCoords([s.lat, s.lng]);
                            setLastSelectedDest(s.label);
                            setDestSuggestions([]);
                          }}
                          className="cursor-pointer rounded-lg p-2.5 text-xs text-ink-650 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Swap start and destination"
                onClick={handleSwap}
                className={`absolute right-3 top-9 flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-400 transition-all duration-300 hover:border-teal-400 hover:text-teal-500 dark:border-ink-600 dark:bg-ink-800 cursor-pointer ${
                  swapping ? "rotate-180 text-teal-500" : ""
                }`}
              >
                <Icons.swap width={14} height={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date & time"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
              <Input
                label={mode === "find" ? "Seats required" : "Seats available"}
                type="number"
                min={1}
                max={6}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                required
              />
            </div>

            {mode === "offer" && (
              <>
                <Input
                  label="Fare per seat (₹)"
                  type="number"
                  min={1}
                  value={farePerSeat}
                  onChange={(e) => setFarePerSeat(Number(e.target.value))}
                  required
                />

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-300">Select Vehicle</span>
                  {isLoadingVehicles ? (
                    <div className="text-xs text-ink-400">Loading vehicles...</div>
                  ) : myVehicles.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-red-200 bg-red-50/20 p-3 text-xs text-red-650 dark:border-red-900/30 dark:text-red-400">
                      You must register a vehicle first.{" "}
                      <Link href="/my-vehicle" className="font-bold underline hover:text-red-500">
                        Go to My Vehicle
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 outline-none focus:border-teal-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
                    >
                      {myVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.registrationNumber})
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              </>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={isCreating || (mode === "offer" && myVehicles.length === 0)}
            >
              {isCreating ? "Publishing..." : mode === "find" ? "Find Ride" : "Publish Ride"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
