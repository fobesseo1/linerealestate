create or replace function public.lineestate_approve(revision uuid, public_photos jsonb) returns void
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
 snapshot := jsonb_set(snapshot,'{photos}',public_photos);
 -- Hidden map addresses must not be delivered in public HTML/JSON either.
 if not coalesce((snapshot->>'showMap')::boolean,false) then snapshot := snapshot - 'address' - 'latitude' - 'longitude'; end if;
 insert into public.lineestate_published(id,number,content,revision_id)
 values(d.id,d.number,snapshot,r.id)
 on conflict(id) do update set content=excluded.content, revision_id=excluded.revision_id,status='active',published_at=now();
 update public.lineestate_drafts set content=r.candidate,version=version+1,updated_at=now() where id=d.id;
 update public.lineestate_revisions set state='approved',approved_at=now() where id=r.id;
end $$;
