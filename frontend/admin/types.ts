export interface Employee {
  id: string;
  name: string;
  email: string;
  location: string;
  platformAccess: 'Granted' | 'Revoked';
  rating: number;
  mobileNumber: string;
  memberSince: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  seatingCapacity: number;
  driver: string; // Linked to Employee name
  status: 'Active' | 'Inactive';
}

export interface Settings {
  companyName: string;
  industry: string;
  registeredAddress: string;
  adminContact: string;
  registeredEmployees: number;
  fuelCost: number;
  costPerKm: number;
  travelCostOperational: number;
}

export interface UserRental {
  id: string;
  userName: string;
  vehicleModel: string;
  vehicleReg: string;
  dateUsed: string;
  timeRented: string;
  locationUsed: string;
}
