-- Access-control and order-flow checks for the dashboard layer.
-- Run after: local_supabase_shim.sql (local only), 0001_init.sql, 0002_staff_dashboard.sql, seed.sql.
-- Every check raises on failure; success prints "ALL RLS CHECKS PASSED".
reset role;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'stranger@test.local')
on conflict do nothing;
insert into public.staff (user_id, role, display_name)
values ('00000000-0000-0000-0000-00000000000a', 'owner', 'Owner')
on conflict (user_id) do nothing;
create temporary table t (k text primary key, v text);
grant all on t to anon, authenticated;

-- 1) Customer (anon) places an order; a retry with the same client_ref is not duplicated.
set role anon;
do $$
declare r json; r2 json;
begin
  r := public.place_order('Asha Roy', '9100000001', 'College Road, Belda', null,
        '[{"product_id":"veg-momo","variant_id":"pan-fried","quantity":2,"add_on_ids":[]}]', 'aaaaaaaa-0000-0000-0000-000000000001');
  assert r->>'status' = 'pending' and (r->>'total')::int = 205, 'order placed: ' || r;
  assert length(r->>'reference') = 11, 'reference CO-XXXXXXXX';
  r2 := public.place_order('Asha Roy', '9100000001', 'College Road, Belda', null,
        '[{"product_id":"veg-momo","variant_id":"pan-fried","quantity":2,"add_on_ids":[]}]', 'aaaaaaaa-0000-0000-0000-000000000001');
  assert r2->>'reference' = r->>'reference' and r2->>'tracking_token' = r->>'tracking_token', 'retry returns the same order';
  insert into t values ('token', r->>'tracking_token'), ('ref', r->>'reference');

  -- 2) Customer tracks only via the secret token; no phone or address is returned.
  r2 := public.get_order_by_token((select v from t where k = 'token')::uuid);
  assert r2->>'status' = 'pending' and r2->>'reference' = r->>'reference', 'tracking works';
  assert r2::jsonb ? 'phone' = false and r2::jsonb ? 'address' = false and r2::jsonb ? 'customer_name' = false, 'no personal data in tracking';
  assert (r2->'items'->0->>'variant_label') = 'Pan Fried', 'readable line items';
  assert public.get_order_by_token(gen_random_uuid()) is null, 'unknown token finds nothing';

  -- 3) Visitors cannot read any table with customer data.
  begin perform count(*) from public.orders; raise exception 'FAIL anon read orders'; exception when insufficient_privilege then null; end;
  begin perform count(*) from public.reservations; raise exception 'FAIL anon read reservations'; exception when insufficient_privilege then null; end;
  begin perform count(*) from public.customer_messages; raise exception 'FAIL anon read messages'; exception when insufficient_privilege then null; end;
  begin perform count(*) from public.staff; raise exception 'FAIL anon read staff'; exception when insufficient_privilege then null; end;
  begin perform public.dashboard_summary(); raise exception 'FAIL anon summary'; exception when insufficient_privilege then null; end;
  begin update public.menu_products set available = false; raise exception 'FAIL anon toggle menu'; exception when insufficient_privilege then null; end;
  -- ...but can read the public menu.
  assert (select count(*) from public.menu_products) = 55, 'public menu readable';
end $$;

-- 4) A logged-in account that is NOT staff sees nothing and changes nothing.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
do $$
declare n int;
begin
  assert (select count(*) from public.orders) = 0, 'stranger sees no orders';
  assert (select count(*) from public.reservations) = 0, 'stranger sees no reservations';
  assert (select count(*) from public.customer_messages) = 0, 'stranger sees no messages';
  assert (select count(*) from public.staff) = 0, 'stranger sees no staff rows';
  update public.orders set status = 'cancelled'; get diagnostics n = row_count;
  assert n = 0, 'stranger cannot update orders';
  update public.menu_products set available = false; get diagnostics n = row_count;
  assert n = 0, 'stranger cannot mark items sold out';
  begin perform public.dashboard_summary(); raise exception 'FAIL stranger summary'; exception when others then assert sqlerrm = 'not_staff', sqlerrm; end;
