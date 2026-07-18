-- STEP 3: Enable required extensions
create extension if not exists "uuid-ossp";

-- TABLE: organizations
create table public.organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamp default now()
);

-- TABLE: users
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    org_id uuid references public.organizations(id),
    full_name text,
    email text,
    phone text,
    employee_id text,
    role text check (role in ('admin', 'employee')) default 'employee',
    profile_photo_url text,
    created_at timestamp default now()
);

-- TABLE: vehicles
create table public.vehicles (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid references public.users(id) on delete cascade,
    model text,
    registration_number text,
    seating_capacity int,
    created_at timestamp default now()
);

-- TABLE: rides
create table public.rides (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references public.users(id) on delete cascade,
    vehicle_id uuid references public.vehicles(id),
    pickup_location text,
    pickup_lat float,
    pickup_lng float,
    destination text,
    destination_lat float,
    destination_lng float,
    travel_date date,
    travel_time time,
    seats_available int,
    fare_per_seat numeric,
    is_recurring boolean default false,
    status text check (status in ('active', 'full', 'completed', 'cancelled')) default 'active',
    created_at timestamp default now()
);

-- TABLE: bookings
create table public.bookings (
    id uuid primary key default uuid_generate_v4(),
    ride_id uuid references public.rides(id) on delete cascade,
    passenger_id uuid references public.users(id) on delete cascade,
    seats_booked int,
    status text check (status in ('booked', 'cancelled')) default 'booked',
    created_at timestamp default now()
);

-- TABLE: trips
create table public.trips (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references public.bookings(id) on delete cascade,
    status text check (status in ('booked', 'started', 'in_progress', 'completed', 'payment_pending', 'payment_completed')) default 'booked',
    driver_current_lat float,
    driver_current_lng float,
    started_at timestamp,
    completed_at timestamp
);

-- TABLE: payments
create table public.payments (
    id uuid primary key default uuid_generate_v4(),
    trip_id uuid references public.trips(id) on delete cascade,
    payer_id uuid references public.users(id),
    amount numeric,
    method text check (method in ('cash', 'card', 'upi', 'wallet')),
    status text check (status in ('pending', 'completed', 'failed')) default 'pending',
    razorpay_payment_id text,
    created_at timestamp default now()
);

-- TABLE: wallets
create table public.wallets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade unique,
    balance numeric default 0
);

-- TABLE: wallet_transactions
create table public.wallet_transactions (
    id uuid primary key default uuid_generate_v4(),
    wallet_id uuid references public.wallets(id) on delete cascade,
    type text check (type in ('recharge', 'debit')),
    amount numeric,
    created_at timestamp default now()
);

-- TABLE: messages
create table public.messages (
    id uuid primary key default uuid_generate_v4(),
    trip_id uuid references public.trips(id) on delete cascade,
    sender_id uuid references public.users(id),
    text text,
    created_at timestamp default now()
);

-- TABLE: saved_places
create table public.saved_places (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade,
    label text,
    address text,
    lat float,
    lng float
);

-- TABLE: org_settings
create table public.org_settings (
    id uuid primary key default uuid_generate_v4(),
    org_id uuid references public.organizations(id) on delete cascade unique,
    fuel_cost_per_liter numeric,
    cost_per_km numeric
);

