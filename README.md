# Enterprise Carpooling Platform

An Enterprise Carpooling Platform designed for organizations to enable employee carpooling. Employees can offer rides, book rides, trace routes, track live trips, chat, and settle payments. Admins oversee the organization, users, and settings.

---

## Database Setup Instructions (Supabase)

This project uses PostgreSQL hosted on **Supabase** for its relational database, Row Level Security (RLS), and authentication. Follow these steps to configure your database.

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and log in or sign up.
2. Click **New Project** and select/create an organization.
3. Enter a project name (e.g. `Enterprise Carpooling`), set a secure database password, and choose a region close to your users.
4. Click **Create new project** and wait for the database provisioning to complete.

### 2. Configure Environment Variables

1. Duplicate the `.env.example` file in the root directory and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Navigate to your Supabase Dashboard, click **Project Settings** (cog icon on bottom left) > **API**.
3. Copy the **Project URL** and paste it as `SUPABASE_URL` in your `.env`.
4. Copy the **anon public** API key and paste it as `SUPABASE_ANON_KEY` in your `.env`.
5. Copy the **service_role** API key and paste it as `SUPABASE_SERVICE_ROLE_KEY` in your `.env` (keep this key secret, do not expose on the client).

### 3. Run the Database Migration

You can apply the database schema migration using one of the two methods below.

#### Method A: Using Supabase Dashboard SQL Editor (Easiest)

1. In your Supabase Dashboard, click **SQL Editor** (terminal icon in the sidebar).
2. Click **New query** (or "+" button).
3. Open the file `supabase/migrations/0001_init_schema.sql` in this project.
4. Copy its entire content and paste it into the Supabase SQL Editor.
5. Click **Run** on the bottom right. You should see a message saying "Success. No rows returned." indicating the schema was successfully created.

#### Method B: Using Supabase CLI

If you have Supabase CLI installed, you can apply migrations command-line:

1. Install Supabase CLI locally if you haven't:
   ```bash
   npm install supabase --save-dev
   ```
2. Log into your Supabase account:
   ```bash
   npx supabase login
   ```
3. Link your local project to the remote Supabase project (you will need your project reference ID from the URL or Dashboard API settings and your DB password):
   ```bash
   npx supabase link --project-ref your-project-ref-id
   ```
4. Push the schema to the remote database:
   ```bash
   npx supabase db push
   ```

---

## Relational Schema Overview

The database contains the following tables:
* **`organizations`**: Holds company profiles.
* **`users`**: Extends Supabase's `auth.users` table with business fields (full_name, employee_id, role, organization reference).
* **`vehicles`**: Tracks employee-owned vehicles.
* **`rides`**: Ride publications offering available seats, routes, and fare data.
* **`bookings`**: Seat reservations made by passengers.
* **`trips`**: Active ride instances managing trip status, timestamps, and live coordination.
* **`payments`**: Records cash/card/UPI/wallet transactions for completed trips.
* **`wallets`**: Stores employee digital balances.
* **`wallet_transactions`**: Ledger records of recharges and debits.
* **`messages`**: In-app chat history between driver and passengers during trips.
* **`saved_places`**: User shortcuts for frequent addresses (e.g., Home, Office).
* **`org_settings`**: Global configuration (fuel cost, cost-per-km) set by company administrators.

### Security and Row Level Security (RLS)

RLS is enabled on all tables to prevent cross-organization data leakage and keep employee data private. For example:
- **`users`**: Employees can only read or update their own profile row.
- **`vehicles`**: Drivers can only manage their own vehicles.
- **`rides`**: Public search is open to all authenticated users in the app, but driver actions (inserts/updates/deletes) are restricted to the owner.
- **`bookings`**: Users can view bookings only if they are the booking passenger or the driver of the ride.
- **`wallets`**: Users can only see and access their own wallets.
- **`messages`**: Users can only read or send messages if they are a participant (driver or passenger) in the related trip.
