# AGENTS.md — Instructions for the AI Coding Agent

This file tells any AI coding agent (Claude Code, Cursor, etc.) how to work in this repository. Read this **and** `PRD.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TASKS.md` before writing code.

---

## 1. Project Summary

Enterprise Carpooling Platform for a hackathon. Employees of a registered organization find or offer rides, manage trips, track them live, chat/call, and pay via cash/card/UPI/wallet. Admins configure org settings and manage employee/vehicle records but never touch ride operations.

Full requirements: `PRD.md`. Data schema: `DATA_MODEL.md`. System design: `ARCHITECTURE.md`. Ordered build plan: `TASKS.md`.

---

## 2. Recommended Tech Stack

Stack is free-choice per the problem statement. Default recommendation (optimized for hackathon speed + judge-readiness):

- **Frontend (mobile/web):** React Native (Expo) if a mobile app is expected from screens like Splash/Login; otherwise React + Vite for a web app. Use React Native Maps or `react-leaflet`/Google Maps JS SDK for mapping.
- **Backend:** Node.js + Express (or NestJS if the agent wants structure) with TypeScript.
- **Database:** PostgreSQL (relational fits the entity relationships well: Org → Employee → Vehicle → Ride → Booking → Trip → Payment).
- **Realtime:** Socket.IO (or Firebase Realtime DB) for live location updates and chat.
- **Maps/Routing:** Google Maps Platform (Directions + Places API) or OpenStreetMap + OSRM if avoiding paid keys.
- **Payments:** Razorpay Test Mode (sandbox).
- **Auth:** JWT-based auth, org-scoped (org code or email-domain binding at signup).

The agent should treat this as a **default**, not a mandate — if the user has already chosen a different stack, follow that instead and don't re-litigate this section.

---

## 3. Non-Negotiable Domain Rules (encode these as validation/guards)

1. A user cannot publish a ride (`Offer a Ride`) without at least one registered vehicle.
2. `availableSeats` on a Ride can never go negative; bookings must be rejected once seats are exhausted.
3. Rides and users are always scoped to a single `organizationId`. Every query that lists/searches rides MUST filter by the requesting user's org. No cross-org data leakage — treat this as a security requirement, not a UX nicety.
4. Trip status transitions are one-directional and must follow:
   `BOOKED → STARTED → IN_PROGRESS → COMPLETED → PAYMENT_PENDING → PAYMENT_COMPLETED`
   Do not allow skipping states or moving backward via the API.
5. Live location updates/tracking are only accepted/broadcast while trip status is `STARTED` or `IN_PROGRESS`.
6. Payment is only initiable once a trip reaches `COMPLETED`.
7. The Company Administrator role is configuration/oversight only — do not give Admin endpoints the ability to book, publish, or start/track rides on behalf of others.
8. Route confirmation is a required step before both ride search (Find) and ride publish (Offer) — don't let the agent skip straight to "search" or "publish" without first rendering/confirming a computed route.

---

## 4. Build Priority Order

Follow `TASKS.md` for granular steps, but the priority order is:

1. Auth + Org scoping + Profile
2. Vehicle Management
3. Offer a Ride (publish) + Route Confirmation
4. Find a Ride (search/match) + Route Confirmation
5. Ride Booking
6. Trip Management (state machine) + Chat
7. Live Trip Tracking
8. Payments & Wallet
9. Ride History
10. Reports & Analytics
11. Admin console
12. Bonus features (notifications, cancellation, smarter matching, route optimization)

Do not start Reports/Analytics or Admin console before the core ride/trip/payment loop works end-to-end — the demoable happy path is the top priority for a hackathon.

---

## 5. Coding Conventions

- **Language:** TypeScript everywhere (frontend & backend) for shared types.
- **Structure:** Feature-based folders (`/features/rides`, `/features/trips`, `/features/payments`, `/features/vehicles`, `/features/admin`), not type-based (`/controllers`, `/models` scattered globally).
- **API style:** REST, resource-based (`/api/rides`, `/api/trips/:id/status`, `/api/payments`). Use consistent envelope for responses: `{ success, data, error }`.
- **Validation:** Validate all inputs at the API boundary (zod or class-validator). Never trust client-sent org IDs — derive org from the authenticated JWT, not from request body.
- **Env config:** All secrets (map API keys, payment sandbox keys, JWT secret) in `.env`, never hardcoded. Provide `.env.example`.
- **Commits:** Small, scoped commits per module (e.g., `feat(rides): add publish-ride endpoint`).
- **Tests:** At minimum, unit-test the trip state machine and seat-availability logic — these are the highest-risk-of-bug areas.

---

## 6. What "Done" Looks Like for the Hackathon Demo

A single script/flow should be able to:
1. Register two employees in the same org (one will drive, one will ride).
2. Driver registers a vehicle, offers a ride.
3. Passenger finds and books that ride.
4. Driver starts trip → both see live tracking + can chat.
5. Trip completes → passenger pays via wallet (or sandbox card/UPI).
6. Ride appears in both users' Ride History.
7. Reports dashboard reflects the completed trip's distance/cost.
8. Admin can log in separately and see the org's employee/vehicle/participation data (but cannot touch the ride itself).

If the agent can produce this flow working (even with a rough UI), the mandatory evaluation criteria are satisfied.

---

## 7. Things to Avoid

- Don't build a generic public marketplace — this is B2B/enterprise, org-scoped.
- Don't wire real payment processing — sandbox/test mode only.
- Don't merge Employee and Admin into one flat permission set — keep the separation explicit (Admin is config-only).
- Don't skip the Route Confirmation screen/step even if it feels redundant — it's explicitly called out twice in the spec (Find and Offer flows).


