-- Run this in Supabase SQL Editor

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  images text[] default '{}',
  category text references categories(slug),
  stock integer default 0,
  featured boolean default false,
  active boolean default true,
  brand text,
  flavor text,
  weight text,
  created_at timestamptz default now()
);

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- Allow public read
create policy "Public read images" on storage.objects
  for select using (bucket_id = 'products');

-- Allow authenticated upload (admin)
create policy "Admin upload images" on storage.objects
  for insert with check (bucket_id = 'products');

create policy "Admin delete images" on storage.objects
  for delete using (bucket_id = 'products');

-- Seed categories
insert into categories (name, slug) values
  ('Proteínas', 'proteinas'),
  ('Creatina', 'creatina'),
  ('Pre-Workout', 'pre-workout'),
  ('Vitaminas', 'vitaminas'),
  ('Quemadores', 'quemadores'),
  ('Aminoácidos', 'aminoacidos'),
  ('Otros', 'otros');
