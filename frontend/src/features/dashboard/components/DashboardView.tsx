"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useSession } from "@/src/context/SessionContext";
import { tokenStorage } from "@/src/lib/auth/token-storage";
import { 
  useProfile, 
  useEmployeeDashboard 
} from "@/src/hooks/useProfile";
import { useWallet } from "@/src/hooks/useWallet";
import { useVehicles } from "@/src/hooks/useVehicles";
import { useBookings } from "@/src/hooks/useBookings";
import { useRides } from "@/src/hooks/useRides";
import { useTrips, useTripDetails } from "@/src/hooks/useTrips";
import { useWithdrawals } from "@/src/hooks/useWithdrawals";
import { useRatings } from "@/src/hooks/useRatings";
import { useChat } from "@/src/hooks/useChat";
import { useTracking } from "@/src/hooks/useTracking";
import { nominatimService } from "@/src/services/maps/nominatim.service";

import UpcomingTripsCard from "./UpcomingTripsCard";
import WalletCard from "./WalletCard";
import RideHistoryCard from "./RideHistoryCard";
import NotificationsCard from "./NotificationsCard";
import VehiclesCard from "./VehiclesCard";
import SettingsCard from "./SettingsCard";
import MapCard from "./MapCard";

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
  Navigation,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Info,
  Phone,
  MessageSquare,
  X,
  CreditCard,
  Check,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";

interface DashboardViewProps {
  onLogout: () => void;
}

type TabType = "dashboard" | "trips" | "history" | "wallet" | "settings";
type BookingStep = "find-ride" | "confirm-route" | "available-rides" | "track-ride";

