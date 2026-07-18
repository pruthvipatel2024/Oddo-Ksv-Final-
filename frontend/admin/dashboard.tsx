'use client';

import React, { useState } from 'react';
import { Employee, Vehicle, Settings, UserRental } from './types';
import { initialEmployees, initialVehicles, initialSettings, initialUserRentals } from './mock-data';
import EmployeesTab from './employees-tab';
import VehiclesTab from './vehicles-tab';
import UsersTab from './users-tab';
import SettingsTab from './settings-tab';
import AnalysisGraph from './analysis-graph';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [rentals, setRentals] = useState<UserRental[]>(initialUserRentals);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'vehicles' | 'users' | 'settings'>('dashboard');
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  
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

  const totalEmployeesCount = settings.registeredEmployees;
  const totalVehiclesCount = 22 + (vehicles.length - initialVehicles.length);
  const ridesThisMonthCount = 163;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-300">
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl pointer-events-auto transform translate-y-0 transition-transform duration-300 animate-in slide-in-from-top-5"
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
            <div className="ml-3 text-sm font-medium text-zinc-200">{toast.message}</div>
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
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/25">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-semibold text-zinc-100 tracking-wide">{settings.companyName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
                Admin Portal
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-zinc-900 shadow-md flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                OP
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Employees */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 shadow-xl hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Total Employees</p>
            <p className="text-4xl font-extrabold text-sky-400 group-hover:scale-105 origin-left transition-transform duration-300">{totalEmployeesCount}</p>
          </div>

          {/* Card 2: Vehicles */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 shadow-xl hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h4m-6 0a1 1 0 001-1m-4 1v-4h18v4" />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Registered Vehicles</p>
            <p className="text-4xl font-extrabold text-sky-400 group-hover:scale-105 origin-left transition-transform duration-300">{totalVehiclesCount}</p>
          </div>

          {/* Card 3: Rides */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 shadow-xl hover:border-zinc-800 hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-20 h-20 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Rides This Month</p>
            <p className="text-4xl font-extrabold text-sky-400 group-hover:scale-105 origin-left transition-transform duration-300">{ridesThisMonthCount}</p>
          </div>

        </div>

        {/* Tab Controls Row replaced with Three-Lines Toggle */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 relative">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Active View:</span>
            <span className="text-sm font-bold text-sky-400">
              {activeTab === 'dashboard' && '📈 Dashboard & Analytics'}
              {activeTab === 'employees' && '👥 Employees Directory'}
              {activeTab === 'vehicles' && '🚗 Vehicles Fleet'}
              {activeTab === 'users' && '📋 Rental Logs'}
              {activeTab === 'settings' && '⚙️ System Settings'}
            </span>
          </div>

          {/* Three-Lines Hamburger Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowNavDropdown(!showNavDropdown)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:text-sky-400 transition-all cursor-pointer text-zinc-400 active:scale-95 shadow-md"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu (Linear format) */}
            {showNavDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-3 duration-150">
                <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5 border-b border-zinc-800/60 mb-1 select-none">
                  Switch Menu
                </div>
                {[
                  { id: 'dashboard', label: 'Dashboard Graph', icon: '📈' },
                  { id: 'employees', label: 'Employees List', icon: '👥' },
                  { id: 'vehicles', label: 'Vehicles Fleet', icon: '🚗' },
                  { id: 'users', label: 'User Rentals', icon: '📋' },
                  { id: 'settings', label: 'System Settings', icon: '⚙️' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setShowNavDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-sky-600/10 text-sky-400'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span className="text-base select-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Render Area */}
        <div className="py-2">
          {activeTab === 'dashboard' && (
            <AnalysisGraph />
          )}
          {activeTab === 'employees' && (
            <EmployeesTab employees={employees} onAddEmployee={handleAddEmployee} />
          )}
          {activeTab === 'vehicles' && (
            <VehiclesTab vehicles={vehicles} employees={employees} onAddVehicle={handleAddVehicle} />
          )}
          {activeTab === 'users' && (
            <UsersTab rentals={rentals} employees={employees} vehicles={vehicles} onAddRental={handleAddRental} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab settings={settings} onSaveSettings={handleSaveSettings} />
          )}
        </div>

      </main>
    </div>
  );
}
