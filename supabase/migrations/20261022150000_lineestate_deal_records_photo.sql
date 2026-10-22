-- One store photo per record, stored as WebP in the public bucket under records/.
alter table public.lineestate_deal_records add column photo_path text not null default ''
  check (photo_path = '' or photo_path ~ '^records/[0-9a-f-]+\.webp$');
