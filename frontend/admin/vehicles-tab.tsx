'use client';

import React, { useState } from 'react';
import { Vehicle, Employee } from './types';
import { validateVehicleReg, validateRequired, validatePositiveInteger } from './validation';

interface VehiclesTabProps {
  vehicles: Vehicle[];
  employees: Employee[];
  onAddVehicle: (vehicle: Vehicle) => void;
}

export default function VehiclesTab({ vehicles, employees, onAddVehicle }: VehiclesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    seatingCapacity: '',
    driver: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleOpenModal = () => {
    setFormData({
      registrationNumber: '',
      model: '',
      seatingCapacity: '',
      driver: employees[0]?.name || '',
      status: 'Active',
    });
    setErrors({});
    setTouched({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMsg: string | null = null;
    if (name === 'registrationNumber') {
      errorMsg = validateVehicleReg(value);
    } else if (name === 'model') {
      errorMsg = validateRequired(value, 'Vehicle model');
    } else if (name === 'seatingCapacity') {
      errorMsg = validateRequired(value, 'Seating capacity') || validatePositiveInteger(value, 'Seating capacity');
    } else if (name === 'driver') {
      errorMsg = validateRequired(value, 'Driver');
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const regErr = validateVehicleReg(formData.registrationNumber);
    const modelErr = validateRequired(formData.model, 'Vehicle model');
    const capErr = validateRequired(formData.seatingCapacity, 'Seating capacity') || validatePositiveInteger(formData.seatingCapacity, 'Seating capacity');
    const driverErr = validateRequired(formData.driver, 'Driver');

    if (regErr) newErrors.registrationNumber = regErr;
    if (modelErr) newErrors.model = modelErr;
    if (capErr) newErrors.seatingCapacity = capErr;
    if (driverErr) newErrors.driver = driverErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        registrationNumber: true,
        model: true,
        seatingCapacity: true,
        driver: true,
      });
      return;
    }

    // Standardize registration number to uppercase without spaces/hyphens for storing
    const formattedReg = formData.registrationNumber.trim().replace(/[-\s]/g, '').toUpperCase();

    onAddVehicle({
      id: `veh-${Date.now()}`,
      registrationNumber: formattedReg,
      model: formData.model.trim(),
      seatingCapacity: parseInt(formData.seatingCapacity, 10),
      driver: formData.driver,
      status: formData.status,
    });

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Registered Vehicles Fleet</h2>
          <p className="text-sm text-zinc-400">Track company vehicles, seating capacity, assigned drivers, and status.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
        <table className="min-w-full divide-y divide-zinc-800 text-left">
          <thead className="bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Registration Number</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Seating Capacity</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/10 text-sm text-zinc-300">
            {vehicles.map((veh) => (
              <tr key={veh.id} className="hover:bg-zinc-800/40 transition-colors duration-150">
                <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-zinc-100 tracking-wider">
                  {veh.registrationNumber.slice(0, 4)} {veh.registrationNumber.slice(4, 6)} {veh.registrationNumber.slice(6)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-300">{veh.model}</td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">{veh.seatingCapacity} Seats</td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-300">{veh.driver}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      veh.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        veh.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    {veh.status}
                  </span>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No vehicles registered yet. Click "Add Vehicle" to register one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Backdrop & Container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-300">
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl transform scale-100 transition-transform duration-300 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-100">Add New Vehicle</h3>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Registration Number Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. GJ01AB1234"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.registrationNumber && touched.registrationNumber
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.registrationNumber && touched.registrationNumber && (
                  <p className="mt-1 text-xs text-rose-500">{errors.registrationNumber}</p>
                )}
              </div>

              {/* Vehicle Model Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Swift Dzire"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.model && touched.model
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.model && touched.model && (
                  <p className="mt-1 text-xs text-rose-500">{errors.model}</p>
                )}
              </div>

              {/* Seating Capacity Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 4"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.seatingCapacity && touched.seatingCapacity
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.seatingCapacity && touched.seatingCapacity && (
                  <p className="mt-1 text-xs text-rose-500">{errors.seatingCapacity}</p>
                )}
              </div>

              {/* Driver & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Assign Driver
                  </label>
                  {employees.length > 0 ? (
                    <select
                      name="driver"
                      value={formData.driver}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-zinc-500 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                      No employees available
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Fleet Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 bg-transparent hover:bg-zinc-800/50 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
