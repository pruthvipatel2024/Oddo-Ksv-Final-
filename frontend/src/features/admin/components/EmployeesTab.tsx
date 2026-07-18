'use client';

import React, { useState } from 'react';
import { Employee, Vehicle, UserRental } from '../types';
import { validateEmail, validateRequired } from '../validation';

interface EmployeesTabProps {
  employees: Employee[];
  vehicles: Vehicle[];
  rentals: UserRental[];
  onAddEmployee: (employee: Employee) => void;
  onToggleAccess: (employeeId: string) => void;
  theme: 'light' | 'dark';
}

export default function EmployeesTab({
  employees,
  vehicles,
  rentals,
  onAddEmployee,
  onToggleAccess,
  theme,
}: EmployeesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    manager: '',
    location: '',
    platformAccess: 'Granted' as 'Granted' | 'Revoked',
    mobileNumber: '',
    memberSince: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      manager: '',
      location: '',
      platformAccess: 'Granted',
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
    } else if (name === 'department') {
      errorMsg = validateRequired(value, 'Department');
    } else if (name === 'manager') {
      errorMsg = validateRequired(value, 'Manager name');
    } else if (name === 'location') {
      errorMsg = validateRequired(value, 'Location');
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
    const deptErr = validateRequired(formData.department, 'Department');
    const mgrErr = validateRequired(formData.manager, 'Manager');
    const locErr = validateRequired(formData.location, 'Location');
    const mobileErr = validateRequired(formData.mobileNumber, 'Mobile number');
    const dateErr = validateRequired(formData.memberSince, 'Member since date');

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (deptErr) newErrors.department = deptErr;
    if (mgrErr) newErrors.manager = mgrErr;
    if (locErr) newErrors.location = locErr;
    if (mobileErr) newErrors.mobileNumber = mobileErr;
    if (dateErr) newErrors.memberSince = dateErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true,
        department: true,
        manager: true,
        location: true,
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
      department: formData.department.trim(),
      manager: formData.manager.trim(),
      location: formData.location.trim(),
      platformAccess: formData.platformAccess,
      mobileNumber: formData.mobileNumber.trim(),
      memberSince: formattedDate,
    });

    handleCloseModal();
  };

  // Find vehicles registered for selected employee
  const getAssignedVehicles = (employeeName: string) => {
    return vehicles.filter(v => v.driver.toLowerCase() === employeeName.toLowerCase());
  };

  // Find rentals registered for selected employee
  const getUserRentals = (employeeName: string) => {
    return rentals.filter(r => r.userName.toLowerCase() === employeeName.toLowerCase());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold transition-colors ${theme === 'dark' ? 'text-zinc-100' : 'text-slate-800'}`}>
            Employees Directory
          </h2>
          <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
            Click on any employee name to view details, active fleet assignments, and rental history logs.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className={`overflow-x-auto rounded-xl border shadow-2xl transition-colors ${
        theme === 'dark' ? 'border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md' : 'border-slate-200 bg-white'
      }`}>
        <table className="min-w-full divide-y divide-zinc-800/60 text-left">
          <thead className={`text-xs font-bold uppercase tracking-wider transition-colors ${
            theme === 'dark' ? 'bg-zinc-900/60 text-zinc-400 border-zinc-805' : 'bg-slate-100/80 text-slate-505 border-slate-200'
          }`}>
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Platform Access</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-sm transition-colors ${
            theme === 'dark' ? 'divide-zinc-800/40 text-zinc-300 bg-zinc-900/10' : 'divide-slate-200/60 text-slate-700 bg-white'
          }`}>
            {employees.map((emp) => (
              <tr key={emp.id} className={`transition-colors duration-150 ${
                theme === 'dark' ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50/70'
              }`}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className={`text-left font-bold transition-all hover:underline cursor-pointer group flex items-center gap-2 ${
                        theme === 'dark' ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        theme === 'dark' ? 'bg-zinc-800 text-zinc-200 group-hover:bg-sky-500/10' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getInitials(emp.name)}
                      </div>
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                        <span className={`text-[10px] font-normal transition-colors ${
                          theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                        }`}>{emp.mobileNumber}</span>
                      </div>
                    </button>
                  </div>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {emp.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    theme === 'dark' ? 'bg-zinc-800/80 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {emp.department}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium">{emp.manager}</td>
                <td className="whitespace-nowrap px-6 py-4">{emp.location}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
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
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No employees registered yet. Click "+ Add Employee" below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee trigger button at bottom-left as per Excalidraw design */}
      <div className="flex justify-start">
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          + Add Employee
        </button>
      </div>

      {/* Clickable Card Type Info Dialog (Overlay Modal) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg border rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] transition-all transform scale-100 animate-in zoom-in-95 duration-200 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-sky-500/5' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                {/* Beautiful color gradient avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-base font-extrabold text-white shadow-lg">
                  {getInitials(selectedEmployee.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{selectedEmployee.name}</h3>
                  <span
                    className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedEmployee.platformAccess === 'Granted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {selectedEmployee.platformAccess}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Grid Cards */}
            <div className="mt-6 space-y-6">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Employee Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Email Address
                    </span>
                    <span className="text-xs font-semibold break-all">{selectedEmployee.email}</span>
                  </div>

                  {/* Phone */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Mobile Number
                    </span>
                    <span className="text-xs font-semibold">{selectedEmployee.mobileNumber}</span>
                  </div>

                  {/* Department */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Department
                    </span>
                    <span className="text-xs font-bold text-sky-400">{selectedEmployee.department}</span>
                  </div>

                  {/* Manager */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Manager
                    </span>
                    <span className="text-xs font-semibold">{selectedEmployee.manager}</span>
                  </div>

                  {/* Location */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Home Location
                    </span>
                    <span className="text-xs font-semibold">{selectedEmployee.location}</span>
                  </div>

                  {/* Member Since */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Member Since
                    </span>
                    <span className="text-xs font-semibold">{selectedEmployee.memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Fleet Registration / Driver Info card */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Fleet Assignment
                </h4>
                {getAssignedVehicles(selectedEmployee.name).length > 0 ? (
                  <div className="space-y-2">
                    {getAssignedVehicles(selectedEmployee.name).map((veh) => (
                      <div
                        key={veh.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">🚗</span>
                          <div>
                            <p className="text-xs font-bold text-zinc-100">{veh.model}</p>
                            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              {veh.registrationNumber.slice(0, 4)} {veh.registrationNumber.slice(4, 6)} {veh.registrationNumber.slice(6)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md border ${
                          veh.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {veh.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 text-center text-xs rounded-xl border ${
                    theme === 'dark' ? 'bg-zinc-950/20 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    No vehicles registered for this driver.
                  </div>
                )}
              </div>

              {/* Recent Activity timeline */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Recent Carpooling Activity
                </h4>
                {getUserRentals(selectedEmployee.name).length > 0 ? (
                  <div className="space-y-3 relative border-l border-zinc-850 ml-3 pl-4 pt-1">
                    {getUserRentals(selectedEmployee.name).map((rent) => (
                      <div key={rent.id} className="relative group">
                        {/* Bullet point node */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-zinc-950 transition-transform group-hover:scale-125" />
                        <div>
                          <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {new Date(rent.dateUsed).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <h5 className="text-xs font-semibold text-zinc-200">{rent.vehicleModel} ({rent.vehicleReg})</h5>
                          <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                            ⏱️ {rent.timeRented} | 📍 {rent.locationUsed}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 text-center text-xs rounded-xl border ${
                    theme === 'dark' ? 'bg-zinc-950/20 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    No recent carpooling logs found.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  onToggleAccess(selectedEmployee.id);
                  // Update current dialog access display
                  setSelectedEmployee((prev) => {
                    if (prev) {
                      return {
                        ...prev,
                        platformAccess: prev.platformAccess === 'Granted' ? 'Revoked' : 'Granted',
                      };
                    }
                    return null;
                  });
                }}
                className={`inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  selectedEmployee.platformAccess === 'Granted'
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {selectedEmployee.platformAccess === 'Granted' ? 'Revoke Access' : 'Grant Access'}
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Close Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold">Add New Employee</h3>
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
              {/* Name Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Raj Patel"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-800 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.name && touched.name ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. rajpatel@co.com"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-800 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.email && touched.email ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. +91 98250 12345"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                    theme === 'dark'
                      ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                      : 'text-slate-850 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                  } ${errors.mobileNumber && touched.mobileNumber ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                />
                {errors.mobileNumber && touched.mobileNumber && (
                  <p className="mt-1 text-xs text-rose-500">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Grid: Department & Manager */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Engineering"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      theme === 'dark'
                        ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                        : 'text-slate-800 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                    } ${errors.department && touched.department ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  />
                  {errors.department && touched.department && (
                    <p className="mt-1 text-xs text-rose-500">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. A. Shah"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      theme === 'dark'
                        ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                        : 'text-slate-800 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                    } ${errors.manager && touched.manager ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  />
                  {errors.manager && touched.manager && (
                    <p className="mt-1 text-xs text-rose-500">{errors.manager}</p>
                  )}
                </div>
              </div>

              {/* Grid: Location & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Ahmedabad"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      theme === 'dark'
                        ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                        : 'text-slate-805 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                    } ${errors.location && touched.location ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  />
                  {errors.location && touched.location && (
                    <p className="mt-1 text-xs text-rose-500">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Member Since
                  </label>
                  <input
                    type="date"
                    name="memberSince"
                    value={formData.memberSince}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                      theme === 'dark'
                        ? 'text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-sky-500 focus:border-sky-500'
                        : 'text-slate-800 bg-slate-50 border-slate-200 focus:ring-sky-500 focus:border-sky-500'
                    } ${errors.memberSince && touched.memberSince ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  />
                  {errors.memberSince && touched.memberSince && (
                    <p className="mt-1 text-xs text-rose-500">{errors.memberSince}</p>
                  )}
                </div>
              </div>

              {/* Platform Access Select */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Platform Access
                </label>
                <select
                  name="platformAccess"
                  value={formData.platformAccess}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                    theme === 'dark' ? 'text-zinc-100 bg-zinc-950 border-zinc-805' : 'text-slate-850 bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Granted">Granted</option>
                  <option value="Revoked">Revoked</option>
                </select>
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
