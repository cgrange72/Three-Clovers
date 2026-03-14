-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users primary key,
  first_name text not null default '',
  last_name text not null default '',
  profile_pic text not null default '',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Create ratings table
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  location_name text not null,
  location_address text not null default '',
  location_id text not null default '',
  rating numeric(3,1) not null check (rating >= 0 and rating <= 10),
  caption text not null default '',
  price text not null default '',
  temperature text not null default '',
  head text not null default '',
  creaminess text not null default '',
  settling text not null default '',
  g_split boolean not null default false,
  images jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists idx_ratings_location on ratings(location_name);
create index if not exists idx_ratings_user on ratings(user_id);

-- Row-Level Security
alter table profiles enable row level security;
alter table ratings enable row level security;

-- Everyone can read all profiles and ratings
create policy "Public read profiles" on profiles for select using (true);
create policy "Public read ratings" on ratings for select using (true);

-- Users can update their own profile
create policy "Own profile update" on profiles for update using (auth.uid() = id);

-- Users can insert their own ratings
create policy "Own ratings insert" on ratings for insert with check (auth.uid() = user_id);
