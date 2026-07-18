import { Employee, Vehicle, Settings, UserRental } from './types';

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Raj Patel',
    email: 'rajpatel@co.com',
    location: 'Ahmedabad',
    platformAccess: 'Granted',
    rating: 4.8,
    mobileNumber: '+91 98250 12345',
    memberSince: '15-Jan-2023',
  },
  {
    id: 'emp-2',
    name: 'Krishna Singh',
    email: 'krishna.s@co.com',
    location: 'Ahmedabad',
    platformAccess: 'Granted',
    rating: 4.5,
    mobileNumber: '+91 98790 54321',
    memberSince: '04-Nov-2023',
  },
  {
    id: 'emp-3',
    name: 'Priya Nair',
    email: 'priya.nair@co.com',
    location: 'Gandhinagar',
    platformAccess: 'Revoked',
    rating: 3.9,
    mobileNumber: '+91 94260 98765',
    memberSince: '20-May-2024',
  },
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    registrationNumber: 'GJ01AB1234',
    model: 'Swift Dzire',
    seatingCapacity: 4,
    driver: 'Raj Patel',
    status: 'Active',
  },
  {
    id: 'veh-2',
    registrationNumber: 'GJ01AB5034',
    model: 'Alto 800',
    seatingCapacity: 3,
    driver: 'Krishna Singh',
    status: 'Active',
  },
  {
    id: 'veh-3',
    registrationNumber: 'GJ01CD7788',
    model: 'Innova Crysta',
    seatingCapacity: 6,
    driver: 'Priya Nair',
    status: 'Inactive',
  },
];

export const initialSettings: Settings = {
  companyName: 'Odoo Pvt. Ltd.',
  industry: 'Software',
  registeredAddress: 'Gandhinagar',
  adminContact: 'admin@odoo.com',
  registeredEmployees: 48,
  fuelCost: 96.50,
  costPerKm: 8.00,
  travelCostOperational: 2.50,
};

export const initialUserRentals: UserRental[] = [
  {
    id: 'rent-1',
    userName: 'Raj Patel',
    vehicleModel: 'Swift Dzire',
    vehicleReg: 'GJ01AB1234',
    dateUsed: '2026-07-18',
    timeRented: '09:00 AM - 05:00 PM',
    locationUsed: 'Ahmedabad',
  },
  {
    id: 'rent-2',
    userName: 'Krishna Singh',
    vehicleModel: 'Alto 800',
    vehicleReg: 'GJ01AB5034',
    dateUsed: '2026-07-17',
    timeRented: '10:30 AM - 02:30 PM',
    locationUsed: 'Ahmedabad',
  },
  {
    id: 'rent-3',
    userName: 'Priya Nair',
    vehicleModel: 'Innova Crysta',
    vehicleReg: 'GJ01CD7788',
    dateUsed: '2026-07-15',
    timeRented: '08:00 AM - 08:00 PM',
    locationUsed: 'Gandhinagar',
  },
];
