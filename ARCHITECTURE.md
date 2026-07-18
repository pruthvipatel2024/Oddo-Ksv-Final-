# ARCHITECTURE.md — System Design

## 1. High-Level Architecture

```
┌────────────────┐        ┌────────────────┐        ┌────────────────┐
│  Employee App   │        │   Admin Console  │        │  Mapping Service │
│ (mobile/web)    │        │ (web dashboard)   │        │ (Google/OSM)     │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │  REST + WebSocket          │  REST                   │ Directions API
         ▼                            ▼                          │
                 ┌────────────────────────────────┐              │
                 │        API Gateway / Backend     │◄────────────┘
                 │  (Auth, Rides, Trips, Payments)  │
                 └───────────────┬──────────────────┘
                                  │
             ┌────────────────────┼─────────────────────┐
             ▼                    ▼                      ▼
     ┌───────────────┐   ┌────────────────┐    ┌──────────────────┐
     │  PostgreSQL     │   │ Realtime Layer   │    │ Payment Sandbox    │
     │ (core data)     │   │ (Socket.IO /     │    │ (Razorpay Test)     │
     │                 │   │  Firebase RTDB)  │    │                    │
     └───────────────┘   └────────────────┘    └──────────────────┘
```

## 2. Component Responsibilities

### 2.1 API Backend
- Auth & session (JWT, org-scoped)
- Ride CRUD (publish/search/match)
- Booking logic (seat allocation, atomic decrement)
- Trip state machine (enforces valid transitions only)
- Payment orchestration (calls sandbox gateway, records `Payment`)
- Wallet ledger (recharge/debit, always via transaction records, never direct balance mutation without a ledger row)
- Reports aggregation (reads Trip/Ride/Vehicle data, computes metrics — can be a scheduled job or on-demand query)
- Admin endpoints (separate route namespace `/api/admin/*`, requires ADMIN role)

### 2.2 Realtime Layer
- Channel per active trip (`trip:{tripId}`)
- Driver app publishes location every 3–5s while trip is `STARTED`/`IN_PROGRESS`
- Passenger app subscribes to the same channel for live marker + ETA
- Chat messages routed through the same trip channel or a dedicated `chat:{tripId}` channel
- Channel is torn down / stops accepting updates once trip reaches `COMPLETED`

### 2.3 Mapping Service
- Route computation (Directions API) for Route Confirmation screens (both Find & Offer flows)
- Reverse geocoding for pickup/destination search
- Distance/ETA calculation feeds both live tracking and post-trip Reports (distance travelled, cost/km)

### 2.4 Payment Sandbox
- Triggered only when Trip status = `COMPLETED`
- On success, backend transitions Trip → `PAYMENT_COMPLETED` and writes a `Payment` record
- Wallet payments bypass the external gateway entirely (internal ledger debit) but still produce a `Payment` record for consistency in Ride History

## 3. Trip State Machine (authoritative)

```
BOOKED ──(driver starts trip)──► STARTED ──► IN_PROGRESS ──(driver ends trip)──► COMPLETED
                                                                                   │
                                                                                   ▼
                                                                          PAYMENT_PENDING
                                                                                   │
                                                                        (payment succeeds)
                                                                                   ▼
                                                                          PAYMENT_COMPLETED
```

Rules:
- Only the assigned driver can move a trip from `BOOKED → STARTED` and `STARTED/IN_PROGRESS → COMPLETED`.
- `IN_PROGRESS` is set automatically once live-location events start flowing (or can be merged with `STARTED` if the agent wants a simpler model — document the choice if simplified).
- Backward transitions are forbidden at the API layer.
- Reaching `COMPLETED` auto-creates a `PAYMENT_PENDING` payment record.

## 4. Multi-Tenancy / Org Scoping

- Every table with user-generated data carries `organizationId` (directly, or transitively via `driverId`/`ownerId` → `Employee.organizationId`).
- All list/search endpoints (`GET /rides`, `GET /trips`, `GET /reports`) must filter by `req.user.organizationId` server-side — never rely on the client to send the correct org filter.
- Admin endpoints are similarly scoped: an Admin only ever sees/manages their own organization's data.

## 5. Security Notes

- JWT contains `userId`, `organizationId`, `role` (`EMPLOYEE` | `ADMIN`).
- Middleware: `requireAuth`, `requireRole('ADMIN')`, `requireSameOrg(resourceOrgId)`.
- Payment webhook endpoints (if using Razorpay webhooks) must verify signatures — don't trust unsigned payment-success callbacks.
- Location data is only broadcast to participants of that specific trip, never globally.

## 6. Suggested Repo Layout

```
/apps
  /mobile (or /web)        # employee-facing client
  /admin-web               # admin console
  /api                     # backend
    /src
      /features
        /auth
        /users
        /vehicles
        /rides
        /trips
        /payments
        /wallet
        /reports
        /admin
      /realtime             # socket handlers
      /lib                  # shared utils (maps client, payment client)
      /db                   # schema/migrations
/docs
  PRD.md
  AGENTS.md
  ARCHITECTURE.md
  DATA_MODEL.md
  TASKS.md
```
