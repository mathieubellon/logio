create table "public"."daily_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "date" date not null,
    "calories_in" integer,
    "calories_out" integer,
    "balance" integer,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "breakdown" jsonb,
    "age" integer,
    "weight" numeric(5,2),
    "height" integer,
    "activity_level" text,
    "tdee" integer
);


alter table "public"."daily_logs" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "avatar_url" text,
    "date_of_birth" date,
    "gender" text,
    "height" integer,
    "activity_level" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX daily_logs_pkey ON public.daily_logs USING btree (id);

CREATE UNIQUE INDEX daily_logs_user_id_date_key ON public.daily_logs USING btree (user_id, date);

CREATE INDEX idx_daily_logs_user_date ON public.daily_logs USING btree (user_id, date DESC);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."daily_logs" add constraint "daily_logs_pkey" PRIMARY KEY using index "daily_logs_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."daily_logs" add constraint "daily_logs_activity_level_check" CHECK ((activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::text, 'very_active'::text]))) not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_activity_level_check";

alter table "public"."daily_logs" add constraint "daily_logs_age_check" CHECK (((age >= 10) AND (age <= 100))) not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_age_check";

alter table "public"."daily_logs" add constraint "daily_logs_height_check" CHECK (((height >= 100) AND (height <= 250))) not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_height_check";

alter table "public"."daily_logs" add constraint "daily_logs_tdee_check" CHECK (((tdee >= 800) AND (tdee <= 5000))) not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_tdee_check";

alter table "public"."daily_logs" add constraint "daily_logs_user_id_date_key" UNIQUE using index "daily_logs_user_id_date_key";

alter table "public"."daily_logs" add constraint "daily_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_user_id_fkey";

alter table "public"."daily_logs" add constraint "daily_logs_weight_check" CHECK (((weight >= (30)::numeric) AND (weight <= (300)::numeric))) not valid;

alter table "public"."daily_logs" validate constraint "daily_logs_weight_check";

