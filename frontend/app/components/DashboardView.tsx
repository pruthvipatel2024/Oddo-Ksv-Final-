"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Search,
  MapPin,
  Clock,
  User,
  Car,
  Wallet,
  Settings,
  History,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  MoreVertical,
  Navigation,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Info,
  Phone,
  MessageSquare,
  X,
  CreditCard,
  QrCode,
  Check,
  TrendingUp,
  Fuel,
  Compass,
  BarChart3,
  Map,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";

interface DashboardViewProps {
  onLogout: () => void;
}

type TabType = "dashboard" | "trips" | "history" | "wallet" | "reports" | "settings";
type BookingStep = "find-ride" | "confirm-route" | "available-rides" | "track-ride" | "trip-finish" | "payment-method" | "publish-finish";
type TripsSubview = "list" | "detail";
type WalletSubview = "summary" | "recharge";

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  capacity: number;
}

interface SavedPlace {
  id: string;
  label: string; // e.g. "Home"
  address: string; // e.g. "Iskcon"
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [bookingStep, setBookingStep] = useState<BookingStep>("find-ride");
  const [tripsView, setTripsView] = useState<TripsSubview>("list");
  const [walletView, setWalletView] = useState<WalletSubview>("summary");

  // Toggle for booking view (Find Ride vs Offer Ride)
  const [bookingType, setBookingType] = useState<"find" | "offer">("find");

  // Toggle for trips tab (Passenger View vs Driver View)
  const [tripsRole, setTripsRole] = useState<"passenger" | "driver">("passenger");

  // Booking Inputs State
  const [startLocation, setStartLocation] = useState("Iskcon");
  const [destLocation, setDestLocation] = useState("Infocity");
  const [dateTime, setDateTime] = useState("18 Jul, 5:12 PM");
  const [seats, setSeats] = useState(1);
  const [isRecurring, setIsRecurring] = useState(true);
  const [farePerSeat, setFarePerSeat] = useState("120");

  // Vehicle Management State (starts empty to demonstrate warning check before offering a ride!)
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [newVehModel, setNewVehModel] = useState("");
  const [newVehPlate, setNewVehPlate] = useState("");
  const [newVehCapacity, setNewVehCapacity] = useState(4);
  const [vehicleError, setVehicleError] = useState("");

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleError("");
    if (!newVehModel.trim()) {
      setVehicleError("Please enter vehicle model.");
      return;
    }
    if (!newVehPlate.trim()) {
      setVehicleError("Please enter registration plate number.");
      return;
    }

    const newVeh: Vehicle = {
      id: Date.now().toString(),
      model: newVehModel.trim(),
      plate: newVehPlate.trim().toUpperCase(),
      capacity: newVehCapacity
    };

