-- One line per brokered contract, shown as the yearly record on /works.
-- Detailed stories stay in lineestate_published; case_number links a record to its story.
create table public.lineestate_deal_records (
  id uuid primary key default gen_random_uuid(),
  contracted_month text not null check (contracted_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  name text not null check (length(trim(name)) > 0),
  industry text not null default '',
  deal_type text not null default 'lease' check (deal_type in ('lease','sale','transfer')),
  map_url text not null default '' check (map_url = '' or map_url like 'https://map.naver.com/%'),
  case_number text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lineestate_deal_records_month on public.lineestate_deal_records (contracted_month desc, sort_order);

alter table public.lineestate_deal_records enable row level security;
grant select on public.lineestate_deal_records to anon;
grant select,insert,update,delete on public.lineestate_deal_records to authenticated;
grant all on public.lineestate_deal_records to service_role;
create policy "read visible deal records" on public.lineestate_deal_records for select to anon,authenticated
  using (visible);
create policy "admins manage deal records" on public.lineestate_deal_records for all to authenticated
  using (exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))))
  with check (exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))));

-- Records supplied by the agent on 2026-10-22. All are lease contracts.
-- Six links were duplicated in the source list and are left blank until corrected.
insert into public.lineestate_deal_records (contracted_month,name,industry,map_url,case_number,sort_order) values
 ('2020-07','광명대창집 산본점','음식점','https://map.naver.com/p/entry/place/1067206702','',1),
 ('2021-02','메종드헤어0403 산본점','미용','https://map.naver.com/p/entry/place/1069182384','',1),
 ('2021-06','BHC 한숲사거리점','음식점','https://map.naver.com/p/entry/place/1683025906','',1),
 ('2021-12','테니스데이 산본점','스포츠','https://map.naver.com/p/entry/place/1351793481','',1),
 ('2022-01','Poke all day 포케&샐러드 산본점','음식점','https://map.naver.com/p/entry/place/1785678710','',1),
 ('2022-04','영개소문옛날통닭 산본점','음식점','https://map.naver.com/p/entry/place/1783150361','',1),
 ('2022-05','카페코니','카페','','',1),
 ('2022-05','짬뽕타운 산본점','음식점','https://map.naver.com/p/entry/place/1580560592','',2),
 ('2022-06','수학을 권하다 (1)','학원·스터디','https://map.naver.com/p/entry/place/1104286997','',1),
 ('2022-07','초월스터디카페 산본역점','학원·스터디','https://map.naver.com/p/entry/place/1693457382','',1),
 ('2023-04','카페 빠이파이','카페','','',1),
 ('2023-05','카페 팜','카페','','',1),
 ('2023-06','리띵커피','카페','https://map.naver.com/p/entry/place/1637607860','',1),
 ('2023-11','수학을 권하다 (2)','학원·스터디','https://map.naver.com/p/entry/place/1287580479','',1),
 ('2024-01','에스엠덴탈아트치과기공소','병원·의료','https://map.naver.com/p/entry/place/1244536831','',1),
 ('2024-08','어반트랜드 산본점','미용','https://map.naver.com/p/entry/place/1181928400','',1),
 ('2024-08','설화샵','미용','https://map.naver.com/p/entry/place/1828764112','',2),
 ('2024-09','헤어공간BY보람 산본점','미용','https://map.naver.com/p/entry/place/1026445176','',1),
 ('2024-10','편백회관 산본점','음식점','https://map.naver.com/p/entry/place/1689830219','SUN-1005',1),
 ('2024-10','맛찬들왕소금구이 산본직영점','음식점','','',2),
 ('2024-12','옵티멈존PC카페 산본역점','PC카페','https://map.naver.com/p/entry/place/1545573674','',1),
 ('2025-01','카페재재','카페','https://map.naver.com/p/entry/place/1207260454','',1),
 ('2025-03','대구생막창이야기','음식점','https://map.naver.com/p/entry/place/1316775420','',1),
 ('2025-03','콤마PC카페 산본역점','PC카페','https://map.naver.com/p/entry/place/1447776446','SUN-1007',2),
 ('2025-05','무등소갈비','음식점','','',1),
 ('2025-08','잘해주는치과의원','병원·의료','https://map.naver.com/p/entry/place/1278821587','',1),
 ('2025-09','메가커피 한숲사거리점','카페','https://map.naver.com/p/entry/place/2075582030','',1),
 ('2025-10','365산본플란트치과의원','병원·의료','https://map.naver.com/p/entry/place/2036201487','',1),
 ('2025-12','폴바셋 산본역점','카페','https://map.naver.com/p/entry/place/2065200281','',1),
 ('2025-12','산본만세한의원','병원·의료','https://map.naver.com/p/entry/place/2034458741','',2),
 ('2026-02','파스타입니다 군포점','음식점','https://map.naver.com/p/entry/place/1191633604','',1),
 ('2026-02','산본중심치과','병원·의료','','',2),
 ('2026-04','속초어시장 산본점','음식점','https://map.naver.com/p/entry/place/2057296333','',1),
 ('2026-06','헤즈업 산본점','주점','https://map.naver.com/p/entry/place/2049807823','',1),
 ('2026-06','옥된장 산본점','음식점','https://map.naver.com/p/entry/place/2019344342','',2),
 ('2026-07','카공족온','학원·스터디','https://map.naver.com/p/entry/place/2020928781','',1),
 ('2026-09','론썸헤이드 산본역점','미용','https://map.naver.com/p/entry/place/2064520249','',1),
 ('2026-10','이자카야 결','주점','https://map.naver.com/p/entry/place/2030170952','',1),
 ('2026-10','서울아산이비인후과의원','병원·의료','https://map.naver.com/p/entry/place/1394426712','SUN-1008',2);
