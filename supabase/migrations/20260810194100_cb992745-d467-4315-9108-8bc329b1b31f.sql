DO $$
DECLARE
  p record;
  new_qual text;
  new_check text;
  sql text;
  admin_expr constant text := '(EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ''admin''::public.app_role))';
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual,'') LIKE '%has_role%' OR coalesce(with_check,'') LIKE '%has_role%')
  LOOP
    new_qual := replace(replace(coalesce(p.qual,''), 'public.has_role(auth.uid(), ''admin''::app_role)', admin_expr), 'has_role(auth.uid(), ''admin''::app_role)', admin_expr);
    new_check := replace(replace(coalesce(p.with_check,''), 'public.has_role(auth.uid(), ''admin''::app_role)', admin_expr), 'has_role(auth.uid(), ''admin''::app_role)', admin_expr);

    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);

    sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      p.policyname, p.schemaname, p.tablename,
      CASE WHEN p.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      p.cmd,
      array_to_string(p.roles, ', '));

    IF p.qual IS NOT NULL THEN
      sql := sql || format(' USING (%s)', new_qual);
    END IF;
    IF p.with_check IS NOT NULL THEN
      sql := sql || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE sql;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, PUBLIC;