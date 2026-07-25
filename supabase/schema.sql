create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null,
  order_date date not null default (timezone('America/Fortaleza', now())::date),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 10 and 24),
  order_type text not null check (order_type in ('delivery', 'pickup')),
  address text check (address is null or char_length(address) <= 280),
  payment_method text not null check (payment_method in ('Pix', 'Cartão', 'Dinheiro')),
  change_for text check (change_for is null or char_length(change_for) <= 30),
  notes text check (notes is null or char_length(notes) <= 300),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  constraint delivery_requires_address check (
    order_type <> 'delivery' or nullif(trim(address), '') is not null
  )
);

-- Migração de instalações anteriores, que usavam uma identidade global.
alter table public.orders
  add column if not exists order_date date;

update public.orders
set order_date = timezone('America/Fortaleza', created_at)::date
where order_date is null;

alter table public.orders
  alter column order_date
    set default (timezone('America/Fortaleza', now())::date),
  alter column order_date set not null;

alter table public.orders
  alter column order_number drop identity if exists;

alter table public.orders
  drop constraint if exists orders_order_number_key;

create unique index if not exists orders_order_date_number_idx
  on public.orders (order_date, order_number);

create table if not exists public.order_daily_sequences (
  order_date date primary key,
  last_number bigint not null check (last_number > 0)
);

-- Mantém intactos os números já emitidos e inicia as sequências das datas existentes
-- acima do maior número armazenado. Em cada nova data, a contagem começa em 1.
insert into public.order_daily_sequences (order_date, last_number)
select order_date, max(order_number)
from public.orders
group by order_date
on conflict (order_date) do nothing;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null check (char_length(product_name) between 1 and 160),
  quantity integer not null check (quantity > 0 and quantity <= 99),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  notes text check (notes is null or char_length(notes) <= 600),
  total_price numeric(10, 2) not null check (total_price >= 0)
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

alter table public.orders
  drop constraint if exists orders_address_check;

alter table public.orders
  add constraint orders_address_check
  check (address is null or char_length(address) <= 280);

alter table public.order_items
  drop constraint if exists order_items_notes_check;

alter table public.order_items
  add constraint order_items_notes_check
  check (notes is null or char_length(notes) <= 600);

alter table public.orders enable row level security;
alter table public.order_daily_sequences enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_daily_sequences from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_date date;
  v_order_number bigint;
  v_subtotal numeric(10, 2);
  v_delivery_fee numeric(10, 2);
begin
  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
  then
    raise exception 'O pedido precisa ter pelo menos um item.';
  end if;

  select coalesce(
    sum(
      greatest((item ->> 'quantity')::integer, 1)
      * greatest((item ->> 'unit_price')::numeric, 0)
    ),
    0
  )
  into v_subtotal
  from jsonb_array_elements(p_items) as item;

  v_delivery_fee := greatest(coalesce((p_order ->> 'delivery_fee')::numeric, 0), 0);
  v_order_date := timezone('America/Fortaleza', now())::date;

  insert into public.order_daily_sequences (order_date, last_number)
  values (v_order_date, 1)
  on conflict (order_date) do update
    set last_number = public.order_daily_sequences.last_number + 1
  returning last_number into v_order_number;

  insert into public.orders (
    order_number,
    order_date,
    customer_name,
    customer_phone,
    order_type,
    address,
    payment_method,
    change_for,
    notes,
    subtotal,
    delivery_fee,
    total
  )
  values (
    v_order_number,
    v_order_date,
    trim(p_order ->> 'customer_name'),
    trim(p_order ->> 'customer_phone'),
    p_order ->> 'order_type',
    nullif(trim(p_order ->> 'address'), ''),
    p_order ->> 'payment_method',
    nullif(trim(p_order ->> 'change_for'), ''),
    nullif(trim(p_order ->> 'notes'), ''),
    v_subtotal,
    v_delivery_fee,
    v_subtotal + v_delivery_fee
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_name,
    quantity,
    unit_price,
    notes,
    total_price
  )
  select
    v_order_id,
    trim(item ->> 'product_name'),
    (item ->> 'quantity')::integer,
    (item ->> 'unit_price')::numeric,
    nullif(trim(item ->> 'notes'), ''),
    (item ->> 'quantity')::integer * (item ->> 'unit_price')::numeric
  from jsonb_array_elements(p_items) as item;

  return v_order_number;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

comment on function public.create_order(jsonb, jsonb) is
  'Registra pedido e itens em uma única transação e retorna o número do pedido.';
