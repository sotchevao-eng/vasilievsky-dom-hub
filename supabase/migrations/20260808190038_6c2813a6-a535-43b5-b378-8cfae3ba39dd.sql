drop function if exists public.is_admin();
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_roles' and policyname='Users can view own roles') then
    create policy "Users can view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
  end if;
end $$;
grant select on public.user_roles to authenticated;