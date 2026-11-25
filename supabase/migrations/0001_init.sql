-- =====================================================================================
-- Canvas O Coffee: database schema, security and server-side functions (Supabase)
--
-- Security model
--   * Every table has row-level security ON and NO policies for anon/authenticated,
--     so the public (anon) key cannot read or write any table directly.
--   * The website calls only the SECURITY DEFINER functions below. They validate
--     every input, apply rate limits, and recompute all prices from menu tables.
--     The client never decides a price.
--   * Café staff manage orders and requests in the Supabase dashboard (Table Editor),
--     which uses the service role. The service-role key is never used in the website.
-- =====================================================================================

-- ---------- Menu (seeded from src/data/menu.ts via `npm run db:seed`) ----------
create table if not exists public.menu_products (
  id text primary key,
  name text not null,
  category_id text not null,
  price integer check (price > 0),          -- null when the product has variants
  available boolean not null default true
);

create table if not exists public.menu_variants (
  product_id text not null references public.menu_products (id) on delete cascade,
  id text not null,
  label text not null,
  price integer not null check (price > 0),
  primary key (product_id, id)
);

create table if not exists public.menu_add_ons (
  id text primary key,
  name text not null,
  price integer not null check (price > 0),
  category_id text not null
);

-- ---------- Status types ----------
do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('pending', 'confirmed', 'declined', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  address text not null check (char_length(address) between 10 and 300),
  instructions text check (char_length(instructions) <= 300),
  items jsonb not null,                      -- server-priced snapshot of each line
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_phone_created_idx on public.orders (phone, created_at desc);

-- ---------- Reservations ----------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size between 1 and 50),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  email text check (char_length(email) <= 160),
  requests text check (char_length(requests) <= 400),
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_date_idx on public.reservations (reservation_date, reservation_time);

-- ---------- Occasion enquiries ----------
create table if not exists public.occasion_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  email text check (char_length(email) <= 160),
  occasion text not null check (occasion in ('Birthday', 'Small celebration', 'Group visit', 'Other')),
  preferred_date date,
  group_size integer not null check (group_size between 1 and 200),
  message text check (char_length(message) <= 800),
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Whisper Box messages ----------
create table if not exists public.customer_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 3 and 600),
  name text check (char_length(name) <= 80),
  contact text check (char_length(contact) <= 120),
  created_at timestamptz not null default now()
);

-- ---------- Row-level security: on, with no public policies ----------
alter table public.menu_products enable row level security;
alter table public.menu_variants enable row level security;
alter table public.menu_add_ons enable row level security;
alter table public.orders enable row level security;
alter table public.reservations enable row level security;
alter table public.occasion_enquiries enable row level security;
alter table public.customer_messages enable row level security;

revoke all on public.menu_products, public.menu_variants, public.menu_add_ons, public.orders,
  public.reservations, public.occasion_enquiries, public.customer_messages from anon, authenticated;

-- ---------- Helpers ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
drop trigger if exists reservations_touch on public.reservations;
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();
drop trigger if exists enquiries_touch on public.occasion_enquiries;
create trigger enquiries_touch before update on public.occasion_enquiries for each row execute function public.touch_updated_at();

create or replace function public.new_reference(prefix text) returns text language sql volatile as $$
  select prefix || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

-- The café is in India: "today" is evaluated in Indian Standard Time.
create or replace function public.cafe_now() returns timestamp language sql stable as $$
  select (now() at time zone 'Asia/Kolkata');
$$;

-- =====================================================================================
-- place_order: validates the request and computes every price on the server.
-- =====================================================================================
create or replace function public.place_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_instructions text,
  p_items jsonb
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_product public.menu_products;
  v_has_variants boolean;
  v_unit integer;
  v_addon_price integer;
  v_addon text;
  v_qty integer;
  v_subtotal integer := 0;
  v_lines jsonb := '[]'::jsonb;
  v_fee integer;
  v_ref text;