export const DashboardView: React.FC<DashboardViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [bookingStep, setBookingStep] = useState<BookingStep>("find-ride");
  const [bookingType, setBookingType] = useState<"find" | "offer">("find");
  const [tripsRole, setTripsRole] = useState<"passenger" | "driver">("passenger");

  // Inputs
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [farePerSeat, setFarePerSeat] = useState("120");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Search Results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [activeRouteGeometry, setActiveRouteGeometry] = useState<[number, number][]>([]);

  // Active Trip ID for Sockets / Tracking
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [isDriverForActiveTrip, setIsDriverForActiveTrip] = useState(false);

  // API State Hooks
  const { profile: user, updateProfile, isUpdating } = useProfile();
  const { wallet, recharge, isRecharging } = useWallet();
  const { vehicles, createVehicle, deleteVehicle, isCreating } = useVehicles();
  const { trips, isLoading: isLoadingTrips, updateTripStatus } = useTrips();
  const { createBooking } = useBookings();
  const { confirmRoute, createRide, searchRides } = useRides();
  const { submitRating } = useRatings();

  // Socket Tracking Hook
  const { driverCoords } = useTracking(activeTripId, isDriverForActiveTrip);
  
  // Socket Chat Hook
  const { messages, sendMessage } = useChat(activeTripId || '');
  const [chatMessageText, setChatMessageText] = useState("");

  // Static Local Notification mock array replacement
  const [localNotifications, setLocalNotifications] = useState<any[]>([
    {
      id: "welcome",
      title: "Welcome Back!",
      body: "Check and book shared commutes with your organization colleagues dynamically.",
      priority: "INFO",
      read: false,
      createdAt: new Date().toISOString(),
    }
  ]);

  // Address lookup suggestions search
  useEffect(() => {
    if (startQuery.trim().length > 3) {
      const delay = setTimeout(async () => {
        const results = await nominatimService.searchAddress(startQuery);
        setStartSuggestions(results);
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setStartSuggestions([]);
    }
  }, [startQuery]);

  useEffect(() => {
    if (destQuery.trim().length > 3) {
      const delay = setTimeout(async () => {
        const results = await nominatimService.searchAddress(destQuery);
        setDestSuggestions(results);
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setDestSuggestions([]);
    }
  }, [destQuery]);

  const handleRouteCalc = async () => {
    if (!startCoords || !destCoords) return;
    try {
      const route = await confirmRoute({
        pickupLat: startCoords[0],
        pickupLng: startCoords[1],
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
      });
      setActiveRouteGeometry(route.coordinates);
      setBookingStep("confirm-route");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!startCoords || !destCoords) return;
    try {
      const results = await searchRides({
        pickupLat: startCoords[0],
        pickupLng: startCoords[1],
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
        date: dateTime || new Date().toISOString(),
        seatsNeeded: seats,
      });
      setSearchResults(results);
      setBookingStep("available-rides");
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async () => {
    if (!selectedVehicleId || !startCoords || !destCoords) return;
    try {
      await createRide({
        vehicleId: selectedVehicleId,
        pickupAddress: startQuery,
        pickupLat: startCoords[0],
        pickupLng: startCoords[1],
        destinationAddress: destQuery,
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
        date: dateTime || new Date().toISOString(),
        time: "09:00",
        availableSeats: seats,
        farePerSeat: Number(farePerSeat),
      });
      setBookingStep("find-ride");
      setStartQuery("");
      setDestQuery("");
      setStartCoords(null);
      setDestCoords(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookRide = async (ride: any) => {
    try {
      await createBooking({
        rideId: ride.id,
        seatsBooked: seats,
      });
      setBookingStep("find-ride");
    } catch (e) {
      console.error(e);
    }
  };

  // Maps coordinates centering helper
  const centerPosition: [number, number] = startCoords || [23.0225, 72.5714];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-800 dark:text-zinc-200">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 dark:border-zinc-900 dark:bg-zinc-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 dark:bg-zinc-900 dark:border-zinc-850">
              <Navigation className="h-5 w-5 text-indigo-650" />
            </div>
            <span className="font-extrabold tracking-tight text-zinc-900 dark:text-white">Carpool Market</span>
          </div>

          <nav className="hidden md:flex gap-1.5 p-1 bg-zinc-100 rounded-xl dark:bg-zinc-900">
            {([
              { id: "dashboard", label: "Commute", icon: "🚗" },
              { id: "trips", label: "My Trips", icon: "📋" },
              { id: "wallet", label: "Wallet", icon: "💳" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ] as const).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl border border-red-200/50 bg-red-50/50 text-red-600 text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-all dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Ride Booking Form Wrapper */}
              <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-100 pb-4 dark:border-zinc-850 gap-4">
                  <button
                    onClick={() => { setBookingType("find"); setBookingStep("find-ride"); }}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      bookingType === "find" ? "border-indigo-650 text-indigo-650" : "border-transparent text-zinc-400"
                    }`}
                  >
                    Find a Ride
                  </button>
                  <button
                    onClick={() => { setBookingType("offer"); setBookingStep("find-ride"); }}
                    className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      bookingType === "offer" ? "border-indigo-650 text-indigo-650" : "border-transparent text-zinc-400"
                    }`}
                  >
                    Offer a Ride
                  </button>
                </div>

                <div className="mt-6">
                  {bookingStep === "find-ride" && (
                    <div className="space-y-4">
                      {/* Search Fields with Geocoding Dropdown Suggestions */}
                      <div className="relative text-left">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Pickup Point</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Type address..."
                            value={startQuery}
                            onChange={(e) => setStartQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 pl-11 pr-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        {startSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1.5 z-[1000] max-h-48 overflow-y-auto rounded-xl border border-zinc-150 bg-white p-2 shadow-lg dark:border-zinc-850 dark:bg-zinc-900">
                            {startSuggestions.map((s, i) => (
                              <div
                                key={i}
                                onClick={() => { setStartQuery(s.label); setStartCoords([s.lat, s.lng]); setStartSuggestions([]); }}
                                className="cursor-pointer rounded-lg p-2.5 text-[11px] hover:bg-zinc-55 dark:hover:bg-zinc-800"
                              >
                                {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative text-left">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Destination Point</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Type destination..."
                            value={destQuery}
                            onChange={(e) => setDestQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 pl-11 pr-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        {destSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1.5 z-[1000] max-h-48 overflow-y-auto rounded-xl border border-zinc-150 bg-white p-2 shadow-lg dark:border-zinc-850 dark:bg-zinc-900">
                            {destSuggestions.map((s, i) => (
                              <div
                                key={i}
                                onClick={() => { setDestQuery(s.label); setDestCoords([s.lat, s.lng]); setDestSuggestions([]); }}
                                className="cursor-pointer rounded-lg p-2.5 text-[11px] hover:bg-zinc-55 dark:hover:bg-zinc-800"
                              >
                                {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {bookingType === "offer" && (
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Select Vehicle</label>
                          <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          >
                            <option value="">Choose a vehicle...</option>
                            {vehicles.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                {v.model} ({v.registrationNumber})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Date / Time</label>
                          <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Seats</label>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      {bookingType === "offer" && (
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Fare Per Seat (₹)</label>
                          <input
                            type="text"
                            value={farePerSeat}
                            onChange={(e) => setFarePerSeat(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleRouteCalc}
                        disabled={!startCoords || !destCoords}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
                      >
                        <span>Calculate Route Plan</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {bookingStep === "confirm-route" && (
                    <div className="space-y-6">
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => setBookingStep("find-ride")}
                          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-650"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Go Back</span>
                        </button>
                        <h3 className="font-bold text-sm">Verify Route Projection</h3>
                      </div>

                      <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner">
                        <MapCard
                          pickupCoords={startCoords || undefined}
                          pickupLabel={startQuery}
                          destCoords={destCoords || undefined}
                          destLabel={destQuery}
                          routeGeometry={activeRouteGeometry}
                        />
                      </div>

                      <button
                        onClick={bookingType === "find" ? handleSearch : handlePublish}
                        className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-750 transition-all cursor-pointer"
                      >
                        {bookingType === "find" ? "Proceed to Rides Search" : "Publish Ride Offer"}
                      </button>
                    </div>
                  )}

                  {bookingStep === "available-rides" && (
                    <div className="space-y-5">
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => setBookingStep("confirm-route")}
                          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-650"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to Route</span>
                        </button>
                        <h3 className="font-bold text-sm">Matching Rides</h3>
                      </div>

                      <div className="space-y-3">
                        {searchResults.length === 0 ? (
                          <p className="text-xs text-zinc-450 py-4 text-center">No matching drivers found within detour range.</p>
                        ) : (
                          searchResults.map((ride) => (
                            <div
                              key={ride.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-zinc-150 rounded-xl bg-zinc-50/50 hover:border-indigo-200"
                            >
                              <div className="space-y-1 text-left">
                                <h4 className="text-xs font-bold">{ride.driver?.firstName} {ride.driver?.lastName}</h4>
                                <span className="block text-[10px] text-zinc-500">Vehicle: {ride.vehicle?.model}</span>
                                <span className="block text-[9px] font-bold text-zinc-400 uppercase mt-0.5">Available Seats: {ride.availableSeats}</span>
                              </div>
                              <div className="mt-3 sm:mt-0 flex items-center gap-4">
                                <span className="text-sm font-black">₹{ride.farePerSeat}</span>
                                <button
                                  onClick={() => handleBookRide(ride)}
                                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
                                >
                                  Book Seat
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active WebSocket tracking chat card */}
              {activeTripId && (
                <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>Live Geolocation Tracking</span>
                    </h3>
                    <div className="h-64 w-full rounded-xl overflow-hidden">
                      <MapCard
                        pickupCoords={startCoords || undefined}
                        destCoords={destCoords || undefined}
                        driverCoords={driverCoords || undefined}
                        routeGeometry={activeRouteGeometry}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between h-80">
                    <h3 className="font-bold text-sm flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-850">
                      <MessageSquare className="h-4 w-4 text-indigo-500" />
                      <span>Trip Discussion Chat</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-zinc-50 rounded-xl my-4 dark:bg-zinc-950">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col text-left ${m.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                          <span className="text-[9px] text-zinc-450 block font-semibold mb-0.5">{m.senderName}</span>
                          <span className={`inline-block rounded-xl px-3 py-2 text-xs max-w-xs ${
                            m.senderId === user?.id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-zinc-200 text-zinc-850 dark:bg-zinc-800 dark:text-zinc-200'
                          }`}>
                            {m.content}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => { e.preventDefault(); sendMessage(chatMessageText); setChatMessageText(""); }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-xs focus:border-indigo-500 dark:border-zinc-850 dark:bg-zinc-950"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold dark:bg-zinc-850"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Vehicles Manager Tab Section */}
              <VehiclesCard
                vehicles={vehicles}
                onRegisterVehicle={async (payload) => { await createVehicle(payload); }}
                onDeleteVehicle={async (id) => { await deleteVehicle(id); }}
                isSubmitting={isCreating}
              />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <WalletCard
                balance={wallet?.availableBalance || 0}
                pendingEarnings={wallet?.pendingEarnings || 0}
                transactions={wallet?.transactions || []}
                onTriggerRecharge={() => recharge(500)}
              />

              <UpcomingTripsCard
                trips={trips.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').map((t: any) => ({
                  id: t.id,
                  route: `${t.ride?.pickupAddress} to ${t.ride?.destinationAddress}`,
                  time: `${t.ride?.time} on ${new Date(t.ride?.date).toLocaleDateString()}`,
                  vehicle: t.ride?.vehicle?.model || 'Vehicle',
                  plate: t.ride?.vehicle?.registrationNumber || 'Plate',
                  fare: `₹${t.ride?.farePerSeat}`,
                  status: t.status,
                }))}
                onSelectTrip={(trip) => {
                  setActiveTripId(trip.id);
                  const activeTripDetail = trips.find((t: any) => t.id === trip.id);
                  setIsDriverForActiveTrip(activeTripDetail?.ride?.driverId === user?.id);
                }}
                onCancelBooking={async (id) => {
                  await updateTripStatus({ id, payload: { status: 'CANCELLED' } });
                }}
              />

              <NotificationsCard
                notifications={localNotifications}
                onMarkRead={() => {}}
                onMarkAllRead={() => {}}
              />
            </div>
          </div>
        )}

        {activeTab === "trips" && (
          <UpcomingTripsCard
            trips={trips.map((t: any) => ({
              id: t.id,
              route: `${t.ride?.pickupAddress} to ${t.ride?.destinationAddress}`,
              time: `${t.ride?.time} on ${new Date(t.ride?.date).toLocaleDateString()}`,
              vehicle: t.ride?.vehicle?.model || 'Vehicle',
              plate: t.ride?.vehicle?.registrationNumber || 'Plate',
              fare: `₹${t.ride?.farePerSeat}`,
              status: t.status,
            }))}
            onSelectTrip={(trip) => {
              setActiveTripId(trip.id);
              const activeTripDetail = trips.find((t: any) => t.id === trip.id);
              setIsDriverForActiveTrip(activeTripDetail?.ride?.driverId === user?.id);
              setActiveTab("dashboard");
            }}
            onCancelBooking={async (id) => {
              await updateTripStatus({ id, payload: { status: 'CANCELLED' } });
            }}
          />
        )}

        {activeTab === "history" && (
          <RideHistoryCard
            trips={trips.filter((t: any) => t.status === 'COMPLETED' || t.status === 'CANCELLED').map((t: any) => ({
              id: t.id,
              route: `${t.ride?.pickupAddress} to ${t.ride?.destinationAddress}`,
              time: `${t.ride?.time} on ${new Date(t.ride?.date).toLocaleDateString()}`,
              fare: `₹${t.ride?.farePerSeat}`,
              status: t.status,
            }))}
          />
        )}

        {activeTab === "wallet" && (
          <WalletCard
            balance={wallet?.availableBalance || 0}
            pendingEarnings={wallet?.pendingEarnings || 0}
            transactions={wallet?.transactions || []}
            onTriggerRecharge={() => recharge(500)}
          />
        )}

        {activeTab === "settings" && (
          <SettingsCard
            user={user}
            onUpdateProfile={async (payload) => { await updateProfile(payload); }}
            isSubmitting={isUpdating}
          />
        )}
      </main>
    </div>
  );
};
