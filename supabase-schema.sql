create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  payment_method text not null,
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null default 0,
  modifiers jsonb not null default '{}'::jsonb,
  line_total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "POS can read products" on public.products;
create policy "POS can read products"
on public.products for select
to anon
using (true);

drop policy if exists "POS can write products" on public.products;
create policy "POS can write products"
on public.products for all
to anon
using (true)
with check (true);

drop policy if exists "POS can read orders" on public.orders;
create policy "POS can read orders"
on public.orders for select
to anon
using (true);

drop policy if exists "POS can write orders" on public.orders;
create policy "POS can write orders"
on public.orders for insert
to anon
with check (true);

drop policy if exists "POS can read order items" on public.order_items;
create policy "POS can read order items"
on public.order_items for select
to anon
using (true);

drop policy if exists "POS can write order items" on public.order_items;
create policy "POS can write order items"
on public.order_items for insert
to anon
with check (true);

insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "POS can read product photos" on storage.objects;
create policy "POS can read product photos"
on storage.objects for select
to anon
using (bucket_id = 'product-photos');

drop policy if exists "POS can upload product photos" on storage.objects;
create policy "POS can upload product photos"
on storage.objects for insert
to anon
with check (bucket_id = 'product-photos');

drop policy if exists "POS can update product photos" on storage.objects;
create policy "POS can update product photos"
on storage.objects for update
to anon
using (bucket_id = 'product-photos')
with check (bucket_id = 'product-photos');

drop policy if exists "POS can delete product photos" on storage.objects;
create policy "POS can delete product photos"
on storage.objects for delete
to anon
using (bucket_id = 'product-photos');