begin
  if p_customer_name is null or char_length(btrim(p_customer_name)) < 2 or char_length(p_customer_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if p_phone is null or p_phone !~ '^[0-9]{10}$' then
    raise exception 'invalid_phone';
  end if;
  if p_address is null or char_length(btrim(p_address)) < 10 or char_length(p_address) > 300 then
    raise exception 'invalid_address';
  end if;
  if p_instructions is not null and char_length(p_instructions) > 300 then
    raise exception 'invalid_address';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;
  if jsonb_array_length(p_items) > 60 then
    raise exception 'invalid_items';
  end if;

  -- Rate limit: at most 3 orders per phone number in 10 minutes.
  if (select count(*) from public.orders where phone = p_phone and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'rate_limited';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.menu_products where id = item ->> 'product_id' and available;
    if not found then
      raise exception 'invalid_items';
    end if;

    begin
      v_qty := (item ->> 'quantity')::integer;
    exception when others then
      raise exception 'invalid_items';
    end;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'invalid_items';
    end if;

    select exists (select 1 from public.menu_variants where product_id = v_product.id) into v_has_variants;
    if v_has_variants then
      select price into v_unit from public.menu_variants where product_id = v_product.id and id = item ->> 'variant_id';
      if not found then
        raise exception 'invalid_items';
      end if;
    else
      if item ->> 'variant_id' is not null then
        raise exception 'invalid_items';
      end if;
      v_unit := v_product.price;
    end if;

    if item ? 'add_on_ids' and jsonb_typeof(item -> 'add_on_ids') = 'array' then
      for v_addon in select distinct x from jsonb_array_elements_text(item -> 'add_on_ids') as x loop
        select price into v_addon_price from public.menu_add_ons where id = v_addon and category_id = v_product.category_id;
        if not found then
          raise exception 'invalid_items';
        end if;
        v_unit := v_unit + v_addon_price;
      end loop;
    end if;

    v_subtotal := v_subtotal + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'variant_id', item ->> 'variant_id',
      'add_on_ids', coalesce(item -> 'add_on_ids', '[]'::jsonb),
      'quantity', v_qty,
      'unit_price', v_unit,
      'line_total', v_unit * v_qty
    );
  end loop;

  -- Supplied rule: free delivery strictly ABOVE ₹500; otherwise ₹25. (₹500 exactly pays ₹25.)
  v_fee := case when v_subtotal > 500 then 0 else 25 end;
  v_ref := public.new_reference('CO');

  insert into public.orders (reference, customer_name, phone, address, instructions, items, subtotal, delivery_fee, total)
  values (v_ref, btrim(p_customer_name), p_phone, btrim(p_address), nullif(btrim(p_instructions), ''), v_lines, v_subtotal, v_fee, v_subtotal + v_fee);

  return json_build_object('reference', v_ref, 'status', 'pending', 'subtotal', v_subtotal, 'delivery_fee', v_fee, 'total', v_subtotal + v_fee);
end $$;

-- Status lookup needs both the reference and the phone number used for the order.
create or replace function public.get_order_status(p_reference text, p_phone text) returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object('reference', reference, 'status', status, 'updated_at', updated_at)
  from public.orders
  where reference = upper(btrim(p_reference)) and phone = p_phone
  limit 1;
$$;

-- =====================================================================================
-- request_reservation: a REQUEST only. Staff confirm or decline it in the dashboard.
-- =====================================================================================
create or replace function public.request_reservation(
  p_date date,
  p_time time,
  p_party_size integer,
  p_name text,
  p_phone text,
  p_email text,
  p_requests text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamp := public.cafe_now();
  v_ref text;
begin
  if p_date is null or p_date < v_now::date or p_date > v_now::date + 60 then
    raise exception 'invalid_date';
  end if;
  -- Opening hours: 5 pm to 10 pm (keep in sync with site.hours in src/config/site.ts).
  if p_time is null or p_time < time '17:00' or p_time >= time '22:00' or (p_date = v_now::date and p_time <= v_now::time) then
    raise exception 'invalid_time';
  end if;
  if p_party_size is null or p_party_size < 1 or p_party_size > 10 then
    raise exception 'invalid_party_size';
  end if;
  if p_name is null or char_length(btrim(p_name)) < 2 or char_length(p_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if p_phone is null or p_phone !~ '^[0-9]{10}$' then
    raise exception 'invalid_phone';
  end if;
  if p_email is not null and (char_length(p_email) > 160 or p_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$') then
    raise exception 'invalid_message';
  end if;
  if p_requests is not null and char_length(p_requests) > 400 then
    raise exception 'invalid_message';
  end if;
  if (select count(*) from public.reservations where phone = p_phone and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited';
  end if;

  v_ref := public.new_reference('RS');
  insert into public.reservations (reference, reservation_date, reservation_time, party_size, customer_name, phone, email, requests)
  values (v_ref, p_date, p_time, p_party_size, btrim(p_name), p_phone, nullif(btrim(p_email), ''), nullif(btrim(p_requests), ''));
  return json_build_object('reference', v_ref, 'status', 'pending');
end $$;

-- =====================================================================================
-- send_occasion_enquiry: an enquiry, never a booking.
-- =====================================================================================
create or replace function public.send_occasion_enquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_occasion text,
  p_preferred_date date,
  p_group_size integer,
  p_message text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref text;
begin
  if p_name is null or char_length(btrim(p_name)) < 2 or char_length(p_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if p_phone is null or p_phone !~ '^[0-9]{10}$' then
    raise exception 'invalid_phone';
  end if;
  if p_occasion not in ('Birthday', 'Small celebration', 'Group visit', 'Other') then
    raise exception 'invalid_message';
  end if;
  if p_preferred_date is not null and p_preferred_date < public.cafe_now()::date then
    raise exception 'invalid_date';
  end if;
  if p_group_size is null or p_group_size < 1 or p_group_size > 200 then
    raise exception 'invalid_party_size';
  end if;
  if (p_email is not null and char_length(p_email) > 160) or (p_message is not null and char_length(p_message) > 800) then
    raise exception 'invalid_message';
  end if;
  if (select count(*) from public.occasion_enquiries where phone = p_phone and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited';
  end if;

  v_ref := public.new_reference('EQ');
  insert into public.occasion_enquiries (reference, customer_name, phone, email, occasion, preferred_date, group_size, message)
  values (v_ref, btrim(p_name), p_phone, nullif(btrim(p_email), ''), p_occasion, p_preferred_date, p_group_size, nullif(btrim(p_message), ''));
  return json_build_object('reference', v_ref, 'status', 'pending');
end $$;

-- =====================================================================================
-- leave_message: Whisper Box.
-- =====================================================================================
create or replace function public.leave_message(p_message text, p_name text, p_contact text) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_message is null or char_length(btrim(p_message)) < 3 or char_length(p_message) > 600 then
    raise exception 'invalid_message';
  end if;
  if (p_name is not null and char_length(p_name) > 80) or (p_contact is not null and char_length(p_contact) > 120) then
    raise exception 'invalid_message';
  end if;
  -- Global flood guard (messages carry no required identity).
  if (select count(*) from public.customer_messages where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'rate_limited';
  end if;
  insert into public.customer_messages (message, name, contact)
  values (btrim(p_message), nullif(btrim(p_name), ''), nullif(btrim(p_contact), ''));
  return json_build_object('received', true);
end $$;

-- ---------- Function permissions: only the public RPCs are callable ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.get_order_status(text, text) to anon, authenticated;
grant execute on function public.request_reservation(date, time, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.send_occasion_enquiry(text, text, text, text, date, integer, text) to anon, authenticated;
grant execute on function public.leave_message(text, text, text) to anon, authenticated;
