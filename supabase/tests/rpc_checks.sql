-- Run against a database with the migration + seed applied (see docs/DEPLOYMENT.md).
-- Every check raises an exception on failure; success prints "ALL DATABASE CHECKS PASSED".
set role anon;

do $$
declare r json; ok boolean;
begin
  -- Exact ₹500 boundary: 4 × Veg Pizza (₹125) = ₹500 → ₹25 delivery
  r := public.place_order('Asha Roy', '9000000001', '12 Station Road, Belda', null,
        '[{"product_id":"veg-pizza","variant_id":null,"add_on_ids":[],"quantity":4}]');
  assert (r->>'subtotal')::int = 500 and (r->>'delivery_fee')::int = 25 and (r->>'total')::int = 525, 'boundary 500 → 25: ' || r;
  assert r->>'status' = 'pending', 'new orders are pending';

  -- ₹515 → free delivery
  r := public.place_order('Asha Roy', '9000000002', '12 Station Road, Belda', null,
        '[{"product_id":"veg-pizza","quantity":4,"add_on_ids":[]},{"product_id":"leaker-tea","quantity":1,"add_on_ids":[]}]');
  assert (r->>'subtotal')::int = 515 and (r->>'delivery_fee')::int = 0, 'above 500 → free: ' || r;

  -- Variants and add-ons priced on the server; duplicate add-on ids count once
  r := public.place_order('Asha Roy', '9000000003', '12 Station Road, Belda', null,
        '[{"product_id":"veg-momo","variant_id":"pan-fried","quantity":2,"add_on_ids":[]},
          {"product_id":"chicken-burger","quantity":1,"add_on_ids":["cheese-slice","cheese-slice"]}]');
  assert (r->>'subtotal')::int = 270 and (r->>'total')::int = 295, 'variant + add-on pricing: ' || r;

  -- A "price" field from the client is ignored
  r := public.place_order('Asha Roy', '9000000004', '12 Station Road, Belda', null,
        '[{"product_id":"chicken-farmhouse-pizza","quantity":1,"add_on_ids":[],"price":1}]');
  assert (r->>'subtotal')::int = 225, 'client price ignored';

  -- Status lookup requires the matching phone
  assert (public.get_order_status(r->>'reference', '9000000004')->>'status') = 'pending', 'status lookup';
  assert public.get_order_status(r->>'reference', '9999999999') is null, 'status hidden without matching phone';

  -- Invalid requests are rejected
  begin perform public.place_order('Asha', '9000000005', '12 Station Road, Belda', null, '[{"product_id":"kurkure-momo-veg","variant_id":"steam","quantity":1,"add_on_ids":[]}]'); raise exception 'FAIL kurkure steam accepted'; exception when others then assert sqlerrm = 'invalid_items', sqlerrm; end;
  begin perform public.place_order('Asha', '9000000005', '12 Station Road, Belda', null, '[{"product_id":"veg-pizza","quantity":1,"add_on_ids":["cheese-slice"]}]'); raise exception 'FAIL wrong add-on accepted'; exception when others then assert sqlerrm = 'invalid_items', sqlerrm; end;
  begin perform public.place_order('Asha', '9000000005', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":21,"add_on_ids":[]}]'); raise exception 'FAIL qty 21 accepted'; exception when others then assert sqlerrm = 'invalid_items', sqlerrm; end;
  begin perform public.place_order('Asha', '9000000005', '12 Station Road, Belda', null, '[]'); raise exception 'FAIL empty accepted'; exception when others then assert sqlerrm = 'empty_order', sqlerrm; end;
  begin perform public.place_order('Asha', '12345', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":1}]'); raise exception 'FAIL bad phone accepted'; exception when others then assert sqlerrm = 'invalid_phone', sqlerrm; end;

  -- Rate limit: 4th order from the same phone within 10 minutes
  perform public.place_order('Asha', '9000000009', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":1}]');
  perform public.place_order('Asha', '9000000009', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":1}]');
  perform public.place_order('Asha', '9000000009', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":1}]');
  begin perform public.place_order('Asha', '9000000009', '12 Station Road, Belda', null, '[{"product_id":"masala-tea","quantity":1}]'); raise exception 'FAIL rate limit'; exception when others then assert sqlerrm = 'rate_limited', sqlerrm; end;

  -- Reservations: request only; past dates and oversize parties rejected
  r := public.request_reservation(((now() at time zone 'Asia/Kolkata')::date + 1), '19:30', 4, 'Asha Roy', '9000000010', null, null);
  assert r->>'status' = 'pending', 'reservation pending';
  begin perform public.request_reservation(((now() at time zone 'Asia/Kolkata')::date - 1), '19:30', 4, 'Asha Roy', '9000000010', null, null); raise exception 'FAIL past date'; exception when others then assert sqlerrm = 'invalid_date', sqlerrm; end;
  begin perform public.request_reservation(((now() at time zone 'Asia/Kolkata')::date + 1), '19:30', 11, 'Asha Roy', '9000000010', null, null); raise exception 'FAIL party 11'; exception when others then assert sqlerrm = 'invalid_party_size', sqlerrm; end;

  -- Enquiry and Whisper Box
  assert public.send_occasion_enquiry('Asha Roy', '9000000011', null, 'Birthday', null, 12, 'Cake?')->>'status' = 'pending', 'enquiry';
  begin perform public.send_occasion_enquiry('Asha Roy', '9000000011', null, 'Wedding', null, 12, null); raise exception 'FAIL occasion'; exception when others then assert sqlerrm = 'invalid_message', sqlerrm; end;
  assert (public.leave_message('Lovely cold coffee', null, null)->>'received')::boolean, 'whisper';

  -- RLS: anon cannot read or write tables directly
  begin perform count(*) from public.orders; raise exception 'FAIL anon read orders'; exception when insufficient_privilege then null; end;
  begin insert into public.orders (reference, customer_name, phone, address, items, subtotal, delivery_fee, total) values ('X', 'Xx', '9000000000', '1234567890', '[]', 1, 0, 1); raise exception 'FAIL anon insert'; exception when insufficient_privilege then null; end;
  begin perform count(*) from public.customer_messages; raise exception 'FAIL anon read messages'; exception when insufficient_privilege then null; end;
  begin perform public.new_reference('X'); raise exception 'FAIL helper callable'; exception when insufficient_privilege then null; end;

  raise notice 'ALL DATABASE CHECKS PASSED';
end $$;
reset role;
