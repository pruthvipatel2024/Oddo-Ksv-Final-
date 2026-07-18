import { Employee, Vehicle, Settings, UserRental } from './types';

export const initialEmployees: Employee[] = [];
export const initialVehicles: Vehicle[] = [];

export const initialSettings: Settings = {
  companyName: 'Tech Corp',
  industry: 'Software & Technology',
  registeredAddress: '1st Floor, Tech Park, Whitefield, Bengaluru',
  adminContact: 'admin@carpool.platform',
  registeredEmployees: 0,
  fuelCost: 100,
  costPerKm: 12,
  travelCostOperational: 45000,
};

export const initialUserRentals: UserRental[] = [
  {
    id: 'rent-1',
    userName: 'Raj Patel',
    vehicleModel: 'Swift Dzire',
    vehicleReg: 'GJ01AB1234',
    dateUsed: '18-Jul-2026',
    timeRented: '09:00 AM - 05:00 PM',
    locationUsed: 'Gandhinagar Office',
  }
];
