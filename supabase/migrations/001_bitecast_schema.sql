/* Bitecast MVP Schema */

-- Profiles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  species_prefs jsonb default '{}',
  home_lat numeric,
  home_lng numeric,
  skill_level text default 'beginner',
  updated_at timestamptz default now()
);

-- Fishing Spots
create table if not exists fishing_spots (
  id bigserial primary key,
  name text not null,
  lat numeric not null,
  lng numeric not null,
  description text,
  created_at timestamptz default now()
);

-- GIST index for geo queries
create index if not exists idx_spots_coords on fishing_spots using gist(ll_to_earth(lat, lng));

-- Bite Predictions
create table if not exists bite_predictions (
  id bigserial primary key,
  spot_id bigint references fishing_spots(id),
  timestamp timestamptz default now(),
  bite_index numeric check (bite_index between 0 and 10),
  recommended_bait text,
  weather_factors jsonb
);

create index if not exists idx_predictions_spot_time on bite_predictions(spot_id, timestamp desc);

-- User Catches
create table if not exists user_catches (
  id bigserial primary key,
  user_id uuid references profiles(id),
  spot_id bigint references fishing_spots(id),
  species text,
  photo_url text,
  catch_weight numeric,
  timestamp timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Public profiles readable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

alter table fishing_spots enable row level security;
create policy "Public spots readable" on fishing_spots for all using (true);

alter table bite_predictions enable row level security;
create policy "Public predictions readable" on bite_predictions for select using (true);

alter table user_catches enable row level security;
create policy "User catches readable" on user_catches for all using (auth.uid() = user_id);