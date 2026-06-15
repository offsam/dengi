-- dengi: начальная схема (users, households, wallets, transactions, categories)
-- Применить: Supabase SQL Editor или `supabase db push`

-- ---------------------------------------------------------------------------
-- users — профиль, связанный с auth.users
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email)
);

comment on table public.users is 'Профиль пользователя приложения';
comment on column public.users.display_name is 'Отображаемое имя в интерфейсе';

-- ---------------------------------------------------------------------------
-- households — семья / общий бюджет
-- ---------------------------------------------------------------------------
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index households_owner_id_idx on public.households (owner_id);

comment on table public.households is 'Общий финансовый контекст (семья, пара, личный бюджет)';

-- ---------------------------------------------------------------------------
-- wallets — счета / кошельки внутри household
-- ---------------------------------------------------------------------------
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  currency text not null default 'USD',
  balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallets_currency_len check (char_length(currency) = 3)
);

create index wallets_household_id_idx on public.wallets (household_id);

comment on table public.wallets is 'Счёт или кошелёк с балансом в заданной валюте';
comment on column public.wallets.currency is 'ISO 4217, например USD, EUR, RUB';

-- ---------------------------------------------------------------------------
-- categories — категории доходов и расходов
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now(),
  constraint categories_household_name_type_unique unique (household_id, name, type)
);

create index categories_household_id_idx on public.categories (household_id);

comment on table public.categories is 'Категории доходов и расходов для household';

-- ---------------------------------------------------------------------------
-- transactions — операции по кошелькам
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  user_id uuid not null references public.users (id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_wallet_id_idx on public.transactions (wallet_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_occurred_at_idx on public.transactions (occurred_at desc);

comment on table public.transactions is 'Финансовая операция: доход или расход по кошельку';

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger households_set_updated_at
before update on public.households
for each row
execute function public.set_updated_at();

create trigger wallets_set_updated_at
before update on public.wallets
for each row
execute function public.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- авто-создание public.users при регистрации в Auth
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- RLS: доступ к данным household только владельцу (owner_id)
-- ---------------------------------------------------------------------------
create or replace function public.is_household_owner(target_household_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.households h
    where h.id = target_household_id
      and h.owner_id = auth.uid()
  );
$$;

create or replace function public.owns_wallet(target_wallet_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.wallets w
    join public.households h on h.id = w.household_id
    where w.id = target_wallet_id
      and h.owner_id = auth.uid()
  );
$$;

alter table public.users enable row level security;
alter table public.households enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- users
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- households
create policy "Owners can read own households"
on public.households
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create households they own"
on public.households
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owners can update own households"
on public.households
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can delete own households"
on public.households
for delete
to authenticated
using (owner_id = auth.uid());

-- wallets
create policy "Owners can read household wallets"
on public.wallets
for select
to authenticated
using (public.is_household_owner(household_id));

create policy "Owners can insert household wallets"
on public.wallets
for insert
to authenticated
with check (public.is_household_owner(household_id));

create policy "Owners can update household wallets"
on public.wallets
for update
to authenticated
using (public.is_household_owner(household_id))
with check (public.is_household_owner(household_id));

create policy "Owners can delete household wallets"
on public.wallets
for delete
to authenticated
using (public.is_household_owner(household_id));

-- categories
create policy "Owners can read household categories"
on public.categories
for select
to authenticated
using (public.is_household_owner(household_id));

create policy "Owners can insert household categories"
on public.categories
for insert
to authenticated
with check (public.is_household_owner(household_id));

create policy "Owners can update household categories"
on public.categories
for update
to authenticated
using (public.is_household_owner(household_id))
with check (public.is_household_owner(household_id));

create policy "Owners can delete household categories"
on public.categories
for delete
to authenticated
using (public.is_household_owner(household_id));

-- transactions
create policy "Owners can read wallet transactions"
on public.transactions
for select
to authenticated
using (public.owns_wallet(wallet_id));

create policy "Owners can insert wallet transactions"
on public.transactions
for insert
to authenticated
with check (
  public.owns_wallet(wallet_id)
  and user_id = auth.uid()
);

create policy "Owners can update wallet transactions"
on public.transactions
for update
to authenticated
using (public.owns_wallet(wallet_id))
with check (
  public.owns_wallet(wallet_id)
  and user_id = auth.uid()
);

create policy "Owners can delete wallet transactions"
on public.transactions
for delete
to authenticated
using (public.owns_wallet(wallet_id));

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.households to authenticated;
grant select, insert, update, delete on public.wallets to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
