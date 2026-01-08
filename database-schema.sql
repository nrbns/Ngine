-- NGINE v0.1 Database Schema
-- Run this in Supabase SQL Editor

-- User profiles with identity
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  identity text default 'You are becoming consistent',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Goals/resolutions
create table resolutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  mdd text not null, -- Minimum Daily Discipline
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Daily check-ins
create table checkins (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid references resolutions(id) on delete cascade,
  date date not null,
  execution text not null check (execution in ('yes', 'partial', 'no')),
  energy int not null check (energy >= 1 and energy <= 5),
  created_at timestamp default now(),
  unique(resolution_id, date) -- One check-in per goal per day
);

-- Goal proofs/gallery
create table goal_proofs (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid references resolutions(id) on delete cascade,
  image_url text not null,
  created_at timestamp default now()
);

-- Indexes for performance
create index idx_resolutions_user_id on resolutions(user_id);
create index idx_checkins_resolution_id on checkins(resolution_id);
create index idx_checkins_date on checkins(date);
create index idx_goal_proofs_resolution_id on goal_proofs(resolution_id);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table resolutions enable row level security;
alter table checkins enable row level security;
alter table goal_proofs enable row level security;

-- RLS Policies
create policy "Users can view own profiles" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profiles" on profiles
  for update using (auth.uid() = id);

create policy "Users can view own resolutions" on resolutions
  for select using (auth.uid() = user_id);

create policy "Users can create own resolutions" on resolutions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own resolutions" on resolutions
  for update using (auth.uid() = user_id);

create policy "Users can view own checkins" on checkins
  for select using (
    exists (
      select 1 from resolutions
      where resolutions.id = checkins.resolution_id
      and resolutions.user_id = auth.uid()
    )
  );

create policy "Users can create own checkins" on checkins
  for insert with check (
    exists (
      select 1 from resolutions
      where resolutions.id = checkins.resolution_id
      and resolutions.user_id = auth.uid()
    )
  );

create policy "Users can view own proofs" on goal_proofs
  for select using (
    exists (
      select 1 from resolutions
      where resolutions.id = goal_proofs.resolution_id
      and resolutions.user_id = auth.uid()
    )
  );

create policy "Users can create own proofs" on goal_proofs
  for insert with check (
    exists (
      select 1 from resolutions
      where resolutions.id = goal_proofs.resolution_id
      and resolutions.user_id = auth.uid()
    )
  );
