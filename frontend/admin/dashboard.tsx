'use client';

import React, { useState, useEffect } from 'react';
import { Employee, Vehicle, Settings, UserRental } from './types';
import { initialEmployees, initialVehicles, initialSettings, initialUserRentals } from './mock-data';
import EmployeesTab from './employees-tab';
import VehiclesTab from './vehicles-tab';
import UsersTab from './users-tab';
import SettingsTab from './settings-tab';
import AnalysisGraph from './analysis-graph';
import { vehiclesApi } from '@/src/api/vehicles';

export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [rentals, setRentals] = useState<UserRental[]>(initialUserRentals);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'vehicles' | 'users' | 'settings'>('dashboard');
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const loadAdminData = async () => {
    try {
      const res = (await vehiclesApi.findAll()) as any;
      if (res.success && res.data) {
        const mapped = res.data.map((v: any) => ({
          id: v.id,
          registrationNumber: v.registrationNumber,
          model: v.model,
          seatingCapacity: v.seatingCapacity,
          driver: v.owner ? `${v.owner.firstName} ${v.owner.lastName}` : "Employee",
          status: v.verificationStatus === 'VERIFIED' ? 'Active' : v.verificationStatus,
          verificationStatus: v.verificationStatus
        }));
        setVehicles(mapped);
      }
    } catch (e) {
      console.error("Failed to load admin vehicles:", e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleVerifyVehicle = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await (vehiclesApi.verify(id, status) as any);
      showToast(`Vehicle status updated to ${status}.`, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err?.message || "Failed to update vehicle verification status.", 'info');
    }
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);
  
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
    setSettings((prev) => ({
      ...prev,
      registeredEmployees: prev.registeredEmployees + 1,
    }));
    showToast(`Employee "${newEmp.name}" added successfully.`);
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles((prev) => [...prev, newVeh]);
    showToast(`Vehicle "${newVeh.registrationNumber}" registered successfully.`);
  };


  const handleAddRental = (newRental: UserRental) => {
    setRentals((prev) => [...prev, newRental]);
    showToast(`Rental for "${newRental.userName}" recorded successfully.`);
  };

  const handleSaveSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
    showToast('Organization settings updated successfully.', 'success');
  };

  const handleToggleAccess = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const nextAccess = emp.platformAccess === 'Granted' ? 'Revoked' : 'Granted';
          showToast(`Access status for ${emp.name} is now ${nextAccess}.`, 'info');
          return { ...emp, platformAccess: nextAccess };
        }
        return emp;
      })
    );
  };

  const totalEmployeesCount = employees.length; // Dynamic count matching actual length
  const totalVehiclesCount = vehicles.length; // Dynamic count matching actual length
  const ridesThisMonthCount = 163 + rentals.length - initialUserRentals.length;

  return (
    <div className={`min-h-screen font-sans selection:bg-sky-500/30 selection:text-sky-300 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-xl shadow-2xl pointer-events-auto border transform translate-y-0 transition-transform duration-300 animate-in slide-in-from-top-5 ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <span className="inline-flex items-center justify-center p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span className="inline-flex items-center justify-center p-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
            </div>
            <div className="ml-3 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto pl-3 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
        theme === 'dark' ? 'border-zinc-900 bg-zinc-950/80' : 'border-slate-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/25">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className={`font-semibold tracking-wide transition-colors ${
                theme === 'dark' ? 'text-zinc-100' : 'text-slate-800'
              }`}>{settings.companyName}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Switcher Button */}
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300 hover:bg-zinc-800'
                    : 'bg-white border-slate-200 text-sky-600 hover:text-sky-700 hover:bg-slate-50'
                }`}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <span className={`text-xs font-medium uppercase tracking-wider border px-2.5 py-1 rounded-md transition-colors ${
                theme === 'dark' ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>
                Admin Portal
              </span>
              <div className="w-8 h-8 rounded-full bg-sky-600 border border-zinc-900 shadow-md flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                OP
              </div>
              <button
                onClick={onLogout}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-red-950/40 border-red-900/50 text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Employees */}
          <div className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 group ${
            theme === 'dark' 
              ? 'border-zinc-900 bg-zinc-900/20 shadow-xl hover:border-zinc-800 hover:shadow-2xl' 
              : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
            }`}>Total Employees</p>
            <p className={`text-4xl font-extrabold group-hover:scale-105 origin-left transition-transform duration-300 ${
              theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
            }`}>{totalEmployeesCount}</p>
          </div>

          {/* Card 2: Vehicles */}
          <div className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 group ${
            theme === 'dark' 
              ? 'border-zinc-900 bg-zinc-900/20 shadow-xl hover:border-zinc-800 hover:shadow-2xl' 
              : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h4m-6 0a1 1 0 001-1m-4 1v-4h18v4" />
              </svg>
            </div>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
            }`}>Registered Vehicles</p>
            <p className={`text-4xl font-extrabold group-hover:scale-105 origin-left transition-transform duration-300 ${
              theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
            }`}>{totalVehiclesCount}</p>
          </div>

          {/* Card 3: Rides */}
          <div className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 group ${
            theme === 'dark' 
              ? 'border-zinc-900 bg-zinc-900/20 shadow-xl hover:border-zinc-800 hover:shadow-2xl' 
              : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
            }`}>Rides This Month</p>
            <p className={`text-4xl font-extrabold group-hover:scale-105 origin-left transition-transform duration-300 ${
              theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
            }`}>{ridesThisMonthCount}</p>
          </div>

        </div>

        {/* Premium Horizontal Navigation Tab Bar (matching the Excalidraw sketches) */}
        <div className={`flex flex-wrap items-center justify-between border-b pb-3 gap-4 transition-colors ${
          theme === 'dark' ? 'border-zinc-900' : 'border-slate-200'
        }`}>
          <div className={`flex gap-1.5 p-1 backdrop-blur-md rounded-xl border shadow-inner transition-colors ${
            theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/60' : 'bg-slate-100 border-slate-200/60'
          }`}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📈' },
              { id: 'employees', label: 'Employees', icon: '👥' },
              { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
              { id: 'users', label: 'Rentals', icon: '📋' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/10 border border-sky-500/10'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <span className="text-sm select-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span>Active: </span>
            <span className={`font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-zinc-300' : 'text-slate-600'
            }`}>
              {activeTab}
            </span>
          </div>
        </div>

        {/* Tab Render Area */}
        <div className="py-2">
          {activeTab === 'dashboard' && (
            <AnalysisGraph />
          )}
          {activeTab === 'employees' && (
            <EmployeesTab 
              employees={employees} 
              vehicles={vehicles}
              rentals={rentals}
              onAddEmployee={handleAddEmployee} 
              onToggleAccess={handleToggleAccess}
              theme={theme} 
            />
          )}
          {activeTab === 'vehicles' && (
            <VehiclesTab vehicles={vehicles} employees={employees} onAddVehicle={handleAddVehicle} onVerifyVehicle={handleVerifyVehicle} theme={theme} />
          )}
          {activeTab === 'users' && (
            <UsersTab rentals={rentals} employees={employees} vehicles={vehicles} onAddRental={handleAddRental} theme={theme} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab settings={settings} onSaveSettings={handleSaveSettings} theme={theme} />
          )}
        </div>

      </main>
    </div>
  );
}
