create table if not exists public.louge_store (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.louge_store enable row level security;

create index if not exists louge_store_updated_at_idx
on public.louge_store(updated_at desc);
