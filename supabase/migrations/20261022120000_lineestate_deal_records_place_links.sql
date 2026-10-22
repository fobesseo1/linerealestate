-- map.naver.com/p/entry links bounce phones to the Naver Map app (blank without it).
-- m.place.naver.com place pages open in any browser, so records link there.
alter table public.lineestate_deal_records drop constraint lineestate_deal_records_map_url_check;
update public.lineestate_deal_records
  set map_url = 'https://m.place.naver.com/place/' || substring(map_url from '/place/(\d+)') || '/home', updated_at = now()
  where map_url like 'https://map.naver.com/%/place/%';
alter table public.lineestate_deal_records add constraint lineestate_deal_records_map_url_check
  check (map_url = '' or map_url ~ '^https://m\.place\.naver\.com/place/\d+/home$');
