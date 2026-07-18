# Product Requirements Document (PRD)
## Enterprise Carpooling Platform

**Version:** 1.0
**Status:** Draft for Hackathon Build
**Owner:** Product/Engineering
**Source:** Carpooling Platform Hackathon Problem Statement

---

## 1. Overview

### 1.1 Problem Statement
Daily commuting is costly, congesting, and environmentally taxing. Employees at the same organization frequently travel similar routes and schedules but have no structured way to coordinate shared rides.

### 1.2 Vision
Build an **Enterprise Carpooling Platform** that lets employees of registered organizations find rides, offer rides, manage trips, track journeys live, and pay seamlessly — driving down commute cost and emissions.

### 1.3 Goals
- Reduce individual commuting cost via ride-sharing.
- Reduce traffic congestion and carbon footprint.
- Give organizations visibility and control over employee commuting via admin tooling and analytics.
- Deliver a complete, demoable, end-to-end workflow (auth → find/offer ride → trip → payment → history/reports) within the hackathon timebox.

### 1.4 Non-Goals (Hackathon Scope)
- Real money transactions (sandbox payments only — Razorpay Test Mode or equivalent).
- Cross-organization ride matching (rides are scoped to a single organization).
- Public/consumer carpooling (B2B/enterprise only, invite-based).

---

## 2. Users & Roles

### 2.1 Employee (primary user)
A single account type that can act as **driver** (Offer a Ride) or **passenger** (Find a Ride) — not separate roles, just separate flows available to the same user.

Capabilities:
- Register/manage profile
- Register/manage vehicles
- Search rides / Publish rides
- Book rides
- View/manage trips (My Trips)
- Live trip tracking
- In-trip chat/call
- Make payments (cash/card/UPI/wallet)
- View ride history & personal reports

### 2.2 Company Administrator
Manages org-level configuration only — **not involved in day-to-day ride operations**.

Capabilities:
- Manage employee records (onboarding/offboarding, access)
- Manage registered vehicles & driver info (oversight)
- Configure org-specific carpooling settings (fuel cost, cost/km, policies)
- Monitor employee participation (aggregate, not per-trip ops)
- Grant/revoke platform access

> Design implication: Admin needs a separate console/dashboard (web-first is reasonable), decoupled from the employee mobile app's ride-matching logic.

---

## 3. Core User Journey (Happy Path)

1. User launches app → Splash Screen.
2. Login or Sign Up → Profile creation (first-time).
3. Dashboard → choose **Find a Ride** or **Offer a Ride**.
4. System computes and shows route for confirmation (via mapping service).
5a. **Find a Ride:** search → view matching rides → book.
5b. **Offer a Ride:** must have ≥1 registered vehicle → publish ride (route, seats, fare).
6. Booked/published ride appears under **My Trips**.
7. During trip: both parties see live location, ETA, and can chat/call.
8. Trip completes → payment (cash/card/UPI/wallet).
9. Ride moves to **Ride History**; contributes to **Reports & Analytics**.

---

## 4. Functional Modules & Requirements

### 4.1 Authentication & Profile
- Splash screen → Login → Sign Up → Profile creation → Dashboard.
- Org-scoped auth: only employees of a **registered organization** can sign up/log in (org code/domain-based binding recommended).
- Profile: name, contact, employee ID, organization, saved places.

**Screens:** Splash, Login, Sign Up, Profile Setup

### 4.2 Find a Ride
Input required: Pickup Location, Destination, Travel Date, Travel Time, Seats needed, Recurring toggle.
Flow: Enter details → Route Confirmation (computed route shown) → Available Rides list.
Each result card shows: Driver details, Route, Departure time, Available seats, Fare/seat.

**Screens:** Find Ride, Route Confirmation, Available Rides

### 4.3 Offer a Ride
Precondition: at least 1 registered vehicle.
Input required: Pickup, Destination, Date & Time, Available seats, Fare/seat.
Flow: Enter details → Route Confirmation → Ride published & bookable.

**Screens:** Offer Ride, Route Confirmation, My Vehicle

### 4.4 Trip Management
Trip record includes: Driver details, Passenger details (driver view), Vehicle info, Pickup/Drop, Schedule, Fare, Current status.

**Trip Lifecycle (state machine):**
`Ride Booked → Trip Started → Trip In Progress → Trip Completed → Payment Pending → Payment Completed`

Communication: in-trip Chat and Voice Call between driver & passenger(s).

### 4.5 Live Trip Tracking (Mandatory)
Active only while a trip is in progress (Trip Started → Trip Completed).
Shows: live vehicle location, current route, ETA, pickup marker, destination marker, trip status.
Requires a mapping SDK (Google Maps / OpenStreetMap / Mapbox) + a real-time location channel (WebSocket / Firebase / polling fallback).

### 4.6 Payments & Wallet
Payment methods: Cash, Card, UPI, Wallet.
Wallet features: view balance, recharge, pay from wallet.
Triggered automatically at `Trip Completed` state.
Sandbox integration: Razorpay Test Mode (or equivalent).

**Screens:** Payment, Wallet

### 4.7 Ride History
Read-only log of completed trips: participants, route, vehicle, date/time, status. Feeds Reports & Analytics.

