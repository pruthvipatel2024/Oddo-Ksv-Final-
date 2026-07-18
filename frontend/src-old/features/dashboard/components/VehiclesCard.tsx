"use client";

import React, { useState } from 'react';
import { Car, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VehiclesCardProps {
  vehicles: any[];
  onRegisterVehicle: (payload: { manufacturer: string; model: string; color: string; registrationNumber: string; seatingCapacity: number }) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function VehiclesCard({
  vehicles,
  onRegisterVehicle,
  onDeleteVehicle,
  isSubmitting
}: VehiclesCardProps) {
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!model.trim() || !plate.trim()) {
      setError('Please fill in all vehicle registration fields.');
      return;
    }

    try {
      await onRegisterVehicle({
        manufacturer: 'Toyota',
        model: model.trim(),
        color: 'Silver',
        registrationNumber: plate.trim().toUpperCase(),
        seatingCapacity: capacity
      });
      setModel('');
      setPlate('');
      setCapacity(4);
    } catch (err: any) {
      setError(err?.message || 'Failed to register vehicle.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Car className="h-5 w-5 text-indigo-650" />
          <span>My Registered Vehicles</span>
        </h2>

        <div className="mt-5 space-y-4">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 rounded-xl dark:border-zinc-800">
              <AlertCircle className="h-8 w-8 text-zinc-350" />
              <p className="text-xs font-semibold text-zinc-500 mt-2">No vehicles registered</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">You must register at least one verified vehicle to offer rides</p>
            </div>
          ) : (
            vehicles.map((v) => {
              const isVerified = v.verificationStatus === 'VERIFIED';
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-850 dark:bg-zinc-900/50"
                >
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{v.model || v.manufacturer}</h4>
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      {v.registrationNumber} · Seats: {v.seatingCapacity}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[8px] font-extrabold uppercase mt-1 rounded-full px-2 py-0.5 ${
                      isVerified 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                    }`}>
                      {isVerified ? <CheckCircle2 className="h-2.5 w-2.5" /> : null}
                      <span>{v.verificationStatus}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteVehicle(v.id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-650" />
          <span>Register New Vehicle</span>
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-650 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Vehicle Model</label>
            <input
              type="text"
              placeholder="e.g. Swift Dzire or Honda City"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Registration Number Plate</label>
            <input
              type="text"
              placeholder="e.g. GJ01AB1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Passenger Seating Capacity</label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} Seats
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {isSubmitting ? 'Registering...' : 'Register Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}
