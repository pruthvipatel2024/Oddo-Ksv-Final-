# Enterprise Frontend Migration & Dynamic Backend Integration Plan (v2)

This document provides a highly detailed roadmap for refactoring the Next.js frontend into a production-ready, feature-driven, and completely dynamic B2B carpooling marketplace application. All static/mock data, arrays, and fake logic will be completely removed.

---

## 1. API Endpoint Inventory & Service Mapping

The frontend will consume the backend API endpoints. No mock data or un-modeled requests are permitted:

| Endpoint | Method | Scope/Module | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Auth | Employee signup (verifies org code) |
| `/api/v1/auth/login` | `POST` | Auth | Login, returns access + refresh tokens |
| `/api/v1/auth/refresh` | `POST` | Auth | Refreshes JWT tokens |
| `/api/v1/auth/logout` | `POST` | Auth | Standard token invalidation |
| `/api/v1/auth/forgot-password` | `POST` | Auth | Triggers password reset request |
| `/api/v1/auth/reset-password` | `POST` | Auth | Updates password with token |
| `/api/v1/auth/verify-email` | `POST` | Auth | Confirms signup email token |
| `/api/v1/users/profile` | `GET`/`PATCH`| Profile | Fetch/update commuter profile |
| `/api/v1/users/dashboard/employee` | `GET` | Dashboard | User's active bookings, rides, vehicles |
| `/api/v1/users/dashboard/org-admin` | `GET` | Admin | Commute statistics, vehicle queue |
| `/api/v1/users/dashboard/super-admin`| `GET` | Admin | Platform-wide revenue and commissions |
| `/api/v1/organizations` | `GET`/`POST` | Orgs | Lists or creates organizations |
| `/api/v1/vehicles` | `GET`/`POST` | Vehicles | Register or list user vehicles |
| `/api/v1/vehicles/:id/verify` | `PATCH` | Vehicles | Verify status (Admin only) |
| `/api/v1/rides/search` | `GET` | Rides | Detour matching & route-scoped search |
| `/api/v1/rides` | `POST` | Rides | Drivers publish a new ride offer |
| `/api/v1/bookings` | `POST`/`GET` | Bookings | Passenger books ride seats |
| `/api/v1/bookings/:id/status` | `PATCH` | Bookings | Approves or rejects booking seat requests |
| `/api/v1/trips/:id` | `GET` | Trips | Retrieve active trip tracking details |
| `/api/v1/trips/:id/status` | `PATCH` | Trips | Transition status (Start/Complete/Cancel) |
| `/api/v1/wallets/my-balance` | `GET` | Wallet | Available & pending ledger balances |
| `/api/v1/payments/checkout` | `POST` | Payments | Initiates checkout order details |
| `/api/v1/withdrawals` | `POST`/`GET` | Withdrawals | Request payout earnings |
| `/api/v1/ratings` | `POST` | Ratings | Driver or passenger review logs |
| `/api/v1/chat/trips/:tripId/messages` | `GET` | Chat | Fetch historical message records |

---

## 2. Shared Architecture & State Management

1. **Server-State Integration**:
   - Install `@tanstack/react-query` inside the `frontend` folder.
   - Register a unified `QueryClientProvider` wrapping the Next.js layouts (`frontend/src/components/providers/QueryProvider.tsx`).
   - All standard queries and mutations must wrap the Axios services inside custom React Query hooks (e.g., `useProfile()`, `useRidesSearch()`, `usePostBooking()`).
2. **Local Session Context**:
   - Refactor `SessionContext.tsx` to handle **only** authentication state, token storage management (`tokenStorage`), login, logout, and token refreshes.
   - Remove `wallet`, `vehicles`, and `notifications` from `SessionContext`. These states will be queried directly in their feature modules using TanStack Query.
3. **Route Guards & Next.js Middleware**:
   - Create explicit React guard wrapper components:
     - `AuthGuard` (redirects unauthenticated users to `/auth/login`).
     - `EmployeeGuard` (blocks non-employee roles).
     - `AdminGuard` (blocks roles that are not `ORGANIZATION_ADMIN` or `SUPER_ADMIN`).
     - `GuestGuard` (redirects authenticated users away from login/register).
   - Create Next.js App Router `frontend/middleware.ts` to perform session validation checks, cookie checks, and role redirections on route entries.

---

## 3. Modular Feature Refactoring

Every module in `frontend/src/features/` will have:
- Reusable React Query hooks (`hooks/`).
- Axios API service clients (`api/`).
- Specific interfaces (`types/`).
- Modular views and sub-components (`components/`).

### Auth Feature (`features/auth/`)
- Enforce dynamic form submissions and validations (employee code checks, email domains).
- Build separate login screens for employees (`/auth/login`) and admins (`/admin/login`).

