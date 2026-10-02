SET local check_function_bodies = off;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "authenticated";

CREATE TABLE "public"."institutions" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "nombre"      text                     NOT NULL,
  "descripcion" text                     NOT NULL,
  "logo_url"    text,
  "orden"       integer                  NOT NULL DEFAULT 0,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "institutions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."institutions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."key_dates" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "titulo"      text                     NOT NULL,
  "descripcion" text                     NOT NULL,
  "fecha"       text                     NOT NULL,
  "orden"       integer                  NOT NULL DEFAULT 0,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "key_dates_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."key_dates"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."site_settings" (
  "id"            text                     NOT NULL,
  "hero_title"    text                     NOT NULL,
  "hero_subtitle" text                     NOT NULL,
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "site_settings_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."site_settings"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles"
  ADD COLUMN "matricula" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "nombre" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "apellido_paterno" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "apellido_materno" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "carrera" text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "institutions: lectura pública" ON "public"."institutions"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "key_dates: lectura pública" ON "public"."key_dates"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Los usuarios pueden ver su propio perfil" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Permitir insercion a usuarios autenticados" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Permitir insercion publica anon" ON "public"."profiles"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = id));

CREATE POLICY "site_settings: lectura pública" ON "public"."site_settings"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "institution-logos: lectura pública" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'institution-logos'::text));

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "postgres", "service_role";

REVOKE ALL ON SCHEMA "public" FROM "supabase_auth_admin";

GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";

REVOKE ALL ON TABLE "public"."events" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."events" TO "anon";

REVOKE ALL ON TABLE "public"."events" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."events" TO "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."institutions" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."institutions" TO "postgres", "service_role";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."key_dates" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."key_dates" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."profiles" FROM "supabase_auth_admin";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "supabase_auth_admin";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."site_settings" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."site_settings" TO "postgres", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "service_role";

