# Migration Task Tracker

## Step 1: Install Dependencies
- [ ] Install `@tanstack/react-query` and `@types/leaflet` / `leaflet` in `frontend/`

## Step 2: Query Provider & Middleware
- [ ] Create `frontend/src/components/providers/QueryProvider.tsx` and wrap the root layout
- [ ] Create `frontend/middleware.ts` to handle role redirects

## Step 3: Maps & Geolocation Services
- [ ] Create `src/services/maps/nominatim.service.ts`
- [ ] Create `src/services/maps/osrm.service.ts`
- [ ] Create `src/components/maps/LeafletMap.tsx` with Dynamic loading
- [ ] Create support map components (RoutePolyline, PickupMarker, DestinationMarker, DriverMarker, PassengerMarker)

## Step 4: Refactor SessionContext & Auth Guards
- [ ] Shrink `SessionContext.tsx` to handle authentication credentials only
- [ ] Create React route guard wrappers (`GuestGuard`, `AuthGuard`, `EmployeeGuard`, `AdminGuard`)

## Step 5: Socket Hooks
- [ ] Create custom socket namespaces hooks (`useChat`, `useTracking`)

## Step 6: Migrating Feature Modules (TanStack Query)
- [ ] Auth Feature
- [ ] Vehicle Registration & Approvals
- [ ] Ride Search & Booking
- [ ] Trip Actions & Wallet Settlements
- [ ] Admin Dashboard Tabs (Employees, Vehicles, Analytics)

## Step 7: Deconstruct and Refactor Views
- [ ] Refactor `DashboardView.tsx` into modular card sections
- [ ] Refactor `AdminDashboard.tsx` to pull live aggregates

## Step 8: Build Verification
- [ ] Run `npx tsc --noEmit` and verify build succeeds