### Dashboard Feature (`features/dashboard/`)
- Split the monolithic `DashboardView.tsx` into decoupled sub-components:
  - `OverviewSection.tsx`: Summary of stats.
  - `UpcomingTripsCard.tsx`: Display trip booking statuses.
  - `WalletCard.tsx`: Balance summaries and quick withdrawal trigger links.
  - `RideHistoryCard.tsx`: List of passenger/driver past trips.
  - `NotificationsCard.tsx`: Read/unread notification messages.
  - `MapCard.tsx`: Integrates Leaflet tracking.

### Admin Feature (`features/admin/`)
- Remove all elements from `mock-data.ts`.
- Connect statistics cards directly to `org-admin` or `super-admin` dashboards.
- Refactor `EmployeesTab.tsx` and `VehiclesTab.tsx` to query live database pagination lists.

---

## 4. Maps & Routing Replacement

All Google Maps dependencies and API keys will be removed. The application will use an open-source mapping stack:

1. **Nominatim Service (`src/services/maps/nominatim.service.ts`)**:
   - Geocodes addresses into latitude and longitude coordinates.
   - Queries `https://nominatim.openstreetmap.org/search`.
2. **OSRM Service (`src/services/maps/osrm.service.ts`)**:
   - Fetches dynamic routes, distance text, duration text, and polyline coordinates.
   - Queries `https://router.project-osrm.org/route/v1/driving/`.
3. **Interactive Maps Directory (`src/components/maps/`)**:
   - `LeafletMap.tsx`: Loads Leaflet dynamically (`ssr: false`) to display OpenStreetMap tiles.
   - `RoutePolyline.tsx`: Decodes and draws route geometries.
   - `PickupMarker.tsx` / `DestinationMarker.tsx`: Custom markers indicating trip endpoints.
   - `DriverMarker.tsx` / `PassengerMarker.tsx`: Live updating markers representing participant coordinates.

---

## 5. WebSockets & Real-time Integration

Create specialized, hooks-based Socket.IO namespace interfaces instead of component-level emitters:

1. **WebSocket Services (`src/services/websocket/`)**:
   - `chat.socket.ts`: Emits `joinConversation` and `sendMessage` events.
   - `tracking.socket.ts`: Handles coordinates pinging and listening.
2. **WebSocket Hooks**:
   - `useChat(tripId)`: Subscribes to active conversations, listens for incoming messages, and updates query caches.
   - `useTracking(tripId, isDriver)`: Listens for location updates, caches coordinates, and broadcasts pings if the user is the driver.

---

## 6. Implementation Checklist & Files to Edit/Create

### [MODIFY] [package.json](file:///d:/Oddo-Ksv-FInal/frontend/package.json)
- Add `@tanstack/react-query`, `leaflet`, and `@types/leaflet`.

### [NEW] [middleware.ts](file:///d:/Oddo-Ksv-FInal/frontend/middleware.ts)
- Implement role redirects and path validations.

### [NEW] [nominatim.service.ts](file:///d:/Oddo-Ksv-FInal/frontend/src/services/maps/nominatim.service.ts)
- Geocoding coordinates wrapper.

### [NEW] [osrm.service.ts](file:///d:/Oddo-Ksv-FInal/frontend/src/services/maps/osrm.service.ts)
- Polyline and route duration lookup wrapper.

### [NEW] [QueryProvider.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/components/providers/QueryProvider.tsx)
- React Query configuration wrap.

### [NEW] [LeafletMap.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/components/maps/LeafletMap.tsx)
- Client-only MapLibre/Leaflet rendering wrapper.

### [NEW] [RoutePolyline.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/components/maps/RoutePolyline.tsx)
- Polyline overlay helper.

### [MODIFY] [SessionContext.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/context/SessionContext.tsx)
- Thin authentication context layer.

### [MODIFY] [DashboardView.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/features/dashboard/components/DashboardView.tsx)
- Decompose, replace mocks, and inject Leaflet mapping.

### [MODIFY] [AdminDashboard.tsx](file:///d:/Oddo-Ksv-FInal/frontend/src/features/admin/components/AdminDashboard.tsx)
- Hook up to backend admin dashboards, remove mock files.

---

## 7. Verification Plan

### Automated Checks
- `npx tsc --noEmit` inside `frontend/` runs without errors.
- `npm run build` inside `frontend/` builds Next.js pages successfully.

### Manual Scenarios

#### Employee Flow
1. **Signup/Login**: Register an account with org code `CORPA`, verify login success.
2. **Publish Ride**: Search destination, confirm route visual polyline via OSRM, publish ride.
3. **Search & Book**: Log in as passenger, search for detour-matching rides, book seats.
4. **Active Trip**: Driver starts trip. Both see live updating Leaflet markers and chat.
5. **Wallet Settle**: Driver completes trip. Escrow funds unlock. Available balance updates.

#### Admin Flow
1. **Org Admin Dashboard**: Login as Admin, view active employees, approve vehicles, review commute statistics.
2. **Super Admin**: View platform-wide revenue commissions, withdrawals, and organizations.
