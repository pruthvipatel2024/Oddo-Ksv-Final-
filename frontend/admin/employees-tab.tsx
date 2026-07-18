'use client';

import React, { useState } from 'react';
import { Employee } from './types';
import { validateEmail, validateRequired } from './validation';

interface EmployeesTabProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
}

export default function EmployeesTab({ employees, onAddEmployee }: EmployeesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    platformAccess: 'Granted' as 'Granted' | 'Revoked',
    rating: '',
    mobileNumber: '',
    memberSince: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      location: '',
      platformAccess: 'Granted',
      rating: '',
      mobileNumber: '',
      memberSince: new Date().toISOString().split('T')[0], // default member date to today
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
    
    if (name === 'email') {
      errorMsg = validateEmail(value);
    } else if (name === 'name') {
      errorMsg = validateRequired(value, 'Name') || (value.trim().length < 2 ? 'Name must be at least 2 characters' : null);
    } else if (name === 'location') {
      errorMsg = validateRequired(value, 'Location');
    } else if (name === 'rating') {
      const num = Number(value);
      if (value.trim() === '') {
        errorMsg = 'Rating is required';
      } else if (isNaN(num) || num < 1.0 || num > 5.0) {
        errorMsg = 'Rating must be a number between 1.0 and 5.0';
      }
    } else if (name === 'mobileNumber') {
      errorMsg = validateRequired(value, 'Mobile number');
    } else if (name === 'memberSince') {
      errorMsg = validateRequired(value, 'Member since date');
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(formData.name, 'Name') || (formData.name.trim().length < 2 ? 'Name must be at least 2 characters' : null);
    const emailErr = validateEmail(formData.email);
    const locErr = validateRequired(formData.location, 'Location');
    
    const numRating = Number(formData.rating);
    let ratingErr: string | null = null;
    if (formData.rating.trim() === '') {
      ratingErr = 'Rating is required';
    } else if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      ratingErr = 'Rating must be a number between 1.0 and 5.0';
    }

    const mobileErr = validateRequired(formData.mobileNumber, 'Mobile number');
    const dateErr = validateRequired(formData.memberSince, 'Member since date');

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (locErr) newErrors.location = locErr;
    if (ratingErr) newErrors.rating = ratingErr;
    if (mobileErr) newErrors.mobileNumber = mobileErr;
    if (dateErr) newErrors.memberSince = dateErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true,
        location: true,
        rating: true,
        mobileNumber: true,
        memberSince: true,
      });
      return;
    }

    // Format member date to format DD-MMM-YYYY (e.g. 18-Jul-2026) for storing
    let formattedDate = formData.memberSince;
    try {
      const parsedDate = new Date(formData.memberSince);
      if (!isNaN(parsedDate.getTime())) {
        const day = parsedDate.getDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[parsedDate.getMonth()];
        const year = parsedDate.getFullYear();
        formattedDate = `${day}-${month}-${year}`;
      }
    } catch (err) {
      // fallback
    }

    onAddEmployee({
      id: `emp-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      location: formData.location.trim(),
      platformAccess: formData.platformAccess,
      rating: parseFloat(formData.rating),
      mobileNumber: formData.mobileNumber.trim(),
      memberSince: formattedDate,
    });

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Employees Directory</h2>
          <p className="text-sm text-zinc-400">Manage employee contact details, location logs, and satisfaction ratings.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
        <table className="min-w-full divide-y divide-zinc-800 text-left">
          <thead className="bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Platform Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/10 text-sm text-zinc-300">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-zinc-800/40 transition-colors duration-150">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-100">{emp.name}</span>
                    <span className="text-xs text-zinc-500">{emp.mobileNumber}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">{emp.email}</td>
                <td className="whitespace-nowrap px-6 py-4">{emp.location}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-1.5 text-zinc-100 font-semibold">
                    <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{emp.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      emp.platformAccess === 'Granted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        emp.platformAccess === 'Granted' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    {emp.platformAccess}
                  </span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No employees registered yet. Click "Add Employee" to create one.
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
              <h3 className="text-lg font-semibold text-zinc-100">Add New Employee</h3>
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
              {/* Name Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Raj Patel"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.name && touched.name
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. rajpatel@co.com"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.email && touched.email
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. +91 98250 12345"
                  className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    errors.mobileNumber && touched.mobileNumber
                      ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
                {errors.mobileNumber && touched.mobileNumber && (
                  <p className="mt-1 text-xs text-rose-500">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Grid: Rating & Member Since */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 4.8"
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.rating && touched.rating
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                  {errors.rating && touched.rating && (
                    <p className="mt-1 text-xs text-rose-500">{errors.rating}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Member Since
                  </label>
                  <input
                    type="date"
                    name="memberSince"
                    value={formData.memberSince}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.memberSince && touched.memberSince
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                  {errors.memberSince && touched.memberSince && (
                    <p className="mt-1 text-xs text-rose-500">{errors.memberSince}</p>
                  )}
                </div>
              </div>

              {/* Grid: Location & Platform Access */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Home Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Ahmedabad"
                    className={`w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      errors.location && touched.location
                        ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                    }`}
                  />
                  {errors.location && touched.location && (
                    <p className="mt-1 text-xs text-rose-500">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Platform Access
                  </label>
                  <select
                    name="platformAccess"
                    value={formData.platformAccess}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  >
                    <option value="Granted">Granted</option>
                    <option value="Revoked">Revoked</option>
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
