'use client';

import React, { useState, useEffect } from 'react';
import { Settings } from './types';
import { validateEmail, validateRequired, validatePositiveInteger, validatePositiveNumber } from './validation';

interface SettingsTabProps {
  settings: Settings;
  onSaveSettings: (updatedSettings: Settings) => void;
}

export default function SettingsTab({ settings, onSaveSettings }: SettingsTabProps) {
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (['registeredEmployees', 'fuelCost', 'costPerKm', 'travelCostOperational'].includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMsg: string | null = null;
    
    if (name === 'companyName') {
      errorMsg = validateRequired(value, 'Company name');
    } else if (name === 'industry') {
      errorMsg = validateRequired(value, 'Industry');
    } else if (name === 'registeredAddress') {
      errorMsg = validateRequired(value, 'Registered address');
    } else if (name === 'adminContact') {
      errorMsg = validateEmail(value);
    } else if (name === 'registeredEmployees') {
      errorMsg = validateRequired(value, 'Registered employees') || validatePositiveInteger(value, 'Registered employees');
    } else if (name === 'fuelCost') {
      errorMsg = validateRequired(value, 'Fuel cost') || validatePositiveNumber(value, 'Fuel cost');
    } else if (name === 'costPerKm') {
      errorMsg = validateRequired(value, 'Cost per km') || validatePositiveNumber(value, 'Cost per km');
    } else if (name === 'travelCostOperational') {
      errorMsg = validateRequired(value, 'Travel cost') || validatePositiveNumber(value, 'Travel cost');
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const compErr = validateRequired(formData.companyName, 'Company name');
    const indErr = validateRequired(formData.industry, 'Industry');
    const addrErr = validateRequired(formData.registeredAddress, 'Registered address');
    const contactErr = validateEmail(formData.adminContact);
    const empErr = validateRequired(String(formData.registeredEmployees), 'Registered employees') || validatePositiveInteger(formData.registeredEmployees, 'Registered employees');
    const fuelErr = validateRequired(String(formData.fuelCost), 'Fuel cost') || validatePositiveNumber(formData.fuelCost, 'Fuel cost');
    const kmErr = validateRequired(String(formData.costPerKm), 'Cost per km') || validatePositiveNumber(formData.costPerKm, 'Cost per km');
    const travelErr = validateRequired(String(formData.travelCostOperational), 'Travel cost') || validatePositiveNumber(formData.travelCostOperational, 'Travel cost');

    if (compErr) newErrors.companyName = compErr;
    if (indErr) newErrors.industry = indErr;
    if (addrErr) newErrors.registeredAddress = addrErr;
    if (contactErr) newErrors.adminContact = contactErr;
    if (empErr) newErrors.registeredEmployees = empErr;
    if (fuelErr) newErrors.fuelCost = fuelErr;
    if (kmErr) newErrors.costPerKm = kmErr;
    if (travelErr) newErrors.travelCostOperational = travelErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        companyName: true,
        industry: true,
        registeredAddress: true,
        adminContact: true,
        registeredEmployees: true,
        fuelCost: true,
        costPerKm: true,
        travelCostOperational: true,
      });
      return;
    }

    setSaveStatus('saving');
    
    setTimeout(() => {
      onSaveSettings(formData);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl py-4">
      {/* Company Details section */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-sky-400 border-b border-zinc-800 pb-2">
          Company Details
        </h3>

        <div className="space-y-6">
          {/* Row 1: Company Name & Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Company Name */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Company Name
              </label>
              <div className="flex-1 flex flex-col">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-transparent border-0 border-b pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                    errors.companyName && touched.companyName
                      ? 'border-rose-500/50'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                />
                {errors.companyName && touched.companyName && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.companyName}</p>
                )}
              </div>
            </div>

            {/* Industry */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Industry
              </label>
              <div className="flex-1 flex flex-col">
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-transparent border-0 border-b pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                    errors.industry && touched.industry
                      ? 'border-rose-500/50'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                />
                {errors.industry && touched.industry && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.industry}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Registered Address & Admin Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-2">
            {/* Registered Address */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Registered Address
              </label>
              <div className="flex-1 flex flex-col">
                <input
                  type="text"
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-transparent border-0 border-b pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                    errors.registeredAddress && touched.registeredAddress
                      ? 'border-rose-500/50'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                />
                {errors.registeredAddress && touched.registeredAddress && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.registeredAddress}</p>
                )}
              </div>
            </div>

            {/* Admin Contact */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Admin Contact
              </label>
              <div className="flex-1 flex flex-col">
                <input
                  type="email"
                  name="adminContact"
                  value={formData.adminContact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-transparent border-0 border-b pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                    errors.adminContact && touched.adminContact
                      ? 'border-rose-500/50'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                />
                {errors.adminContact && touched.adminContact && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.adminContact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Registered Employees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-2">
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Registered Employees
              </label>
              <div className="flex-1 flex flex-col">
                <input
                  type="number"
                  name="registeredEmployees"
                  value={formData.registeredEmployees}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-transparent border-0 border-b pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                    errors.registeredEmployees && touched.registeredEmployees
                      ? 'border-rose-500/50'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                />
                {errors.registeredEmployees && touched.registeredEmployees && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.registeredEmployees}</p>
                )}
              </div>
            </div>
            {/* Blank column on the right side */}
            <div className="hidden md:block"></div>
          </div>
        </div>
      </div>

      {/* Carpooling Configuration section */}
      <div className="space-y-6 pt-6">
        <h3 className="text-base font-semibold text-sky-400 border-b border-zinc-800 pb-2">
          Carpooling Configuration
        </h3>

        <div className="space-y-6">
          {/* Row 1: Fuel Cost & Cost Per KM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Fuel Cost / Liter */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Fuel Cost / Liter
              </label>
              <div className="flex-1 flex flex-col">
                <div className="relative flex items-center">
                  <span className="text-zinc-500 text-sm absolute left-0 bottom-1.5 select-none">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    name="fuelCost"
                    value={formData.fuelCost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full bg-transparent border-0 border-b pl-7 pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                      errors.fuelCost && touched.fuelCost
                        ? 'border-rose-500/50'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  />
                </div>
                {errors.fuelCost && touched.fuelCost && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.fuelCost}</p>
                )}
              </div>
            </div>

            {/* Cost Per KM */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Cost Per KM
              </label>
              <div className="flex-1 flex flex-col">
                <div className="relative flex items-center">
                  <span className="text-zinc-500 text-sm absolute left-0 bottom-1.5 select-none">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    name="costPerKm"
                    value={formData.costPerKm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full bg-transparent border-0 border-b pl-7 pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                      errors.costPerKm && touched.costPerKm
                        ? 'border-rose-500/50'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  />
                </div>
                {errors.costPerKm && touched.costPerKm && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.costPerKm}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Travel Cost (Operational) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-2">
            {/* Travel Cost (Operational) */}
            <div className="flex flex-row items-end gap-3">
              <label className="text-sm font-medium text-zinc-400 min-w-[140px] select-none mb-1">
                Travel Cost (Operational)
              </label>
              <div className="flex-1 flex flex-col">
                <div className="relative flex items-center">
                  <span className="text-zinc-500 text-sm absolute left-0 bottom-1.5 select-none">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    name="travelCostOperational"
                    value={formData.travelCostOperational}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full bg-transparent border-0 border-b pl-7 pr-12 pb-1 text-sm text-zinc-100 focus:outline-none focus:ring-0 focus:border-sky-500 transition-colors ${
                      errors.travelCostOperational && touched.travelCostOperational
                        ? 'border-rose-500/50'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  />
                  <span className="text-zinc-500 text-xs absolute right-0 bottom-1.5 select-none">/ Km</span>
                </div>
                {errors.travelCostOperational && touched.travelCostOperational && (
                  <p className="text-[11px] text-rose-500 mt-1 absolute translate-y-6">{errors.travelCostOperational}</p>
                )}
              </div>
            </div>
            {/* Blank column on the right side */}
            <div className="hidden md:block"></div>
          </div>
        </div>
      </div>

      {/* Submit / Status Bar */}
      <div className="flex items-center gap-4 pt-8 mt-4">
        <button
          type="submit"
          disabled={saveStatus !== 'idle'}
          className={`inline-flex items-center justify-center px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-all duration-200 active:scale-95 cursor-pointer ${
            saveStatus === 'saving'
              ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed'
              : saveStatus === 'saved'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-transparent text-sky-400 border-sky-500/40 hover:border-sky-500 hover:bg-sky-500/5'
          }`}
        >
          {saveStatus === 'saving' && (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </>
          )}
          {saveStatus === 'idle' && 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