    setVehiclesList((prev) => [...prev, newVeh]);
    setNewVehModel("");
    setNewVehPlate("");
    setNewVehCapacity(4);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehiclesList((prev) => prev.filter((v) => v.id !== id));
  };

  // Saved Places State
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    { id: "1", label: "Home", address: "Iskcon" },
    { id: "2", label: "Office", address: "Infocity" },
    { id: "3", label: "Gym", address: "Prahladnagar" }
  ]);
  const [newPlaceLabel, setNewPlaceLabel] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");

  const handleAddSavedPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaceLabel.trim() && newPlaceAddress.trim()) {
      setSavedPlaces((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          label: newPlaceLabel.trim(),
          address: newPlaceAddress.trim()
        }
      ]);
      setNewPlaceLabel("");
      setNewPlaceAddress("");
    }
  };

  const handleRemoveSavedPlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // Available drivers list
  const drivers = [
    {
      id: "raj",
      name: "Raj Patel",
      time: "07:00 PM 18/July/26",
      route: "Iskcon to Infocity",
      price: 120,
      seats: "2 Seats Available",
      rating: 4.8,
      car: "Swift Dzire",
      plate: "GJ01AB1234"
    },
    {
      id: "krishna",
      name: "Krishna Singh",
      time: "08:00 PM 18/July/26",
      route: "Iskcon to Infocity",
      price: 120,
      seats: "2 Seats Available",
      rating: 4.9,
      car: "Hyundai i20",
      plate: "GJ01XY5678"
    }
  ];

  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);

  // Live tracking animation state
  const [carProgress, setCarProgress] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [rideCompleted, setRideCompleted] = useState(false);

  // Simulation effect for tracking the car
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (bookingStep === "track-ride" && !rideCompleted) {
      interval = setInterval(() => {
        setCarProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setRideCompleted(true);
            return 100;
          }
          const next = prev + 10;
          const remEta = Math.max(1, Math.ceil(5 - (next / 20)));
          setEtaMinutes(remEta);
          return next;
        });
      }, 800);
    } else {
      setCarProgress(0);
      setEtaMinutes(5);
      setRideCompleted(false);
    }
    return () => clearInterval(interval);
  }, [bookingStep, rideCompleted]);

  // Wallet and recharge state
  const [walletBalance, setWalletBalance] = useState(450);
  const [walletLogs, setWalletLogs] = useState([
    { id: 1, type: "Debit", desc: "Ride with Raj Patel", amount: 120, date: "18 Jul 2026" },
    { id: 2, type: "Credit", desc: "UPI Recharge", amount: 500, date: "17 Jul 2026" },
    { id: 3, type: "Debit", desc: "Ride with Krishna Singh", amount: 120, date: "15 Jul 2026" }
  ]);
  const [rechargeAmt, setRechargeAmt] = useState("500");
  const [rechargeMethod, setRechargeMethod] = useState<"card" | "upi">("upi");
  const [rechargeUpiId, setRechargeUpiId] = useState("username@paytm");

  // Payment Method Selection
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "upi" | "wallet">("wallet");
  const [payUpiId, setPayUpiId] = useState("deroaddict@okaxis");

  // Chat & Call popups simulation state
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { sender: "driver", text: "Hello! I am on my way to Iskcon pick up point.", time: "5:08 PM" },
    { sender: "user", text: "Great! I am waiting near the main cross road.", time: "5:09 PM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Trips lists
  const [passengerTrips, setPassengerTrips] = useState([
    {
      id: "active-ptrip",
      driverName: "Raj Patel",
      route: "Iskcon to Infocity",
      time: "07:00 PM 18/July/26",
      vehicle: "Swift Dzire",
      plate: "GJ01AB1234",
      start: "Iskcon",
      dest: "Infocity",
      fare: "₹120 / Seat 1",
      status: "Active Booked"
    }
  ]);

  const [driverTrips, setDriverTrips] = useState<any[]>([]);

  // Simulated active call duration
  useEffect(() => {
    let callTimer: NodeJS.Timeout;
    if (showCall) {
      callTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(callTimer);
  }, [showCall]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "user", text: newMessage.trim(), time: "5:12 PM" }
      ]);
      setNewMessage("");
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: "driver", text: "Sounds good, see you in a minute!", time: "5:12 PM" }
        ]);
      }, 1200);
    }
  };

  const handleRechargeWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(rechargeAmt);
    if (!isNaN(amt) && amt > 0) {
      setWalletBalance((prev) => prev + amt);
      setWalletLogs((prev) => [
        { id: Date.now(), type: "Credit", desc: "Wallet Top-up", amount: amt, date: "18 Jul 2026" },
        ...prev
      ]);
      setWalletView("summary");
      setRechargeAmt("500");
    }
  };

  const handleFinalPayment = () => {
    const fare = selectedDriver.price;
    if (payMethod === "wallet") {
      if (walletBalance < fare) {
        alert("Insufficient wallet balance. Please recharge or select another payment method.");
        return;
      }
      setWalletBalance((prev) => prev - fare);
    }

    // Add to logs
    setWalletLogs((prev) => [
      { id: Date.now(), type: "Debit", desc: `Ride with ${selectedDriver.name} (Paid via ${payMethod.toUpperCase()})`, amount: fare, date: "18 Jul 2026" },
      ...prev
    ]);

    // Go to history tab
    setActiveTab("history");
    setBookingStep("find-ride");
  };

  // Handler for publishing an offered ride
  const handlePublishRide = () => {
    // Stage new driver trip
    const newTrip = {
      id: Date.now().toString(),
      driverName: "You (Driver)",
      route: `${startLocation} to ${destLocation}`,
      time: dateTime,
      vehicle: vehiclesList[0]?.model || "Registered Vehicle",
      plate: vehiclesList[0]?.plate || "GJ01XX0000",
      start: startLocation,
      dest: destLocation,
      fare: `₹${farePerSeat} / Seat 1`,
      status: "Published",
      passengerName: "No passengers yet"
    };

    setDriverTrips((prev) => [newTrip, ...prev]);
    setBookingStep("publish-finish");
  };

  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(destLocation);
    setDestLocation(temp);
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Coordinates for mock tracking car
  const getCarCoordinates = (progress: number) => {
    const startX = 80;
    const startY = 240;
    const endX = 360;
    const endY = 60;

    const currentX = startX + (endX - startX) * (progress / 100);
    const waveOffset = Math.sin((progress / 100) * Math.PI * 2) * 20;
    const currentY = startY + (endY - startY) * (progress / 100) + waveOffset;

    return { x: currentX, y: currentY };
  };

  const currentCarPos = getCarCoordinates(carProgress);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#fcfcfc] text-zinc-800 antialiased">
      {/* Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-zinc-100 bg-white px-6 shadow-sm shadow-zinc-100/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <span className="text-sm font-bold">O</span>
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-zinc-900">
              Carpooling
            </span>
          </div>

          {/* Desktop Tab Links */}
          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => { setActiveTab("dashboard"); setBookingStep("find-ride"); }}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "dashboard" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab("trips"); setTripsView("list"); }}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "trips" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              My Trips
            </button>
            <button
              onClick={() => { setActiveTab("wallet"); setWalletView("summary"); }}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "wallet" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "reports" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "history" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              Ride History
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "settings" ? "bg-zinc-100 text-indigo-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
            >
              Setting
            </button>
          </nav>
        </div>

        {/* Profile and Logout Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700">Dero Addict</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Core Section */}
      <div className="flex flex-1">

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 md:p-12">

          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="w-full max-w-5xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">

              {/* STEP 1: FIND/OFFER RIDE FORM */}
              {bookingStep === "find-ride" && (
                <div>
                  <div className="mb-6 flex gap-4">
                    <button
                      onClick={() => setBookingType("find")}
                      className={`flex-1 rounded-xl py-3.5 text-sm font-bold transition-all ${bookingType === "find" ? "bg-zinc-900 text-white shadow-md shadow-zinc-800/10" : "border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                        }`}
                    >
                      Find Ride
                    </button>
                    <button
                      onClick={() => setBookingType("offer")}
                      className={`flex-1 rounded-xl py-3.5 text-sm font-bold transition-all ${bookingType === "offer" ? "bg-zinc-900 text-white shadow-md shadow-zinc-800/10" : "border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                        }`}
                    >
                      Offer Ride
                    </button>
                  </div>

                  {/* If Offer Ride is selected, perform the VEHICLE REGISTRATION lock check */}
                  {bookingType === "offer" && vehiclesList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-8 text-center max-w-xl mx-auto my-6">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-zinc-900 text-base">Vehicle Registration Required</h3>
                      <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
                        Before publishing or offering a ride to colleagues, you must register at least one vehicle in your profile dashboard.
                      </p>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-850 active:scale-95 transition-all"
                      >
                        Register a Vehicle
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Locations inputs */}
                      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Start Location</label>
                          <div className="relative flex items-center">
                            <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              value={startLocation}
                              onChange={(e) => setStartLocation(e.target.value)}
                              className="w-full rounded-xl border  py-3.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                              placeholder="Enter pick up location"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSwapLocations}
                          className="absolute right-4 top-[29px] hidden h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm active:scale-95 transition-all sm:flex z-10"
                          title="Swap Locations"
                        >
                          <RefreshCw className="h-4 w-4 text-zinc-500" />
                        </button>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Destination Location</label>
                          <div className="relative flex items-center">
                            <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              value={destLocation}
                              onChange={(e) => setDestLocation(e.target.value)}
                              className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50"
                              placeholder="Enter drop location"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date, Seats and Fare */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date & Time</label>
                          <div className="relative flex items-center">
                            <Clock className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              value={dateTime}
                              onChange={(e) => setDateTime(e.target.value)}
                              className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Seats</label>
                          <div className="relative flex items-center">
                            <User className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                            <select
                              value={seats}
                              onChange={(e) => setSeats(parseInt(e.target.value))}
                              className="w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 font-medium appearance-none"
                            >
                              <option value={1}>1 Seat</option>
                              <option value={2}>2 Seats</option>
                              <option value={3}>3 Seats</option>
                              <option value={4}>4 Seats</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            {bookingType === "find" ? "Max Fare Per Seat" : "Proposed Fare Per Seat"}
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-sm font-bold text-zinc-400">₹</span>
                            <input
                              type="number"
                              value={farePerSeat}
                              onChange={(e) => setFarePerSeat(e.target.value)}
                              className="w-full rounded-xl border  py-3.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 font-bold"
                              placeholder="120"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recurring Schedule */}
                      <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-zinc-800">Recurring Ride</span>
                            <span className="text-[10px] text-zinc-500 font-medium">Scheduled: Mo, Tu, We, Th, Fr</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsRecurring(!isRecurring)}
                          className={`relative h-6 w-11 rounded-full transition-all duration-300 ${isRecurring ? "bg-indigo-600" : "bg-zinc-300"
                            }`}
                        >
                          <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isRecurring ? "left-5" : "left-0.5"
                              }`}
                          />
                        </button>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (bookingType === "find") {
                            setBookingStep("confirm-route");
                          } else {
                            // Offer/Publish path goes directly to route confirmation with publishing outcome
                            setBookingStep("confirm-route");
                          }
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.99]"
                      >
                        <span>{bookingType === "find" ? "Find Ride" : "Publish Ride"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: CONFIRM ROUTE MAP VIEW */}
              {bookingStep === "confirm-route" && (
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex flex-col justify-between w-full lg:w-72">
                    <div className="space-y-5">
                      <button
                        onClick={() => setBookingStep("find-ride")}
                        className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Go Back</span>
                      </button>

                      <div className="space-y-3">
                        <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Location</span>
                          <span className="text-sm font-bold text-zinc-800 mt-1 block">{startLocation}</span>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination Location</span>
                          <span className="text-sm font-bold text-zinc-800 mt-1 block">{destLocation}</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                        <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-indigo-600" />
                          <span>Route Found</span>
                        </h4>
                        <p className="text-[10px] text-indigo-700 font-medium mt-1">
                          Connecting via SP Ring Rd. Estimated travel time is 33 minutes (26 km).
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (bookingType === "find") {
                          setBookingStep("available-rides");
                        } else {
                          handlePublishRide();
                        }
                      }}
                      className="mt-6 w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-95"
                    >
                      {bookingType === "find" ? "Confirm Route" : "Confirm and Publish"}
                    </button>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-xl border border-zinc-150 bg-sky-50 shadow-inner h-96">
                    <svg className="h-full w-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="20" y="20" width="80" height="70" rx="10" fill="#DEF7EC" />
                      <rect x="260" y="180" width="90" height="80" rx="10" fill="#DEF7EC" />
                      <path d="M 220 0 Q 230 75 220 150 Q 210 225 220 300" stroke="#A5F3FC" strokeWidth="32" strokeLinecap="round" fill="none" />
                      <line x1="160" y1="120" x2="280" y2="120" stroke="#9CA3AF" strokeWidth="12" />
                      <line x1="160" y1="120" x2="280" y2="120" stroke="#F3F4F6" strokeWidth="8" />
                      <path d="M 50 250 L 350 250 L 350 50 L 50 50 Z" stroke="#E5E7EB" strokeWidth="10" strokeLinejoin="round" />
                      <path d="M 80 240 Q 140 220 180 120 T 360 60" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: "12, 6" }} />
                      <circle cx="80" cy="240" r="14" fill="white" stroke="#4F46E5" strokeWidth="3" />
                      <circle cx="80" cy="240" r="6" fill="#4F46E5" />
                      <circle cx="360" cy="60" r="14" fill="white" stroke="#EC4899" strokeWidth="3" />
                      <circle cx="360" cy="60" r="6" fill="#EC4899" />
                    </svg>
                    <div className="absolute left-[70px] top-[180px] rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white">{startLocation}</div>
                    <div className="absolute right-[45px] top-[90px] rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white">{destLocation}</div>
                  </div>
                </div>
              )}

              {/* STEP 3: AVAILABLE RIDES LIST */}
              {bookingStep === "available-rides" && (
                <div>
                  <button
                    onClick={() => setBookingStep("confirm-route")}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Available Rides</span>
                  </button>

                  <div className="space-y-4">
                    {drivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="flex flex-col justify-between rounded-2xl border border-zinc-150 bg-white p-5 hover:border-indigo-200 hover:shadow-md transition-all sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
                            <User className="h-6 w-6 text-zinc-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-zinc-900">{driver.name}</h3>
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold text-indigo-600">
                                ★ {driver.rating}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5 block">
                              {driver.car} · {driver.plate}
                            </span>
                            <span className="text-xs text-zinc-400 mt-1 block">
                              {driver.time}
                            </span>
                          </div>
                        </div>

                        <div className="my-4 border-t border-zinc-100 pt-4 sm:my-0 sm:border-t-0 sm:pt-0 text-left sm:text-right">
                          <div className="text-lg font-black text-zinc-900">₹ {driver.price}</div>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-1">
                            {driver.seats}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDriver(driver);
                              setBookingStep("track-ride");
                            }}
                            className="flex-1 rounded-xl bg-zinc-900 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all text-center"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: TRACK RIDE / ACTIVE TRIP MAP TRACKING */}
              {bookingStep === "track-ride" && (
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="w-full lg:w-72 flex flex-col justify-between">
                    <div className="space-y-6">
                      <button
                        onClick={() => setBookingStep("available-rides")}
                        className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Track Ride</span>
                      </button>

                      <div className="space-y-3">
                        <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Location</span>
                          <span className="text-sm font-bold text-zinc-800 mt-1 block">{startLocation}</span>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination Location</span>
                          <span className="text-sm font-bold text-zinc-800 mt-1 block">{destLocation}</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-150 p-4 bg-white shadow-sm flex items-center gap-3.5">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-zinc-900">{selectedDriver.name}</h4>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Car className="h-3 w-3 text-zinc-400" />
                            <span>{selectedDriver.car} ({selectedDriver.plate})</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-indigo-600 p-4 text-white text-center shadow-lg shadow-indigo-100">
                      {rideCompleted ? (
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-indigo-200">Trip Status</span>
                          <span className="text-lg font-black block mt-0.5">Driver Has Arrived!</span>
                          <button
                            onClick={() => setBookingStep("trip-finish")}
                            className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm active:scale-95 transition-all"
                          >
                            Proceed to Summary
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-indigo-200">Estimated Arrival</span>
                          <span className="text-2xl font-black block mt-0.5">Coming in {etaMinutes} Minutes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-xl border border-zinc-150 bg-sky-50 shadow-inner h-96">
                    <svg className="h-full w-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="20" y="20" width="80" height="70" rx="10" fill="#DEF7EC" />
                      <rect x="260" y="180" width="90" height="80" rx="10" fill="#DEF7EC" />
                      <path d="M 220 0 Q 230 75 220 150 Q 210 225 220 300" stroke="#A5F3FC" strokeWidth="32" strokeLinecap="round" fill="none" />
                      <line x1="160" y1="120" x2="280" y2="120" stroke="#9CA3AF" strokeWidth="12" />
                      <line x1="160" y1="120" x2="280" y2="120" stroke="#F3F4F6" strokeWidth="8" />
                      <path d="M 50 250 L 350 250 L 350 50 L 50 50 Z" stroke="#E5E7EB" strokeWidth="10" strokeLinejoin="round" />
                      <path d="M 80 240 Q 140 220 180 120 T 360 60" stroke="#E0E7FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Interactive Moving Car */}
                      <g transform={`translate(${80 + 280 * (carProgress / 100) - 12}, ${240 - 180 * (carProgress / 100) + Math.sin((carProgress / 100) * Math.PI * 2) * 20 - 12})`}>
                        <rect x="0" y="0" width="24" height="24" rx="12" fill="white" stroke="#4F46E5" strokeWidth="2.5" />
                        <rect x="5" y="14" width="14" height="6" rx="2" fill="#4F46E5" />
                        <circle cx="8" cy="19" r="2" fill="#FBBF24" />
                        <circle cx="16" cy="19" r="2" fill="#FBBF24" />
                      </g>
                    </svg>
                  </div>
                </div>
              )}

              {/* STEP 5: TRIP FINISH SCREEN */}
              {bookingStep === "trip-finish" && (
                <div>
                  <button
                    onClick={() => setBookingStep("track-ride")}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Trip Finish</span>
                  </button>

                  <div className="mx-auto max-w-xl rounded-2xl border border-zinc-150 bg-white p-6 shadow-md">
                    <h2 className="text-xl font-black text-zinc-800 tracking-tight uppercase text-center mb-6">
                      {startLocation} to {destLocation}
                    </h2>
                    <div className="border-t border-zinc-100 pt-6 text-center">
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Fare</span>
                      <div className="text-5xl font-black text-zinc-900 mt-1">₹ {selectedDriver.price}</div>
                    </div>
                    <button
                      onClick={() => setBookingStep("payment-method")}
                      className="mt-8 w-full rounded-xl bg-zinc-900 py-4 text-sm font-semibold text-white hover:bg-zinc-800 transition-all text-center"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: PAYMENT METHOD SCREEN */}
              {bookingStep === "payment-method" && (
                <div>
                  <button
                    onClick={() => setBookingStep("trip-finish")}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Payment Method</span>
                  </button>

                  <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-150 bg-white p-6 shadow-md md:flex gap-8">
                    <div className="flex-1 space-y-4">
                      <h3 className="font-bold text-zinc-900 mb-4">Select Payment Option</h3>
                      <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${payMethod === "cash" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200 hover:bg-zinc-50"
                        }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={payMethod === "cash"} onChange={() => setPayMethod("cash")} className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-bold text-zinc-800">Cash Payment</span>
                        </div>
                      </label>
                      <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${payMethod === "card" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200 hover:bg-zinc-50"
                        }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={payMethod === "card"} onChange={() => setPayMethod("card")} className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-bold text-zinc-800">Card Payment</span>
                        </div>
                      </label>
                      <div className={`rounded-xl border p-4 transition-all ${payMethod === "upi" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200"
                        }`}>
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <input type="radio" checked={payMethod === "upi"} onChange={() => setPayMethod("upi")} className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-bold text-zinc-800">UPI Payment</span>
                          </div>
                        </label>
                        {payMethod === "upi" && (
                          <input
                            type="text"
                            value={payUpiId}
                            onChange={(e) => setPayUpiId(e.target.value)}
                            className="mt-3 w-full rounded-lg border  bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                          />
                        )}
                      </div>
                      <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${payMethod === "wallet" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200 hover:bg-zinc-50"
                        }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={payMethod === "wallet"} onChange={() => setPayMethod("wallet")} className="h-4 w-4 text-indigo-600" />
                          <div>
                            <span className="text-sm font-bold text-zinc-800 block">Wallet Payment</span>
                            <span className="text-[10px] text-zinc-400 font-bold">Balance: ₹ {walletBalance}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mx-auto max-w-2xl mt-6">
                    <button
                      onClick={handleFinalPayment}
                      className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-700 transition-all text-center"
                    >
                      Pay ₹ {selectedDriver.price}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: OFFER PUBLISHED FINISH VIEW */}
              {bookingStep === "publish-finish" && (
                <div className="text-center py-12 max-w-md mx-auto space-y-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900">Ride Published!</h2>
                    <p className="text-sm text-zinc-500 mt-2">
                      Your offer from **{startLocation}** to **{destLocation}** has been successfully published. Colleagues in your organization can now find and book seats in your vehicle.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBookingStep("find-ride");
                      setActiveTab("trips");
                      setTripsRole("driver");
                    }}
                    className="w-full rounded-xl bg-zinc-950 py-3.5 text-sm font-semibold text-white hover:bg-zinc-850"
                  >
                    View in My Trips
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB: MY TRIPS (WITH PASSENGER/DRIVER VIEW AND MOCK PASSENGERS) */}
          {activeTab === "trips" && (
            <div className="w-full max-w-4xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">

              {/* SUBVIEW: LIST */}
              {tripsView === "list" && (
                <div>
                  <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
                    <div>
                      <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">Active Rides</span>
                      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">My Trips</h2>
                    </div>

                    {/* Passenger View vs Driver View filter toggle */}
                    <div className="flex rounded-lg bg-zinc-100 p-1 border border-zinc-200">
                      <button
                        onClick={() => setTripsRole("passenger")}
                        className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${tripsRole === "passenger" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                      >
                        Passenger View
                      </button>
                      <button
                        onClick={() => setTripsRole("driver")}
                        className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${tripsRole === "driver" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                      >
                        Driver View
                      </button>
                    </div>
                  </div>

                  {/* Render passenger bookings list */}
                  {tripsRole === "passenger" ? (
                    <div className="space-y-4">
                      {passengerTrips.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center bg-zinc-50/50">
                          <p className="text-sm text-zinc-500 font-semibold">No passenger trips scheduled.</p>
                        </div>
                      ) : (
                        passengerTrips.map((trip) => (
                          <div
                            key={trip.id}
                            onClick={() => setTripsView("detail")}
                            className="group flex flex-col justify-between rounded-2xl border border-zinc-150 bg-[#fafafa]/50 p-5 hover:border-indigo-200 hover:bg-white transition-all sm:flex-row sm:items-center cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                                <Car className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-zinc-800">{trip.route}</h3>
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                                    {trip.status}
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-500 block mt-1">
                                  Driver: {trip.driverName} · Time: {trip.time}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors">Trip Details</span>
                              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600 transition-transform" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Render driver published offers list */
                    <div className="space-y-4">
                      {driverTrips.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center bg-zinc-50/50">
                          <p className="text-sm text-zinc-500 font-semibold">You have not published any rides as a driver.</p>
                          <p className="text-xs text-zinc-400 mt-1">Select the **Offer Ride** tab inside Dashboard to publish a ride.</p>
                        </div>
                      ) : (
                        driverTrips.map((trip) => (
                          <div
                            key={trip.id}
                            className="flex flex-col justify-between rounded-2xl border border-zinc-150 bg-[#fafafa]/50 p-5 hover:border-indigo-200 hover:bg-white transition-all sm:flex-row sm:items-center shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                                <Navigation className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-zinc-800">{trip.route}</h3>
                                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600 border border-indigo-100">
                                    {trip.status}
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-500 block mt-1">
                                  Vehicle: {trip.vehicle} · Plate: {trip.plate} · Time: {trip.time}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold block mt-1">
                                  Passengers: {trip.passengerName}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex gap-2">
                              <button
                                onClick={() => {
                                  // simulate starting the trip as driver
                                  alert("Trip started! Passengers have been notified. Navigating to active tracking map.");
                                  setSelectedDriver({
                                    id: "driver-self",
                                    name: "You (Driver)",
                                    time: trip.time,
                                    route: trip.route,
                                    price: parseInt(farePerSeat),
                                    seats: "4 Seats",
                                    rating: 5.0,
                                    car: trip.vehicle,
                                    plate: trip.plate
                                  });
                                  setBookingStep("track-ride");
                                  setActiveTab("dashboard");
                                }}
                                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                              >
                                Start Trip
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW: DETAIL */}
              {tripsView === "detail" && (
                <div>
                  <button
                    onClick={() => setTripsView("list")}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Trip Detail</span>
                  </button>

                  <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-150 bg-white p-6 shadow-md">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
                          <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">Raj Patel</h3>
                          <span className="text-xs text-zinc-400">iskcon to Infocity</span>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 font-semibold">07:00 PM 18/July/26</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                      <div className="rounded-xl border border-zinc-150 p-4 text-center bg-zinc-50/50">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vehicle</span>
                        <span className="text-sm font-bold text-zinc-800 mt-1  flex items-center justify-center gap-1.5">
                          <Car className="h-4 w-4 text-indigo-500" />
                          <span>Swift Dzire</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">GJ01AB1234</span>
                      </div>
                      <div className="rounded-xl border border-zinc-150 p-4 text-center bg-zinc-50/50">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pick UP Point</span>
                        <span className="text-sm font-bold text-zinc-800 mt-1  flex items-center justify-center gap-1.5">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          <span>Iskcon</span>
                        </span>
                      </div>
                      <div className="rounded-xl border border-zinc-150 p-4 text-center bg-zinc-50/50">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Drop Point</span>
                        <span className="text-sm font-bold text-zinc-800 mt-1  flex items-center justify-center gap-1.5">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          <span>Infocity</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 border-b border-zinc-100 pb-6 mb-6">
                      <button
                        onClick={() => setShowChat(true)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95"
                      >
                        <MessageSquare className="h-4 w-4 text-zinc-500" />
                        <span>Chat with Driver</span>
                      </button>
                      <button
                        onClick={() => setShowCall(true)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95"
                      >
                        <Phone className="h-4 w-4 text-zinc-500" />
                        <span>Call To Driver</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fare Rate</span>
                      <span className="text-xl font-black text-zinc-950">₹ 120 / Seat 1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WALLET */}
          {activeTab === "wallet" && (
            <div className="w-full max-w-4xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">
              {walletView === "summary" && (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">Manage Funds</span>
                      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Wallet Details</h2>
                    </div>
                    <button
                      onClick={() => setWalletView("recharge")}
                      className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all shadow-sm"
                    >
                      Recharge Wallet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-lg shadow-indigo-100">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Available Balance</span>
                      <div className="text-4xl font-black mt-2">₹ {walletBalance}.00</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 p-6 bg-zinc-50/50 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-900">Corporate Account</h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          This wallet is tied to your organization. Used exclusively for organizational commuting matching.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold text-zinc-900 mb-4">Transaction Ledger</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            <th className="pb-3">Transaction</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {walletLogs.map((log) => (
                            <tr key={log.id} className="text-zinc-700">
                              <td className="py-3">
                                <span className="font-semibold block text-sm">{log.desc}</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase">{log.type}</span>
                              </td>
                              <td className="py-3 text-zinc-500">{log.date}</td>
                              <td className={`py-3 text-right font-black ${log.type === "Credit" ? "text-emerald-600" : "text-red-500"
                                }`}>
                                {log.type === "Credit" ? "+" : "-"} ₹{log.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBVIEW: RECHARGE FORM */}
              {walletView === "recharge" && (
                <div>
                  <button
                    onClick={() => setWalletView("summary")}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span>Recharge Wallet</span>
                  </button>

                  <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-150 bg-white p-6 shadow-md md:flex gap-8">
                    <form onSubmit={handleRechargeWallet} className="flex-1 space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-zinc-900">Add Money</h3>
                        <span className="text-xs font-bold text-zinc-400">Balance: ₹ {walletBalance}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</label>
                        <input
                          type="text"
                          value={rechargeAmt}
                          onChange={(e) => setRechargeAmt(e.target.value)}
                          className="w-full rounded-xl border  bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 font-bold"
                          placeholder="₹ 500"
                        />
                      </div>

                      <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${rechargeMethod === "card" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200"
                        }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={rechargeMethod === "card"} onChange={() => setRechargeMethod("card")} className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-bold text-zinc-800">Card Payment</span>
                        </div>
                      </label>

                      <div className={`rounded-xl border p-4 transition-all ${rechargeMethod === "upi" ? "border-indigo-600 bg-indigo-50/20" : "border-zinc-200"
                        }`}>
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <input type="radio" checked={rechargeMethod === "upi"} onChange={() => setRechargeMethod("upi")} className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-bold text-zinc-800">UPI Payment</span>
                          </div>
                        </label>
                        {rechargeMethod === "upi" && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={rechargeUpiId}
                              onChange={(e) => setRechargeUpiId(e.target.value)}
                              className="flex-1 rounded-lg border  bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                              placeholder="username@abcd"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all text-center"
                      >
                        Add ₹ {rechargeAmt || "0"}
                      </button>
                    </form>

                    <div className="hidden w-48 flex-col items-center justify-center border-l border-zinc-100 pl-8 md:flex">
                      <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 shadow-inner">
                        <QrCode className="h-full w-full text-zinc-800" />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-3">Recharge Scan code</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REPORTS & ANALYTICS (NEW) */}
          {activeTab === "reports" && (
            <div className="w-full max-w-5xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">
              <div className="mb-6">
                <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">COMMUTING ANALYTICS</span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Reports Dashboard</h2>
                <p className="text-sm text-zinc-500 mt-1">Insights into travel activity, fuel savings, and transportation expenses.</p>
              </div>

              {/* Commuting Statistics Row */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm text-center">
                  <Compass className="mx-auto h-5 w-5 text-indigo-500 mb-2" />
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Distance</span>
                  <span className="text-lg font-black text-zinc-800 block mt-0.5">312 km</span>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm text-center">
                  <Fuel className="mx-auto h-5 w-5 text-indigo-500 mb-2" />
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fuel Consumed</span>
                  <span className="text-lg font-black text-zinc-800 block mt-0.5">21.5 L</span>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm text-center">
                  <TrendingUp className="mx-auto h-5 w-5 text-indigo-500 mb-2" />
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fuel Efficiency</span>
                  <span className="text-lg font-black text-zinc-800 block mt-0.5">14.5 km/L</span>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 shadow-sm text-center">
                  <Wallet className="mx-auto h-5 w-5 text-indigo-500 mb-2" />
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cost / Km</span>
                  <span className="text-lg font-black text-zinc-800 block mt-0.5">₹ 4.6</span>
                </div>
              </div>

              {/* Graphic Trends Section (Pure SVG responsive charts!) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">

                {/* SVG Line Chart for Fuel Efficiency */}
                <div className="rounded-xl border border-zinc-150 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Fuel Efficiency Trend (km/L)</span>
                  </h3>
                  <div className="h-48 w-full">
                    <svg className="h-full w-full" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid lines */}
                      <line x1="20" y1="120" x2="290" y2="120" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="20" y1="80" x2="290" y2="80" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="20" y1="40" x2="290" y2="40" stroke="#F3F4F6" strokeWidth="1" />

                      {/* Axis */}
                      <line x1="20" y1="130" x2="290" y2="130" stroke="#E5E7EB" strokeWidth="1.5" />
                      <line x1="20" y1="20" x2="20" y2="130" stroke="#E5E7EB" strokeWidth="1.5" />

                      {/* Line Plot */}
                      {/* Values: Wk1: 12 (Y=110), Wk2: 13 (Y=100), Wk3: 14.5 (Y=85), Wk4: 14.2 (Y=88), Wk5: 15.5 (Y=75) */}
                      <path
                        d="M 50 110 L 100 100 L 150 85 L 200 88 L 250 75"
                        stroke="#4F46E5"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Plot dots */}
                      <circle cx="50" cy="110" r="4" fill="white" stroke="#4F46E5" strokeWidth="2" />
                      <circle cx="100" cy="100" r="4" fill="white" stroke="#4F46E5" strokeWidth="2" />
                      <circle cx="150" cy="85" r="4" fill="white" stroke="#4F46E5" strokeWidth="2" />
                      <circle cx="200" cy="88" r="4" fill="white" stroke="#4F46E5" strokeWidth="2" />
                      <circle cx="250" cy="75" r="4" fill="white" stroke="#4F46E5" strokeWidth="2" />

                      {/* Labels */}
                      <text x="50" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Wk 1</text>
                      <text x="100" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Wk 2</text>
                      <text x="150" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Wk 3</text>
                      <text x="200" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Wk 4</text>
                      <text x="250" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Wk 5</text>
                    </svg>
                  </div>
                </div>

                {/* SVG Bar Chart for Trip Cost Analysis */}
                <div className="rounded-xl border border-zinc-150 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    <span>Trip Cost/Km Analysis</span>
                  </h3>
                  <div className="h-48 w-full">
                    <svg className="h-full w-full" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid lines */}
                      <line x1="20" y1="120" x2="290" y2="120" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="20" y1="80" x2="290" y2="80" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="20" y1="40" x2="290" y2="40" stroke="#F3F4F6" strokeWidth="1" />

                      <line x1="20" y1="130" x2="290" y2="130" stroke="#E5E7EB" strokeWidth="1.5" />
                      <line x1="20" y1="20" x2="20" y2="130" stroke="#E5E7EB" strokeWidth="1.5" />

                      {/* Bar Plot */}
                      {/* Bar 1 (Your Car): Height=70 (Y=60), Bar 2 (Avg Carpool): Height=50 (Y=80), Bar 3 (Cab/Taxi): Height=110 (Y=20) */}
                      <rect x="50" y="60" width="28" height="70" rx="3" fill="#818CF8" />
                      <rect x="130" y="80" width="28" height="50" rx="3" fill="#4F46E5" />
                      <rect x="210" y="20" width="28" height="110" rx="3" fill="#E5E7EB" />

                      {/* Labels */}
                      <text x="64" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Your Car</text>
                      <text x="144" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Carpool</text>
                      <text x="224" y="145" fill="#9CA3AF" fontSize="8" textAnchor="middle" fontWeight="bold">Taxi Cab</text>
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: RIDE HISTORY */}
          {activeTab === "history" && (
            <div className="w-full max-w-4xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">
              <div className="mb-6">
                <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">Trip History</span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Rides History</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3">Driver</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Vehicle Plate</th>
                      <th className="pb-3 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    <tr className="text-zinc-700">
                      <td className="py-4 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                          <User className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-sm">Raj Patel</span>
                      </td>
                      <td className="py-4 font-bold text-zinc-800">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          <span>ISKCON to Infocity</span>
                        </span>
                      </td>
                      <td className="py-4 font-bold text-zinc-500">GJ01AB1234</td>
                      <td className="py-4 text-right text-zinc-500">07:00 PM 18/July/26</td>
                    </tr>
                    <tr className="text-zinc-700">
                      <td className="py-4 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                          <User className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-sm">Krishna Singh</span>
                      </td>
                      <td className="py-4 font-bold text-zinc-800">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          <span>ISKCON to Adalaj</span>
                        </span>
                      </td>
                      <td className="py-4 font-bold text-zinc-500">GJ01AB5034</td>
                      <td className="py-4 text-right text-zinc-500">09:00 PM 19/July/26</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS (WITH SAVED PLACES & VEHICLE MANAGEMENT) */}
          {activeTab === "settings" && (
            <div className="w-full max-w-5xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40">
              <div className="mb-8">
                <span className="text-xs tracking-wider uppercase font-bold text-indigo-500/80">Preferences</span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h2>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                {/* Left Column: Vehicle Management */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <Car className="h-5 w-5 text-indigo-600" />
                      <span>My Vehicle Management</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Register and manage vehicles to enable publishing commuting offers.</p>
                  </div>

                  {/* Registered Vehicle List */}
                  <div className="space-y-3">
                    {vehiclesList.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center bg-zinc-50/50">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">No Registered Vehicles</span>
                        <span className="text-[10px] text-zinc-500 block mt-1">Please register at least one vehicle to publish offered rides.</span>
                      </div>
                    ) : (
                      vehiclesList.map((veh) => (
                        <div key={veh.id} className="flex items-center justify-between rounded-xl border border-zinc-150 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                              <Car className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="font-bold text-sm text-zinc-800 block">{veh.model}</span>
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{veh.plate} · {veh.capacity} Seats Available</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVehicle(veh.id)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Vehicle Form */}
                  <form onSubmit={handleRegisterVehicle} className="rounded-2xl border border-zinc-100 bg-zinc-50/30 p-5 space-y-4 shadow-inner">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Register New Vehicle</span>

                    {vehicleError && (
                      <div className="text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                        {vehicleError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Model</label>
                        <input
                          type="text"
                          placeholder="Tesla Model 3 / Swift"
                          value={newVehModel}
                          onChange={(e) => setNewVehModel(e.target.value)}
                          className="w-full rounded-xl border  bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Number Plate</label>
                        <input
                          type="text"
                          placeholder="GJ01AB1234"
                          value={newVehPlate}
                          onChange={(e) => setNewVehPlate(e.target.value)}
                          className="w-full rounded-xl border  bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Seating Capacity</label>
                      <select
                        value={newVehCapacity}
                        onChange={(e) => setNewVehCapacity(parseInt(e.target.value))}
                        className="w-full rounded-xl border  bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 appearance-none"
                      >
                        <option value={2}>2 Passengers</option>
                        <option value={3}>3 Passengers</option>
                        <option value={4}>4 Passengers</option>
                        <option value={5}>5 Passengers</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Register Vehicle</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Saved Places & Custom settings */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                      <span>Saved Commute Places</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Frequently used locations for rapid search/publish pre-filling.</p>
                  </div>

                  {/* List of Saved Places */}
                  <div className="space-y-2">
                    {savedPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="group flex items-center justify-between rounded-xl border border-zinc-150 bg-white p-3 hover:border-indigo-200 transition-all shadow-sm"
                      >
                        <div
                          onClick={() => {
                            // prefill locations in dashboard
                            setStartLocation(place.address);
                            setActiveTab("dashboard");
                            setBookingStep("find-ride");
                            alert(`Applied "${place.address}" as start location!`);
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-bold text-xs text-zinc-800 block">{place.label}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{place.address} (Click to Set Start)</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSavedPlace(place.id)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Saved Place Form */}
                  <form onSubmit={handleAddSavedPlace} className="rounded-2xl border border-zinc-100 bg-zinc-50/30 p-5 space-y-4 shadow-inner">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Save New Place</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Label</label>
                        <input
                          type="text"
                          placeholder="Home, Office..."
                          value={newPlaceLabel}
                          onChange={(e) => setNewPlaceLabel(e.target.value)}
                          className="w-full rounded-xl border  bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Address / Node</label>
                        <input
                          type="text"
                          placeholder="Iskcon, Infocity..."
                          value={newPlaceAddress}
                          onChange={(e) => setNewPlaceAddress(e.target.value)}
                          className="w-full rounded-xl border  bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Save Place</span>
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* CHAT MODAL OVERLAY */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex h-[450px] w-full max-w-md flex-col rounded-2xl bg-white border border-zinc-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-150 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{selectedDriver.name}</h4>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Driver</span>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/50">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-white border border-zinc-150 text-zinc-800"
                    }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 mr-1 ml-1">{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-zinc-150 p-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CALL MODAL OVERLAY */}
      {showCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md">
          <div className="flex h-80 w-full max-w-sm flex-col items-center justify-between rounded-2xl bg-zinc-900 p-8 border border-zinc-800 text-center shadow-2xl text-white">
            <div className="space-y-4">
              <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 animate-pulse">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedDriver.name}</h3>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1 block">Active Call</span>
              </div>
            </div>
            <div className="text-2xl font-mono tracking-wider font-extrabold text-zinc-300">
              {formatCallTime(callDuration)}
            </div>
            <button
              onClick={() => setShowCall(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-red-700 transition-all w-full shadow-lg shadow-red-900/40"
            >
              <Phone className="h-4 w-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
