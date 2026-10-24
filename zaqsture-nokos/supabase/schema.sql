-- Jalankan di Supabase SQL Editor sebelum deploy.
create extension if not exists pgcrypto;
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  email text unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider_order_id text,
  service text not null,
  phone_number text,
  status text not null default 'pending',
  price numeric(12,2) not null default 0,
  provider_cost numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 500,
  provider_response jsonb,
  admin_note text,
  created_at timestamptz not null default now()
);
alter table public.users enable row level security;
alter table public.orders enable row level security;
-- Akses database dari route server memakai service-role key yang hanya disimpan di environment server.
-- Jangan masukkan SUPABASE_SERVICE_ROLE_KEY ke variabel NEXT_PUBLIC_*.

-- Tambahkan kolom pemilik pesanan bila tabel orders sudah ada dari versi sebelumnya.
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Kolom margin keuntungan untuk project yang tabel orders-nya sudah ada.
alter table public.orders add column if not exists provider_cost numeric(12,2) not null default 0;
alter table public.orders add column if not exists profit numeric(12,2) not null default 0;
-- Order lama: harga yang tersimpan sebelumnya adalah biaya provider, bukan harga jual.
-- Tandai profit historis sebagai 0 agar laporan baru tidak mengklaim keuntungan masa lalu.
update public.orders set provider_cost = price, profit = 0 where provider_cost = 0 and profit = 500;
alter table public.orders alter column profit set default 500;
