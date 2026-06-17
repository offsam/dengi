-- service_role должен писать снимки через API (PostgREST)
grant all on table public.finance_snapshots to service_role;
