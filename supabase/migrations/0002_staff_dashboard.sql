-- =====================================================================================
-- Canvas O Coffee: owner / staff dashboard layer (run AFTER 0001_init.sql)
--
-- Access model
--   * anon (website visitors): no table access to customer data, ever. They can only call
--     the public functions from 0001 and read the public menu (names, prices, sold-out flag).
--   * authenticated users are NOT trusted by default: being logged in is not enough.
--     Every policy below also requires a row in public.staff (added by the owner in SQL).
--   * Staff can read orders and requests and change only their status fields; they
--     cannot create, delete, re-price or re-address anything through the API.
--   * The owner adds or removes staff with SQL in the Supabase dashboard (see bottom).
-- =====================================================================================

-- ---------- Staff accounts ----------
create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  display_name text check (char_length(display_name) <= 60),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;
revoke all on public.staff from anon, authenticated;
grant select on public.staff to authenticated;

drop policy if exists "staff can see their own staff row" on public.staff;
create policy "staff can see their own staff row" on public.staff
  for select to authenticated using (user_id = auth.uid());

-- Helpers used by the policies. SECURITY DEFINER so they can read public.staff.
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'owner');
$$;

-- ---------- Audit columns ----------
alter table public.orders add column if not exists updated_by uuid;
alter table public.reservations add column if not exists updated_by uuid;
alter table public.occasion_enquiries add column if not exists updated_by uuid;
alter table public.customer_messages add column if not exists read_at timestamptz;
alter table public.menu_products add column if not exists updated_at timestamptz not null default now();

create or replace function public.stamp_staff_update() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists orders_touch on public.orders;
drop trigger if exists orders_stamp on public.orders;
create trigger orders_stamp before update on public.orders for each row execute function public.stamp_staff_update();
drop trigger if exists reservations_touch on public.reservations;
drop trigger if exists reservations_stamp on public.reservations;
create trigger reservations_stamp before update on public.reservations for each row execute function public.stamp_staff_update();
drop trigger if exists enquiries_touch on public.occasion_enquiries;
drop trigger if exists enquiries_stamp on public.occasion_enquiries;
create trigger enquiries_stamp before update on public.occasion_enquiries for each row execute function public.stamp_staff_update();
drop trigger if exists menu_touch on public.menu_products;
create trigger menu_touch before update on public.menu_products for each row execute function public.touch_updated_at();

-- ---------- Orders: staff read all, change only status / payment ----------
grant select on public.orders to authenticated;
grant update (status, payment_status) on public.orders to authenticated;
drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
drop policy if exists "staff update order status" on public.orders;
create policy "staff update order status" on public.orders for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Table requests ----------
grant select on public.reservations to authenticated;
grant update (status) on public.reservations to authenticated;
drop policy if exists "staff read reservations" on public.reservations;
create policy "staff read reservations" on public.reservations for select to authenticated using (public.is_staff());
drop policy if exists "staff update reservation status" on public.reservations;
create policy "staff update reservation status" on public.reservations for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Occasion enquiries ----------
grant select on public.occasion_enquiries to authenticated;
grant update (status) on public.occasion_enquiries to authenticated;
drop policy if exists "staff read enquiries" on public.occasion_enquiries;
create policy "staff read enquiries" on public.occasion_enquiries for select to authenticated using (public.is_staff());
drop policy if exists "staff update enquiry status" on public.occasion_enquiries;
create policy "staff update enquiry status" on public.occasion_enquiries for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Whisper Box ----------
grant select on public.customer_messages to authenticated;
grant update (read_at) on public.customer_messages to authenticated;
drop policy if exists "staff read messages" on public.customer_messages;
create policy "staff read messages" on public.customer_messages for select to authenticated using (public.is_staff());
drop policy if exists "staff mark messages read" on public.customer_messages;
create policy "staff mark messages read" on public.customer_messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Menu: public can read (it is the public menu); staff toggle sold out ----------
grant select on public.menu_products, public.menu_variants, public.menu_add_ons to anon, authenticated;
grant update (available) on public.menu_products to authenticated;
drop policy if exists "anyone reads the menu" on public.menu_products;
create policy "anyone reads the menu" on public.menu_products for select to anon, authenticated using (true);
drop policy if exists "anyone reads variants" on public.menu_variants;
create policy "anyone reads variants" on public.menu_variants for select to anon, authenticated using (true);
drop policy if exists "anyone reads add-ons" on public.menu_add_ons;
create policy "anyone reads add-ons" on public.menu_add_ons for select to anon, authenticated using (true);
drop policy if exists "staff toggle availability" on public.menu_products;
create policy "staff toggle availability" on public.menu_products for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Today's summary (India time) ----------
create or replace function public.dashboard_summary() returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if not public.is_staff() then
    raise exception 'not_staff';
  end if;
  return (
    select json_build_object(
      'date', v_today,
      'orders_today', count(*) filter (where (o.created_at at time zone 'Asia/Kolkata')::date = v_today and o.status <> 'cancelled'),
      'sales_today', coalesce(sum(o.total) filter (where (o.created_at at time zone 'Asia/Kolkata')::date = v_today
                                                   and o.status in ('confirmed', 'preparing', 'dispatched', 'completed')), 0),
      'completed_today', count(*) filter (where (o.created_at at time zone 'Asia/Kolkata')::date = v_today and o.status = 'completed'),
      'cancelled_today', count(*) filter (where (o.created_at at time zone 'Asia/Kolkata')::date = v_today and o.status = 'cancelled'),
      'pending_orders', count(*) filter (where o.status = 'pending'),
      'active_orders', count(*) filter (where o.status in ('confirmed', 'preparing', 'dispatched')),
      'reservations_today', (select count(*) from public.reservations r where r.reservation_date = v_today and r.status in ('pending', 'confirmed')),
      'pending_reservations', (select count(*) from public.reservations r where r.status = 'pending' and r.reservation_date >= v_today),
      'pending_enquiries', (select count(*) from public.occasion_enquiries e where e.status = 'pending'),
      'unread_messages', (select count(*) from public.customer_messages m where m.read_at is null),
      'sold_out_items', (select count(*) from public.menu_products p where not p.available)
    )
    from public.orders o
  );
end $$;

revoke execute on function public.is_staff(), public.is_owner(), public.dashboard_summary(), public.stamp_staff_update() from public, anon;
grant execute on function public.is_staff(), public.is_owner(), public.dashboard_summary() to authenticated;

-- ---------- Live updates for the dashboard (Supabase Realtime respects the policies above) ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.orders, public.reservations, public.occasion_enquiries, public.customer_messages, public.menu_products;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- =====================================================================================
-- Adding the owner (run once, after creating the login in Authentication → Users):
--
--   insert into public.staff (user_id, role, display_name)
--   select id, 'owner', 'Owner' from auth.users where email = 'OWNER-EMAIL-HERE'
--   on conflict (user_id) do update set role = 'owner';
--
-- Adding a staff member later: same, with role 'staff'. Removing one:
--   delete from public.staff where user_id = (select id from auth.users where email = '...');
-- =====================================================================================
