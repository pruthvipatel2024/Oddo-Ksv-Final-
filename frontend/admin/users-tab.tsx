'use client';

import React, { useState } from 'react';
import { UserRental, Employee, Vehicle } from './types';
import { validateRequired } from './validation';

interface UsersTabProps {
  rentals: UserRental[];
  employees: Employee[];
  vehicles: Vehicle[];
  onAddRental: (rental: UserRental) => void;
}

export default function UsersTab({ rentals, employees, vehicles, onAddRental }: UsersTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    vehicleIndex: '0', // index in vehicles array to map both model and reg
    dateUsed: '',
    timeRented: '',
    locationUsed: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleOpenModal = () => {
    setFormData({
      userName: employees[0]?.name || '',
      vehicleIndex: '0',
      dateUsed: new Date().toISOString().split('T')[0], // default to today
      timeRented: '09:00 AM - 05:00 PM',
      locationUsed: '',
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
    if (name === 'userName') {
      errorMsg = validateRequired(value, 'User name');
    } else if (name === 'dateUsed') {
      errorMsg = validateRequired(value, 'Date used');
    } else if (name === 'timeRented') {
      errorMsg = validateRequired(value, 'Time rented');
    } else if (name === 'locationUsed') {
      errorMsg = validateRequired(value, 'Location used');
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const userErr = validateRequired(formData.userName, 'User name');
    const dateErr = validateRequired(formData.dateUsed, 'Date used');
    const timeErr = validateRequired(formData.timeRented, 'Time rented');
    const locErr = validateRequired(formData.locationUsed, 'Location used');

    if (userErr) newErrors.userName = userErr;
    if (dateErr) newErrors.dateUsed = dateErr;
    if (timeErr) newErrors.timeRented = timeErr;
    if (locErr) newErrors.locationUsed = locErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        userName: true,
        dateUsed: true,
        timeRented: true,
        locationUsed: true,
      });
      return;
    }

    const selectedVehicle = vehicles[parseInt(formData.vehicleIndex, 10)] || {
      model: 'Unknown Model',
      registrationNumber: 'N/A',
    };

    onAddRental({
      id: `rent-${Date.now()}`,
      userName: formData.userName,
      vehicleModel: selectedVehicle.model,
      vehicleReg: selectedVehicle.registrationNumber,
      dateUsed: formData.dateUsed,
      timeRented: formData.timeRented.trim(),
      locationUsed: formData.locationUsed.trim(),
    });

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Vehicle Rental Logs</h2>
          <p className="text-sm text-zinc-400">Track and log user rentals, usage duration, and active locations.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Rental
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
        <table className="min-w-full divide-y divide-zinc-800 text-left">
          <thead className="bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Vehicle Rented</th>
              <th className="px-6 py-4">Date Used</th>
              <th className="px-6 py-4">Time Rented</th>
              <th className="px-6 py-4">Location Used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/10 text-sm text-zinc-300">
            {rentals.map((rent) => (
              <tr key={rent.id} className="hover:bg-zinc-800/40 transition-colors duration-150">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-100">{rent.userName}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-200">{rent.vehicleModel}</span>
                    <span className="text-xs text-zinc-500 font-mono tracking-wider">{rent.vehicleReg}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                  {new Date(rent.dateUsed).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-300">{rent.timeRented}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {rent.locationUsed}
                  </span>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No rental logs recorded yet. Click "Add Rental" to create one.
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
              <h3 className="text-lg font-semibold text-zinc-100">Add Rental Record</h3>
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
              {/* User Name Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  User Name
                </label>
                {employees.length > 0 ? (
                  <select
                    name="userName"
                    value={formData.userName}
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
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter User Name"
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.userName && touched.userName
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                )}
                {errors.userName && touched.userName && (
                  <p className="mt-1 text-xs text-rose-500">{errors.userName}</p>
                )}
              </div>

              {/* Vehicle Rented Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Vehicle Rented
                </label>
                {vehicles.length > 0 ? (
                  <select
                    name="vehicleIndex"
                    value={formData.vehicleIndex}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  >
                    {vehicles.map((veh, idx) => (
                      <option key={veh.id} value={idx}>
                        {veh.model} ({veh.registrationNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-zinc-500 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                    No vehicles available. Register a vehicle first.
                  </div>
                )}
              </div>

              {/* Grid: Date Used & Time Rented */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Date Used
                  </label>
                  <input
                    type="date"
                    name="dateUsed"
                    value={formData.dateUsed}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.dateUsed && touched.dateUsed
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                  {errors.dateUsed && touched.dateUsed && (
                    <p className="mt-1 text-xs text-rose-500">{errors.dateUsed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Time Rented
                  </label>
                  <input
                    type="text"
                    name="timeRented"
                    value={formData.timeRented}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 09:00 AM - 05:00 PM"
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.timeRented && touched.timeRented
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                  {errors.timeRented && touched.timeRented && (
                    <p className="mt-1 text-xs text-rose-500">{errors.timeRented}</p>
                  )}
                </div>
              </div>

              {/* Location Used */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Location Used
                </label>
                <input
                  type="text"
                  name="locationUsed"
                  value={formData.locationUsed}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Ahmedabad"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.locationUsed && touched.locationUsed
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.locationUsed && touched.locationUsed && (
                  <p className="mt-1 text-xs text-rose-500">{errors.locationUsed}</p>
                )}
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
                  Add Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