end $$;

-- 5) The owner sees the order, moves it through statuses, and cannot tamper with prices or delete.
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$
declare n int; s json;
begin
  assert (select count(*) from public.orders) = 1, 'owner sees the order';
  assert (select is_owner from (select public.is_owner()) x(is_owner)), 'owner role';
  s := public.dashboard_summary();
  assert (s->>'pending_orders')::int = 1 and (s->>'orders_today')::int = 1 and (s->>'sales_today')::int = 0, 'summary before confirming: ' || s;
  update public.orders set status = 'confirmed' where reference = (select v from t where k = 'ref'); get diagnostics n = row_count;
  assert n = 1, 'owner confirms';
  assert (select updated_by from public.orders limit 1) = '00000000-0000-0000-0000-00000000000a', 'who changed it is recorded';
  s := public.dashboard_summary();
  assert (s->>'sales_today')::int = 205 and (s->>'pending_orders')::int = 0, 'confirmed order counts as a sale: ' || s;
  begin update public.orders set total = 1; raise exception 'FAIL owner changed price'; exception when insufficient_privilege then null; end;
  begin update public.orders set address = 'x'; raise exception 'FAIL owner changed address'; exception when insufficient_privilege then null; end;
  begin delete from public.orders; raise exception 'FAIL owner deleted'; exception when insufficient_privilege then null; end;
  begin insert into public.orders (reference, customer_name, phone, address, items, subtotal, delivery_fee, total) values ('X','Xx','9000000000','1234567890','[]',1,0,1); raise exception 'FAIL owner inserted'; exception when insufficient_privilege then null; end;
  -- Sold-out switch
  update public.menu_products set available = false where id = 'chicken-momo'; get diagnostics n = row_count;
  assert n = 1, 'owner marks sold out';
end $$;

-- 6) The customer sees the new status; a sold-out item is refused with its id.
reset role;
set role anon;
do $$
declare r json;
begin
  r := public.get_order_by_token((select v from t where k = 'token')::uuid);
  assert r->>'status' = 'confirmed', 'customer sees confirmed';
  begin
    perform public.place_order('Asha Roy', '9100000002', 'College Road, Belda', null, '[{"product_id":"chicken-momo","variant_id":"steam","quantity":1}]', null);
    raise exception 'FAIL sold-out item ordered';
  exception when others then
    assert sqlerrm = 'item_unavailable', sqlerrm;
  end;
  assert (select available from public.menu_products where id = 'chicken-momo') = false, 'visitors see the sold-out flag';
end $$;

-- 7) Requests, enquiries and messages reach the dashboard.
do $$ begin
  perform public.request_reservation(((now() at time zone 'Asia/Kolkata')::date + 1), '19:00', '20:30', 4, 'Ravi Das', '9100000003', null, 'Window table');
  perform public.send_occasion_enquiry('Ravi Das', '9100000003', null, 'Birthday', null, 12, 'Cake?');
  perform public.leave_message('Lovely cold coffee', null, null);
end $$;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$
declare n int; s json;
begin
  update public.reservations set status = 'confirmed' where customer_name = 'Ravi Das'; get diagnostics n = row_count;
  assert n = 1, 'owner confirms table';
  update public.occasion_enquiries set status = 'confirmed'; get diagnostics n = row_count;
  assert n = 1, 'owner answers enquiry';
  update public.customer_messages set read_at = now(); get diagnostics n = row_count;
  assert n = 1, 'owner marks note read';
  begin update public.customer_messages set message = 'x'; raise exception 'FAIL edited note'; exception when insufficient_privilege then null; end;
  s := public.dashboard_summary();
  assert (s->>'unread_messages')::int = 0 and (s->>'sold_out_items')::int = 1, 'summary counts: ' || s;
  raise notice 'ALL RLS CHECKS PASSED';
end $$;
reset role;