-- STEP 4: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  
  insert into public.wallets (user_id, balance)
  values (
    new.id,
    0
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STEP 5: Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.bookings enable row level security;
alter table public.trips enable row level security;
alter table public.payments enable row level security;
alter table public.wallets enable row level security;
alter table public.messages enable row level security;
alter table public.saved_places enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.organizations enable row level security;
alter table public.org_settings enable row level security;

-- POLICIES: users
create policy "Users can select their own profile" on public.users
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
    for update using (auth.uid() = id);

-- POLICIES: vehicles
create policy "Users can manage their own vehicles" on public.vehicles
    for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- POLICIES: rides
create policy "Authenticated users can view rides" on public.rides
    for select using (auth.role() = 'authenticated');

create policy "Drivers can insert their own rides" on public.rides
    for insert with check (auth.uid() = driver_id);

create policy "Drivers can update their own rides" on public.rides
    for update using (auth.uid() = driver_id) with check (auth.uid() = driver_id);

create policy "Drivers can delete their own rides" on public.rides
    for delete using (auth.uid() = driver_id);

-- POLICIES: bookings
create policy "Users can view bookings they are passenger or driver of" on public.bookings
    for select using (
        auth.uid() = passenger_id 
        or auth.uid() = (select driver_id from public.rides r where r.id = bookings.ride_id)
    );

create policy "Passengers can insert their own bookings" on public.bookings
    for insert with check (auth.uid() = passenger_id);

create policy "Passengers or drivers can update bookings" on public.bookings
    for update using (
        auth.uid() = passenger_id 
        or auth.uid() = (select driver_id from public.rides r where r.id = bookings.ride_id)
    ) with check (
        auth.uid() = passenger_id 
        or auth.uid() = (select driver_id from public.rides r where r.id = bookings.ride_id)
    );

create policy "Passengers or drivers can delete bookings" on public.bookings
    for delete using (
        auth.uid() = passenger_id 
        or auth.uid() = (select driver_id from public.rides r where r.id = bookings.ride_id)
    );

-- POLICIES: trips
create policy "Users can view trips they are part of" on public.trips
    for select using (
        auth.uid() = (select passenger_id from public.bookings b where b.id = trips.booking_id)
        or auth.uid() = (select r.driver_id from public.bookings b join public.rides r on b.ride_id = r.id where b.id = trips.booking_id)
    );

create policy "Drivers can update their own trips" on public.trips
    for update using (
        auth.uid() = (select r.driver_id from public.bookings b join public.rides r on b.ride_id = r.id where b.id = trips.booking_id)
    );

-- POLICIES: payments
create policy "Users can view payments they are part of" on public.payments
    for select using (
        auth.uid() = payer_id 
        or auth.uid() = (select r.driver_id from public.trips t join public.bookings b on t.booking_id = b.id join public.rides r on b.ride_id = r.id where t.id = payments.trip_id)
    );

create policy "Payers can insert payments" on public.payments
    for insert with check (auth.uid() = payer_id);

-- POLICIES: wallets
create policy "Users can manage their own wallet" on public.wallets
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- POLICIES: wallet_transactions
create policy "Users can view their own wallet transactions" on public.wallet_transactions
    for select using (
        auth.uid() = (select user_id from public.wallets w where w.id = wallet_transactions.wallet_id)
    );

-- POLICIES: messages
create policy "Users can see messages for trips they are part of" on public.messages
    for select using (
        auth.uid() = (select passenger_id from public.bookings b join public.trips t on b.id = t.booking_id where t.id = messages.trip_id)
        or auth.uid() = (select r.driver_id from public.trips t join public.bookings b on t.booking_id = b.id join public.rides r on b.ride_id = r.id where t.id = messages.trip_id)
    );

create policy "Users can insert messages into trips they are part of" on public.messages
    for insert with check (
        auth.uid() = sender_id 
        and (
            auth.uid() = (select passenger_id from public.bookings b join public.trips t on b.id = t.booking_id where t.id = messages.trip_id)
            or auth.uid() = (select r.driver_id from public.trips t join public.bookings b on t.booking_id = b.id join public.rides r on b.ride_id = r.id where t.id = messages.trip_id)
        )
    );

-- POLICIES: saved_places
create policy "Users can manage their own saved places" on public.saved_places
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- POLICIES: organizations & org_settings
create policy "Authenticated users can select organizations" on public.organizations
    for select using (auth.role() = 'authenticated');

create policy "Admins can manage organizations" on public.organizations
    for all using (
        exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );

create policy "Authenticated users can select org settings" on public.org_settings
    for select using (auth.role() = 'authenticated');

create policy "Admins can manage org settings" on public.org_settings
    for all using (
        exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
