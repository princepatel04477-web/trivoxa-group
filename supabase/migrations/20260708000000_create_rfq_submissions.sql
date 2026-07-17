create table if not exists public.rfq_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  company_name text not null,
  contact_name text not null,
  email text not null,
  whatsapp text not null,
  import_country text not null,
  destination_port text not null,
  industry_slug text,
  category_name text,
  hs_code text not null,
  quantity numeric not null,
  unit text not null,
  price_band text,
  incoterm text not null,
  delivery_start date not null,
  delivery_end date not null,
  sample_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists rfq_submissions_industry_slug_idx on public.rfq_submissions (industry_slug);
create index if not exists rfq_submissions_created_at_idx on public.rfq_submissions (created_at desc);

-- RLS enabled with no policies: only the service-role key (used server-side in
-- src/lib/supabase/server.ts, which bypasses RLS) can read or write this table.
alter table public.rfq_submissions enable row level security;
