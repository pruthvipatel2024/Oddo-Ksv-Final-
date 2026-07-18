# Carpool — Enterprise Carpooling Platform

Next.js 14 (App Router) + Tailwind CSS, built from your Excalidraw wireframes, with light/dark theme and separate Employee / Admin logins.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's included

| Route | Screen |
|---|---|
| `/` | Splash screen (choose Employee or Admin) |
| `/login`, `/signup` | Employee auth |
| `/admin/login` | Admin auth |
| `/admin/employees` | Admin — Employees tab |
| `/admin/vehicles` | Admin — Vehicles tab |
| `/admin/settings` | Admin — Company & carpool config |
| `/dashboard` | Find Ride / Offer Ride |
| `/available-rides` | Matching rides list |
| `/track-ride` | Live trip tracking |
| `/my-trips` | Payment method + pay |
| `/wallet` | Balance + recharge |
| `/ride-history` | Past rides |
| `/my-vehicle` | Registered vehicles |
| `/settings` | Quick-access hub |
| `/reports` | Fuel/cost analytics |

## Design system

- **Colors**: Transit Teal `#0E7C7B` primary, Amber `#F2A93B` accent — defined in `tailwind.config.ts`.
- **Type**: Sora (display), Inter (body), JetBrains Mono (data/fares) — loaded via `next/font` in `src/app/layout.tsx`.
- **Theme**: `src/components/theme-provider.tsx` — persists to `localStorage`, respects system preference, no flash-of-wrong-theme (inline script in `layout.tsx`).
- **Signature motif**: dashed "route line" divider (`.route-divider` utility in `globals.css`) used under stat cards, nav, and page headers.
- **Data**: all screens use mock data in `src/lib/mock-data.ts` — swap in real API calls when your backend is ready.

## Next steps you'll likely want

- Wire `/login`, `/signup`, `/admin/login` forms to a real auth API (NextAuth or your own).
- Replace `RouteMap` (stylized SVG placeholder) with Google Maps / Mapbox once you have an API key.
- Replace mock data with real fetch calls (React Server Components already used where there's no interactivity, so this is mostly a drop-in swap).
