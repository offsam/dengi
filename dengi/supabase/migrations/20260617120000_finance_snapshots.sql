-- Облачный снимок localStorage (карты, авто, дебет и т.д.)
-- Доступ только через API с service role; anon/authenticated не видят таблицу

create table public.finance_snapshots (
  sync_key uuid primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.finance_snapshots is 'Резервная копия данных приложения dengi (localStorage)';

create trigger finance_snapshots_set_updated_at
before update on public.finance_snapshots
for each row
execute function public.set_updated_at();

alter table public.finance_snapshots enable row level security;

revoke all on table public.finance_snapshots from anon, authenticated;
