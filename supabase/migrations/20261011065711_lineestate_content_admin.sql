-- Isolated from the auction project's existing data and policies.
create table public.lineestate_admins (email text primary key, enabled boolean not null default true);
alter table public.lineestate_admins enable row level security;
grant select on public.lineestate_admins to authenticated;
create policy "read own admin permission" on public.lineestate_admins for select to authenticated
  using (email = lower((select auth.jwt()->>'email')));
insert into public.lineestate_admins(email) values ('ysyh1730@naver.com'),('hjdh59@gmail.com');

create sequence public.lineestate_number_seq start 1001;
create table public.lineestate_drafts (
  id uuid primary key default gen_random_uuid(),
  number text unique not null default ('SUN-' || nextval('public.lineestate_number_seq')),
  content jsonb not null default '{}'::jsonb,
  private_notes text not null default '',
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create table public.lineestate_revisions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.lineestate_drafts(id),
  base_version integer not null,
  original jsonb not null,
  candidate jsonb not null,
  summary text not null default '',
  state text not null default 'pending' check (state in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create table public.lineestate_published (
  id uuid primary key references public.lineestate_drafts(id),
  number text unique not null,
  content jsonb not null,
  revision_id uuid not null references public.lineestate_revisions(id),
  status text not null default 'active' check(status in ('active','completed','hidden')),
  published_at timestamptz not null default now()
);
grant usage on sequence public.lineestate_number_seq to authenticated;
grant select,insert,update on public.lineestate_drafts,public.lineestate_revisions to authenticated;
grant select,insert,update,delete on public.lineestate_published to authenticated;
grant select on public.lineestate_published to anon;
alter table public.lineestate_drafts enable row level security;
alter table public.lineestate_revisions enable row level security;
alter table public.lineestate_published enable row level security;
create policy "admins manage drafts" on public.lineestate_drafts for all to authenticated
 using(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))))
 with check(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))));
create policy "admins manage revisions" on public.lineestate_revisions for all to authenticated
 using(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))))
 with check(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))));
create policy "admins manage publications" on public.lineestate_published for all to authenticated
 using(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))))
 with check(exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))));
create policy "read published content only" on public.lineestate_published for select to anon,authenticated
 using(status in ('active','completed'));

-- Explicit allowlist: private notes and customer details never become a public snapshot.
create function public.lineestate_public_content(value jsonb) returns jsonb
language sql immutable security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(key,val),'{}'::jsonb) from jsonb_each(value) as x(key,val)
 where key = any(array['kind','industry','title','address','building','floor','totalFloors','area','contractArea','deposit','rent','salePrice','premium','management','vat','usage','approvedDate','parking','direction','available','facilities','description','initial','issue','actions','outcome','photos','showMap','latitude','longitude']);
$$;
revoke all on function public.lineestate_public_content(jsonb) from public;
grant execute on function public.lineestate_public_content(jsonb) to authenticated,service_role;

create function public.lineestate_approve(revision uuid, public_photos jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare r public.lineestate_revisions; d public.lineestate_drafts; snapshot jsonb;
begin
 if current_user <> 'service_role' and not exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))) then raise exception 'Admin permission required'; end if;
 select * into r from public.lineestate_revisions where id=revision for update;
 if not found or r.state <> 'pending' then raise exception 'Revision unavailable'; end if;
 select * into d from public.lineestate_drafts where id=r.draft_id for update;
 if d.version <> r.base_version then raise exception 'Draft changed. Prepare a new revision.'; end if;
 snapshot := public.lineestate_public_content(r.candidate);
 if coalesce(trim(snapshot->>'title'),'')='' or coalesce(trim(snapshot->>'description'),'')='' or coalesce(snapshot->>'kind','') not in ('lease','sale','work') then raise exception 'Title, category and description required'; end if;
 if jsonb_typeof(public_photos)<>'array' then raise exception 'Photo array required'; end if;
 snapshot := jsonb_set(snapshot,'photos',public_photos);
 -- Hidden map addresses must not be delivered in public HTML/JSON either.
 if not coalesce((snapshot->>'showMap')::boolean,false) then snapshot := snapshot - 'address' - 'latitude' - 'longitude'; end if;
 insert into public.lineestate_published(id,number,content,revision_id)
 values(d.id,d.number,snapshot,r.id)
 on conflict(id) do update set content=excluded.content, revision_id=excluded.revision_id,status='active',published_at=now();
 update public.lineestate_drafts set content=r.candidate,version=version+1,updated_at=now() where id=d.id;
 update public.lineestate_revisions set state='approved',approved_at=now() where id=r.id;
end $$;
revoke all on function public.lineestate_approve(uuid,jsonb) from public;
grant execute on function public.lineestate_approve(uuid,jsonb) to authenticated;
grant execute on function public.lineestate_approve(uuid,jsonb) to service_role;
grant all on public.lineestate_admins,public.lineestate_drafts,public.lineestate_revisions,public.lineestate_published to service_role;
grant usage on sequence public.lineestate_number_seq to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('lineestate-originals','lineestate-originals',false,15728640,array['image/jpeg','image/png','image/webp']),
 ('lineestate-public','lineestate-public',true,15728640,array['image/jpeg','image/png','image/webp']);
create policy "lineestate admin photo access" on storage.objects for all to authenticated
 using(bucket_id in ('lineestate-originals','lineestate-public') and exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))))
 with check(bucket_id in ('lineestate-originals','lineestate-public') and exists(select 1 from public.lineestate_admins where enabled and email = lower((select auth.jwt()->>'email'))));
