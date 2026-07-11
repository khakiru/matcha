create table if not exists public.app_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists "POS can read app settings" on public.app_settings;
create policy "POS can read app settings"
on public.app_settings for select
to anon
using (true);

drop policy if exists "POS can write app settings" on public.app_settings;
create policy "POS can write app settings"
on public.app_settings for all
to anon
using (true)
with check (true);
