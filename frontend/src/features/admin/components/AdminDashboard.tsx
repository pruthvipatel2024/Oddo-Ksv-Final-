'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/src/context/SessionContext';
import { useOrgAdminDashboard, useSuperAdminDashboard } from '@/src/hooks/useProfile';
import { useVehicles } from '@/src/hooks/useVehicles';
import EmployeesTab from './EmployeesTab';
import VehiclesTab from './VehiclesTab';
import UsersTab from './UsersTab';
import SettingsTab from './SettingsTab';
import AnalysisGraph from './AnalysisGraph';

export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'vehicles' | 'users' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load backend aggregates based on admin roles dynamically
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const orgAdminQuery = useOrgAdminDashboard();
  const superAdminQuery = useSuperAdminDashboard();
  const { verifyVehicle } = useVehicles();

  const dashboardData = isSuperAdmin ? superAdminQuery.data : orgAdminQuery.data;
  const isLoading = isSuperAdmin ? superAdminQuery.isLoading : orgAdminQuery.isLoading;

  const handleVerifyVehicle = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await verifyVehicle({ id, status });
      showToast(`Vehicle status updated to ${status}.`, 'success');
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

  // Safe fallback counts
  const totalEmployeesCount = dashboardData?.employeeCount || dashboardData?.employeesCount || 0;
  const totalVehiclesCount = dashboardData?.pendingVehicles?.length || 0;
  const ridesThisMonthCount = dashboardData?.stats?.totalRidesOffered || dashboardData?.tripsCount || 0;

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
              }`}>Platform Admin</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300 hover:bg-zinc-800'
                    : 'bg-white border-slate-200 text-sky-600 hover:text-sky-700 hover:bg-slate-50'
                }`}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <span className={`text-xs font-medium uppercase tracking-wider border px-2.5 py-1 rounded-md transition-colors ${
                theme === 'dark' ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>
                Admin Portal
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg border border-red-200/50 bg-red-50/50 text-red-650 hover:bg-red-50 text-xs font-bold transition-all"
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
          <div className="relative overflow-hidden rounded-xl border p-6 bg-white dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wider mb-2 text-zinc-400">Total Employees</p>
            <p className="text-4xl font-extrabold text-sky-400">{isLoading ? '...' : totalEmployeesCount}</p>
          </div>

          <div className="relative overflow-hidden rounded-xl border p-6 bg-white dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wider mb-2 text-zinc-400">Pending Vehicle Requests</p>
            <p className="text-4xl font-extrabold text-sky-400">{isLoading ? '...' : totalVehiclesCount}</p>
          </div>

          <div className="relative overflow-hidden rounded-xl border p-6 bg-white dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wider mb-2 text-zinc-400">Total Rides Commutes</p>
            <p className="text-4xl font-extrabold text-sky-400">{isLoading ? '...' : ridesThisMonthCount}</p>
          </div>
        </div>

        {/* Prem tab bar */}
        <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-4 border-zinc-200 dark:border-zinc-900">
          <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl dark:bg-zinc-900">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📈' },
              { id: 'employees', label: 'Employees', icon: '👥' },
              { id: 'vehicles', label: 'Vehicles Verification', icon: '🚗' },
              { id: 'users', label: 'Ride History', icon: '📋' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    isActive ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Render Area */}
        <div className="py-2 text-left">
          {activeTab === 'dashboard' && (
            <AnalysisGraph />
          )}
          {activeTab === 'employees' && (
            <EmployeesTab 
              employees={[]} 
              vehicles={[]}
              rentals={[]}
              onAddEmployee={() => {}} 
              onToggleAccess={() => {}}
              theme={theme} 
            />
          )}
          {activeTab === 'vehicles' && (
            <VehiclesTab 
              vehicles={(dashboardData?.pendingVehicles || []).map((v: any) => ({
                id: v.id,
                registrationNumber: v.registrationNumber,
                model: v.model,
                seatingCapacity: v.seatingCapacity,
                driver: v.owner ? `${v.owner.firstName} ${v.owner.lastName}` : 'Driver',
                status: v.verificationStatus
              }))} 
              employees={[]} 
              onAddVehicle={async () => {}} 
              onVerifyVehicle={handleVerifyVehicle} 
              theme={theme} 
            />
          )}
          {activeTab === 'users' && (
            <UsersTab 
              rentals={(dashboardData?.rideHistory || []).map((r: any) => ({
                id: r.id,
                userName: `${r.driver?.firstName} ${r.driver?.lastName}`,
                vehicleModel: r.vehicle?.model,
                vehicleReg: r.vehicle?.registrationNumber,
                dateUsed: new Date(r.date).toLocaleDateString(),
                timeRented: r.time,
                locationUsed: `${r.pickupAddress} to ${r.destinationAddress}`
              }))} 
              employees={[]} 
              vehicles={[]} 
              onAddRental={async () => {}} 
              theme={theme} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
