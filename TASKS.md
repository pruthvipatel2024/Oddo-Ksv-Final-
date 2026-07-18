# TASKS.md — Build Backlog (Ordered)

Use this as the working checklist. Each phase should end in something runnable/demoable before moving to the next. Check items off as completed.

## Phase 0 — Setup
- [ ] Init repo structure per `ARCHITECTURE.md` §6
- [ ] Set up PostgreSQL + ORM, run initial migration from `DATA_MODEL.md`
- [ ] Set up `.env.example` (DB url, JWT secret, maps API key, payment sandbox keys)
- [ ] Set up backend skeleton (Express/NestJS) with health-check route

## Phase 1 — Auth & Org Scoping
- [ ] Organization seed data (at least 2 orgs for testing isolation)
- [ ] Employee Registration (bound to org via org code)
- [ ] Employee Login (JWT issuance)
- [ ] Profile creation/edit
- [ ] Auth middleware (`requireAuth`, `requireRole`, `requireSameOrg`)
- [ ] Screens: Splash, Login, Sign Up, Profile Setup, Dashboard shell

## Phase 2 — Vehicle Management
- [ ] Register vehicle (model, reg number, seating capacity)
- [ ] List/update/delete own vehicles
- [ ] Guard: cannot publish a ride without ≥1 vehicle
- [ ] Screen: My Vehicle

## Phase 3 — Offer a Ride
- [ ] Publish ride endpoint (pickup, destination, date/time, seats, fare)
- [ ] Route Confirmation: call Directions API, store polyline
- [ ] Screens: Offer Ride, Route Confirmation

## Phase 4 — Find a Ride
- [ ] Search endpoint (pickup, destination, date, time, seats, recurring filter)
- [ ] Matching logic (same org, date/time window, route proximity — start simple: same destination/date; refine later)
- [ ] Route Confirmation reused for search flow
- [ ] Screens: Find Ride, Route Confirmation, Available Rides

## Phase 5 — Booking
- [ ] Book ride endpoint — atomic seat decrement, reject if insufficient seats
- [ ] Create Trip record on first confirmed booking (status = BOOKED)
- [ ] Screen: My Trips (list)

## Phase 6 — Trip Management + Chat
- [ ] Trip state machine endpoints: start, (in-progress auto), complete
- [ ] Enforce only assigned driver can transition trip status
- [ ] Chat: send/receive messages scoped to tripId (REST or socket)
- [ ] Screen: Trip Detail (participants, schedule, fare, status, chat)

## Phase 7 — Live Trip Tracking
- [ ] Socket channel `trip:{tripId}`
- [ ] Driver client emits location every 3–5s while STARTED/IN_PROGRESS
- [ ] Passenger client subscribes, renders live marker + ETA on map
- [ ] Auto-close channel at COMPLETED
- [ ] Optional: Voice call (WebRTC or third-party SDK) — can be stubbed/bonus if time-constrained

## Phase 8 — Payments & Wallet
- [ ] Wallet: recharge, view balance, pay-from-wallet (ledger-based)
- [ ] Cash/Card/UPI via sandbox gateway (Razorpay Test Mode)
- [ ] On payment success: Trip → PAYMENT_COMPLETED, write Payment record
- [ ] Screens: Payment, Wallet

## Phase 9 — Ride History
- [ ] List completed trips (participants, route, vehicle, date/time, status)
- [ ] Screen: Ride History

## Phase 10 — Reports & Analytics
- [ ] Aggregation queries: total trips, total distance, fuel consumption, cost/km, vehicle-wise cost, fuel efficiency trend
- [ ] Personal report view (employee) + Org-wide report view (admin)
- [ ] Screen: Reports Dashboard

## Phase 11 — Admin Console
- [ ] Admin auth (role=ADMIN)
- [ ] Employee record management (CRUD, access grant/revoke)
- [ ] Vehicle/driver oversight (read + flag, not day-to-day ops)
- [ ] Org settings config (fuelCostPerLitre, costPerKm, policy)
- [ ] Participation monitoring dashboard

## Phase 12 — Settings & Polish
- [ ] Settings hub (My Trips, My Vehicle, Payment Methods, Ride History, Saved Places, Help & Support, Chat)
- [ ] Saved Places CRUD (Home/Office shortcuts), wire into Find/Offer forms

## Phase 13 — Bonus (time permitting)
- [ ] Ride Notifications
- [ ] Ride Cancellation (with seat/refund handling)
- [ ] Intelligent Ride Matching (proximity/time scoring, not just exact match)
- [ ] Route Optimization
- [ ] Enhanced Analytics (predictive/trend visuals)
- [ ] Real-time Push Notifications

## Demo Script (final validation — see `AGENTS.md` §6)
- [ ] Two employees, same org, one drives / one rides — full happy path works end to end
- [ ] Admin login shows org data without touching ride ops
