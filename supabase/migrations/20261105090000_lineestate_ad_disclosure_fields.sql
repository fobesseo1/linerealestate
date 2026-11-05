-- Listing fields required by 「중개대상물의 표시·광고 명시사항 세부기준」 제6조 that had no input:
-- buildingStatus (위반건축물·미등기건물), restrooms (화장실 수), locality (주소 비공개 시 공개할 읍·면·동).
-- Only the public allowlist changes; private notes still never reach a public snapshot.
create or replace function public.lineestate_public_content(value jsonb) returns jsonb
language sql immutable security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(key,val),'{}'::jsonb) from jsonb_each(value) as x(key,val)
 where key = any(array['kind','industry','title','address','building','floor','totalFloors','area','contractArea','deposit','rent','salePrice','premium','management','vat','usage','buildingStatus','restrooms','locality','approvedDate','parking','direction','available','facilities','description','initial','issue','actions','outcome','photos','showMap','latitude','longitude']);
$$;
revoke all on function public.lineestate_public_content(jsonb) from public;
grant execute on function public.lineestate_public_content(jsonb) to authenticated,service_role;
