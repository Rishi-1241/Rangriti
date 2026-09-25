-- Reference schema for the existing `products` table (already provisioned).
-- Kept for documentation / fresh environments. images[1] (SQL is 1-based) is the primary image.
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  category       text not null,
  fabric         text,
  description    text,
  sizes          text[] not null default '{}',
  price          numeric,
  currency       text not null default 'INR',
  free_shipping  boolean not null default false,
  ready_to_ship  boolean not null default false,
  images         text[] not null default '{}',
  raw_input      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.products enable row level security;
-- No policies on purpose: only the server (secret key) can read or write.
