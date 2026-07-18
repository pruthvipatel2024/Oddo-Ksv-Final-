export const orgStats = {
  totalEmployees: 48,
  registeredVehicles: 22,
  ridesThisMonth: 163,
};

export const employees = [
  { name: "Raj Patel", email: "raj.patel@corp.com", department: "Engineering", manager: "A. Shah", location: "Ahmedabad", access: "active" },
  { name: "Krishna Singh", email: "krishna.s@corp.com", department: "Sales", manager: "R. Mehta", location: "Ahmedabad", access: "active" },
  { name: "Priya Nair", email: "priya.nair@corp.com", department: "HR", manager: "A. Shah", location: "Gandhinagar", access: "revoked" },
];

export const vehicles = [
  { regNo: "GJ01AB1234", model: "Swift Dzire", seats: 4, driver: "Raj Patel", status: "active" },
  { regNo: "GJ01AB5034", model: "Alto 800", seats: 4, driver: "Krishna Singh", status: "active" },
  { regNo: "GJ01CD1122", model: "Innova Crysta", seats: 6, driver: "Priya Nair", status: "inactive" },
];

export const availableRides = [
  { driver: "Raj Patel", route: "Iskcon → Infocity", time: "07:00 PM, 18 Jul", fare: 120, seats: 2 },
  { driver: "Krishna Singh", route: "Iskcon → Infocity", time: "08:00 PM, 18 Jul", fare: 120, seats: 2 },
];

export const rideHistory = [
  { name: "Raj Patel", route: "Iskcon → Infocity", vehicle: "GJ01AB1234", time: "07:00 PM, 18/Jul/26", fare: 120, status: "completed" },
  { name: "Krishna Singh", route: "Iskcon → Adalaj", vehicle: "GJ01AB5034", time: "09:00 PM, 19/Jul/26", fare: 150, status: "completed" },
  { name: "Priya Nair", route: "Vastrapur → Infocity", vehicle: "GJ01CD1122", time: "08:15 AM, 15/Jul/26", fare: 90, status: "completed" },
  { name: "Raj Patel", route: "Bopal → SG Highway", vehicle: "GJ01AB1234", time: "06:40 PM, 12/Jul/26", fare: 110, status: "completed" },
  { name: "Krishna Singh", route: "Iskcon → Infocity", vehicle: "GJ01AB5034", time: "07:05 PM, 10/Jul/26", fare: 120, status: "cancelled" },
  { name: "Priya Nair", route: "Gandhinagar → Infocity", vehicle: "GJ01CD1122", time: "09:20 AM, 8/Jul/26", fare: 140, status: "completed" },
  { name: "Raj Patel", route: "Iskcon → Adalaj", vehicle: "GJ01AB1234", time: "06:00 PM, 5/Jul/26", fare: 100, status: "completed" },
  { name: "Krishna Singh", route: "Vastrapur → Bopal", vehicle: "GJ01AB5034", time: "08:30 AM, 2/Jul/26", fare: 95, status: "completed" },
];

// A rider owns exactly one vehicle in this flow.
export const myVehicle = { model: "Swift Dzire", regNo: "GJ01AB1234", role: "Driver" };

// Catalog used when a rider adds a vehicle — pick a model instead of typing free text.
export const vehicleCatalog = [
  { model: "Swift Dzire", seats: 4, type: "Sedan" },
  { model: "Alto 800", seats: 4, type: "Hatchback" },
  { model: "Innova Crysta", seats: 6, type: "SUV" },
  { model: "Baleno", seats: 4, type: "Hatchback" },
  { model: "City", seats: 4, type: "Sedan" },
  { model: "Ertiga", seats: 6, type: "MUV" },
  { model: "Nexon EV", seats: 4, type: "Electric SUV" },
];