alter table "public"."profiles" add constraint "profiles_activity_level_check" CHECK ((activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::text, 'very_active'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_activity_level_check";

alter table "public"."profiles" add constraint "profiles_gender_check" CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_gender_check";

alter table "public"."profiles" add constraint "profiles_height_check" CHECK (((height >= 100) AND (height <= 250))) not valid;

alter table "public"."profiles" validate constraint "profiles_height_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_age_from_dob(dob date)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
DECLARE
  age INTEGER;
BEGIN
  IF dob IS NULL THEN
    RETURN NULL;
  END IF;

  age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, dob));

  -- Ensure age is within valid range
  IF age < 10 THEN
    RETURN NULL;
  ELSIF age > 100 THEN
    RETURN 100;
  END IF;

  RETURN age;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_balance_for_daily_logs()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only calculate if all required fields are present
  IF NEW.calories_in IS NOT NULL AND NEW.calories_out IS NOT NULL AND NEW.tdee IS NOT NULL THEN
    NEW.balance := NEW.calories_in - (NEW.calories_out + NEW.tdee);
  ELSE
    NEW.balance := NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_calories_from_breakdown()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Calculate calories_in from meals
  NEW.calories_in := COALESCE(
    (
      SELECT SUM((meal->>'calories')::integer)
      FROM jsonb_array_elements(COALESCE(NEW.breakdown->'meals', '[]'::jsonb)) AS meal
      WHERE (meal->>'calories') IS NOT NULL AND (meal->>'calories')::text ~ '^[0-9]+$'
    ),
    0
  );

  -- Calculate calories_out from activities
  NEW.calories_out := COALESCE(
    (
      SELECT SUM((activity->>'calories')::integer)
      FROM jsonb_array_elements(COALESCE(NEW.breakdown->'activities', '[]'::jsonb)) AS activity
      WHERE (activity->>'calories') IS NOT NULL AND (activity->>'calories')::text ~ '^[0-9]+$'
    ),
    0
  );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_tdee(age_val integer, weight_val numeric, height_val integer, activity_level_val text, gender_val text DEFAULT 'male'::text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  bmr NUMERIC;
  activity_multiplier NUMERIC;
  tdee_result INTEGER;
BEGIN
  -- Return NULL if any required value is missing
  IF age_val IS NULL OR weight_val IS NULL OR height_val IS NULL OR activity_level_val IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate BMR using Mifflin-St Jeor Equation
  -- Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  -- Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  IF gender_val = 'female' THEN
    bmr := (10 * weight_val) + (6.25 * height_val) - (5 * age_val) - 161;
  ELSE
    bmr := (10 * weight_val) + (6.25 * height_val) - (5 * age_val) + 5;
  END IF;

  -- Apply activity level multiplier
  CASE activity_level_val
    WHEN 'sedentary' THEN activity_multiplier := 1.2;
    WHEN 'light' THEN activity_multiplier := 1.375;
    WHEN 'moderate' THEN activity_multiplier := 1.55;
    WHEN 'active' THEN activity_multiplier := 1.725;
    WHEN 'very_active' THEN activity_multiplier := 1.9;
    ELSE activity_multiplier := 1.2; -- Default to sedentary
  END CASE;

  -- Calculate TDEE and round to nearest integer
  tdee_result := ROUND(bmr * activity_multiplier);

  -- Ensure TDEE is within reasonable bounds
  IF tdee_result < 800 THEN
    tdee_result := 800;
  ELSIF tdee_result > 5000 THEN
    tdee_result := 5000;
  END IF;

  RETURN tdee_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_tdee_with_profile(user_id_val uuid, age_val integer, weight_val numeric, height_val integer, activity_level_val text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  user_gender TEXT;
BEGIN
  -- Get user's gender from profiles table
  SELECT gender INTO user_gender
  FROM public.profiles
  WHERE id = user_id_val;

  -- Use the existing calculate_tdee function with gender from profiles
  RETURN public.calculate_tdee(age_val, weight_val, height_val, activity_level_val, COALESCE(user_gender, 'male'));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_values(user_id_val uuid)
 RETURNS TABLE(profile_age integer, profile_height integer, profile_activity_level text)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    public.calculate_age_from_dob(p.date_of_birth) as profile_age,
    p.height as profile_height,
    p.activity_level as profile_activity_level
  FROM public.profiles p
  WHERE p.id = user_id_val;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_tdee_and_copy_values()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  profile_values RECORD;
  last_weight NUMERIC;
BEGIN
  -- Get values from the user's profile
  SELECT * INTO profile_values FROM public.get_profile_values(NEW.user_id);

  -- Copy values from profile if they're missing in the new record
  IF profile_values IS NOT NULL THEN
    NEW.age := COALESCE(NEW.age, profile_values.profile_age);
    NEW.height := COALESCE(NEW.height, profile_values.profile_height);
    NEW.activity_level := COALESCE(NEW.activity_level, profile_values.profile_activity_level);
  END IF;

  -- For weight, we still get it from the last daily log entry since it changes frequently
  -- and shouldn't be stored in the profile
  IF NEW.weight IS NULL AND TG_OP = 'INSERT' THEN
    SELECT dl.weight INTO last_weight
    FROM public.daily_logs dl
    WHERE dl.user_id = NEW.user_id
      AND dl.date < NEW.date
      AND dl.weight IS NOT NULL
    ORDER BY dl.date DESC
    LIMIT 1;

    NEW.weight := last_weight;
  END IF;

  -- Calculate TDEE if we have all required values
  IF NEW.age IS NOT NULL AND NEW.weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.activity_level IS NOT NULL THEN
    NEW.tdee := public.calculate_tdee_with_profile(NEW.user_id, NEW.age, NEW.weight, NEW.height, NEW.activity_level);
  ELSE
    NEW.tdee := NULL;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_daily_logs_from_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  new_age INTEGER;
BEGIN
  -- Calculate new age if date_of_birth changed
  IF NEW.date_of_birth IS NOT NULL THEN
    new_age := public.calculate_age_from_dob(NEW.date_of_birth);
  END IF;

  -- Update all future daily logs with new profile values
  -- We only update logs from today onwards to preserve historical data
  UPDATE public.daily_logs
  SET
    age = COALESCE(new_age, age),
    height = COALESCE(NEW.height, height),
    activity_level = COALESCE(NEW.activity_level, activity_level),
    -- Recalculate TDEE with new values
    tdee = CASE
      WHEN COALESCE(new_age, age) IS NOT NULL
        AND weight IS NOT NULL
        AND COALESCE(NEW.height, height) IS NOT NULL
        AND COALESCE(NEW.activity_level, activity_level) IS NOT NULL
      THEN public.calculate_tdee_with_profile(
        user_id,
        COALESCE(new_age, age),
        weight,
        COALESCE(NEW.height, height),
        COALESCE(NEW.activity_level, activity_level)
      )
      ELSE NULL
    END
  WHERE user_id = NEW.id
    AND date >= CURRENT_DATE;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."daily_logs" to "anon";

grant insert on table "public"."daily_logs" to "anon";

grant references on table "public"."daily_logs" to "anon";

grant select on table "public"."daily_logs" to "anon";

grant trigger on table "public"."daily_logs" to "anon";

grant truncate on table "public"."daily_logs" to "anon";

grant update on table "public"."daily_logs" to "anon";

grant delete on table "public"."daily_logs" to "authenticated";

grant insert on table "public"."daily_logs" to "authenticated";

grant references on table "public"."daily_logs" to "authenticated";

grant select on table "public"."daily_logs" to "authenticated";

grant trigger on table "public"."daily_logs" to "authenticated";

grant truncate on table "public"."daily_logs" to "authenticated";

grant update on table "public"."daily_logs" to "authenticated";

grant delete on table "public"."daily_logs" to "service_role";

grant insert on table "public"."daily_logs" to "service_role";

grant references on table "public"."daily_logs" to "service_role";

grant select on table "public"."daily_logs" to "service_role";

grant trigger on table "public"."daily_logs" to "service_role";

grant truncate on table "public"."daily_logs" to "service_role";

grant update on table "public"."daily_logs" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

create policy "Users can delete their own logs"
on "public"."daily_logs"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own logs"
on "public"."daily_logs"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own logs"
on "public"."daily_logs"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own logs"
on "public"."daily_logs"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER calculate_calories_trigger BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION calculate_calories_from_breakdown();

CREATE TRIGGER handle_tdee_and_copy_values_trigger BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION handle_tdee_and_copy_values();

CREATE TRIGGER trg_calculate_balance_for_daily_logs BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION calculate_balance_for_daily_logs();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_on_profile_change AFTER UPDATE OF date_of_birth, height, activity_level ON public.profiles FOR EACH ROW WHEN (((old.date_of_birth IS DISTINCT FROM new.date_of_birth) OR (old.height IS DISTINCT FROM new.height) OR (old.activity_level IS DISTINCT FROM new.activity_level))) EXECUTE FUNCTION update_daily_logs_from_profile();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