### 4.8 Vehicle Management
Fields: Vehicle Model, Registration Number, Seating Capacity.
Multiple vehicles per driver supported; only registered vehicles selectable when publishing a ride.

### 4.9 Reports & Analytics
Metrics: Total Trips, Total Distance Travelled, Fuel Consumption, Cost per KM, Vehicle-wise Cost Analysis, Fuel Efficiency Trends.
Consumers: Employee (personal view) and Admin (org-wide aggregate view).

### 4.10 Settings
Quick-access hub: My Trips, My Vehicle, Payment Methods, Ride History, Saved Places, Help & Support, Chat.
**Saved Places:** named shortcuts (Home, Office, etc.) to speed up future searches/publishing.

### 4.11 Company Administration
- Employee record management (CRUD, activation/deactivation)
- Vehicle/driver oversight
- Org settings: fuel cost, travel cost, carpooling policy config
- Participation monitoring dashboard

---

## 5. Functional Requirements Summary (Traceability Table)

| Category | Requirements |
|---|---|
| User Management | Employee Registration, Login, Profile Management, Company Administration |
| Ride Management | Search Ride, Publish Ride, Route Confirmation, Ride Matching, Ride Booking, Trip Management, Live Trip Tracking |
| Vehicle Management | Register Vehicle, Update Vehicle Info, Manage Seat Availability |
| Payment Management | Cash, Card, UPI, Wallet payments |
| Wallet Management | Recharge, View Balance, Wallet-based payments |
| Reports & Analytics | Ride History, Travel Reports, Cost Analysis, Fuel Consumption Reports |

---

## 6. Non-Functional Requirements

- **Multi-tenancy:** platform must isolate data per organization; no cross-org ride visibility.
- **Security:** authenticated, role-scoped access (Employee vs Admin); vehicle/payment data protected.
- **Real-time:** live tracking updates should feel near-real-time (target: location refresh every 3–5s).
- **Reliability:** trip state transitions must be atomic and auditable (no lost/duplicate state changes).
- **Scalability (design intent, not hackathon-required):** architecture should not preclude multiple orgs/thousands of employees.
- **Usability:** route confirmation step before both search and publish to prevent bad-data bookings.

---

## 7. Assumptions

- Platform supports multiple organizations, each with its own users and administrator.
- Only authenticated users of a registered organization can access the platform.
- One driver, one-or-more passengers per ride, bounded by seat capacity.
- Drivers must register ≥1 vehicle before publishing rides.
- Mapping service (Google Maps / OpenStreetMap / equivalent) powers routing and live tracking.
- Live location sharing is active only during an active trip.
- Payments use a sandbox (Razorpay Test Mode or equivalent) — no real money.
- Reports are computed from trip, vehicle, and travel data collected in-app.

---

## 8. Data Entities (High-Level)

- **Organization** (id, name, domain/code, settings: fuelCostPerLitre, costPerKm, policy config)
- **Employee/User** (id, orgId, name, contact, role: EMPLOYEE/ADMIN, walletBalance, savedPlaces[])
- **Vehicle** (id, ownerId, model, regNumber, seatingCapacity)
- **Ride** (id, orgId, driverId, vehicleId, pickup, destination, route, date, time, availableSeats, farePerSeat, recurring, status)
- **Booking** (id, rideId, passengerId, seatsBooked, status)
- **Trip** (id, rideId, participants[], status: BOOKED/STARTED/IN_PROGRESS/COMPLETED/PAYMENT_PENDING/PAYMENT_COMPLETED, liveLocation, eta)
- **Payment** (id, tripId, payerId, amount, method: CASH/CARD/UPI/WALLET, status)
- **WalletTransaction** (id, userId, type: RECHARGE/PAYMENT, amount, timestamp)
- **ChatMessage** (id, tripId, senderId, content, timestamp)
- **Report/Analytics** (derived/aggregated — not stored raw; computed from Trip + Vehicle + Ride data)

Full field-level schema lives in `DATA_MODEL.md`.

---

## 9. Screens Inventory

Splash → Login → Sign Up → Profile Setup → Dashboard →
Find Ride → Route Confirmation → Available Rides →
Offer Ride → My Vehicle →
My Trips → Trip Detail (with map, chat, call) →
Payment → Wallet →
Ride History → Reports Dashboard →
Settings → Saved Places →
**Admin:** Employee Management, Vehicle Oversight, Org Settings, Participation Dashboard

---

## 10. Evaluation Expectations (Hackathon Judging Criteria)

**Mandatory (must all be demoable end-to-end):**
Authentication, Ride Discovery, Ride Publishing, Route Confirmation, Ride Booking, Trip Management, Live Trip Tracking, Vehicle Management, Payments & Wallet, Ride History, Reports Dashboard.

**Bonus (differentiators):**
Ride Notifications, Ride Cancellation, Intelligent Ride Matching, Route Optimization, Enhanced Analytics, Real-time Push Notifications.

**Free choice of tech stack.** Judged primarily on complete, working end-to-end workflow — breadth and correctness over polish of any single feature.

---

## 11. Reference

Mockup (Excalidraw): https://link.excalidraw.com/l/65VNwvy7c4X/4OqWfsLBtnt
