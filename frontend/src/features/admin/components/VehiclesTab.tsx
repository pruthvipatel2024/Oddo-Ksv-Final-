'use client';

import React, { useState } from 'react';
import { Vehicle, Employee } from '../types';
import { validateVehicleReg, validateRequired, validatePositiveInteger } from '../validation';

interface VehiclesTabProps {
  vehicles: any[];
  employees: Employee[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onVerifyVehicle?: (id: string, status: 'VERIFIED' | 'REJECTED') => void;
  theme: 'light' | 'dark';
}

export default function VehiclesTab({ vehicles, employees, onAddVehicle, onVerifyVehicle, theme }: VehiclesTabProps) {
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold transition-colors ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-800'}`}>
            Registered Vehicles Fleet
          </h2>
          <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
            Track company vehicles, seating capacity, assigned drivers, and active status.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className={`overflow-x-auto rounded-xl border shadow-2xl transition-colors ${
        theme === 'dark' ? 'border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md' : 'border-slate-200 bg-white'
      }`}>
        <table className="min-w-full divide-y divide-zinc-850 text-left">
          <thead className={`text-xs font-bold uppercase tracking-wider transition-colors ${
            theme === 'dark' ? 'bg-zinc-900/60 text-zinc-400' : 'bg-slate-100/80 text-slate-500'
          }`}>
            <tr>
              <th className="px-6 py-4">Registration Number</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Seating Capacity</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-sm transition-colors ${
            theme === 'dark' ? 'divide-zinc-800/40 text-zinc-300 bg-zinc-900/10' : 'divide-slate-200/60 text-slate-700 bg-white'
          }`}>
            {vehicles.map((veh) => (
              <tr key={veh.id} className={`transition-colors duration-150 ${
                theme === 'dark' ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50/70'
              }`}>
                <td className={`whitespace-nowrap px-6 py-4 font-mono font-bold tracking-wider ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-slate-850'
                }`}>
                  {veh.registrationNumber}
                </td>
                <td className="whitespace-nowrap px-6 py-4">{veh.model}</td>
                <td className={`whitespace-nowrap px-6 py-4 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {veh.seatingCapacity} Seats
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium">{veh.driver}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      veh.status === 'Active' || veh.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : veh.verificationStatus === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        veh.status === 'Active' || veh.verificationStatus === 'VERIFIED' ? 'bg-emerald-400' :
                        veh.verificationStatus === 'REJECTED' ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                    />
                    {veh.verificationStatus || veh.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {veh.verificationStatus === 'PENDING' && (
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onVerifyVehicle && onVerifyVehicle(veh.id, 'VERIFIED')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onVerifyVehicle && onVerifyVehicle(veh.id, 'REJECTED')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-zinc-700 hover:bg-zinc-650 text-zinc-200 rounded-md transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No vehicles registered yet. Click "+ Add Vehicle" below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Button at Bottom-Left to match the Excalidraw design */}
      <div className="flex justify-start">
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          + Add Vehicle
        </button>
      </div>

      {/* Modal Add Vehicle Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-805">
              <h3 className="text-lg font-bold">Add New Vehicle</h3>
              <button
                onClick={handleCloseModal}
                className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Registration Number Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-505'}`}>
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. GJ01AB1234"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-805 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.registrationNumber && touched.registrationNumber ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.registrationNumber && touched.registrationNumber && (
                  <p className="mt-1 text-xs text-rose-500">{errors.registrationNumber}</p>
                )}
              </div>

              {/* Vehicle Model Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-505'}`}>
                  Vehicle Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Swift Dzire"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-805 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.model && touched.model ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.model && touched.model && (
                  <p className="mt-1 text-xs text-rose-500">{errors.model}</p>
                )}
              </div>

              {/* Seating Capacity Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'}`}>
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 4"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-805 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.seatingCapacity && touched.seatingCapacity ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.seatingCapacity && touched.seatingCapacity && (
                  <p className="mt-1 text-xs text-rose-500">{errors.seatingCapacity}</p>
                )}
              </div>

              {/* Driver & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-505'}`}>
                    Assign Driver
                  </label>
                  {employees.length > 0 ? (
                    <select
                      name="driver"
                      value={formData.driver}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                        theme === 'dark' ? 'text-zinc-100 bg-zinc-950 border-zinc-800' : 'text-slate-850 bg-slate-50 border-slate-200'
                      }`}
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
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-505'}`}>
                    Fleet Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                      theme === 'dark' ? 'text-zinc-100 bg-zinc-950 border-zinc-800' : 'text-slate-855 bg-slate-50 border-slate-200'
                    }`}
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
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark' ? 'text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-200' : 'text-slate-500 bg-transparent hover:bg-slate-100 hover:text-slate-850'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
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
