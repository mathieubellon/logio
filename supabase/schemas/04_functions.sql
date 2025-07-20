-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================
-- All custom functions for the Caltrack app

-- Function to calculate balance for daily_logs
CREATE OR REPLACE FUNCTION public.calculate_balance_for_daily_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only calculate if all required fields are present
  IF NEW.calories_in IS NOT NULL AND NEW.calories_out IS NOT NULL AND NEW.tdee IS NOT NULL THEN
    NEW.balance := NEW.calories_in - (NEW.calories_out + NEW.tdee);
  ELSE
    NEW.balance := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to handle new user creation (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to calculate calories from breakdown JSON
CREATE OR REPLACE FUNCTION public.calculate_calories_from_breakdown()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;

-- Function to calculate TDEE (Total Daily Energy Expenditure)
CREATE OR REPLACE FUNCTION public.calculate_tdee(
  age_val INTEGER,
  weight_val NUMERIC,
  height_val INTEGER,
  activity_level_val TEXT,
  gender_val TEXT DEFAULT 'male'
)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;

-- Function to calculate TDEE with gender from profiles table
CREATE OR REPLACE FUNCTION public.calculate_tdee_with_profile(
  user_id_val UUID,
  age_val INTEGER,
  weight_val NUMERIC,
  height_val INTEGER,
  activity_level_val TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;

-- Function to calculate age from date_of_birth
CREATE OR REPLACE FUNCTION public.calculate_age_from_dob(dob DATE)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
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
$$;

-- Function to get profile values for daily logs
CREATE OR REPLACE FUNCTION public.get_profile_values(user_id_val UUID)
RETURNS TABLE(
  profile_age INTEGER,
  profile_height INTEGER,
  profile_activity_level TEXT
)
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    public.calculate_age_from_dob(p.date_of_birth) as profile_age,
    p.height as profile_height,
    p.activity_level as profile_activity_level
  FROM public.profiles p
  WHERE p.id = user_id_val;
END;
$$;

-- Function to handle TDEE calculation and value copying on insert/update
CREATE OR REPLACE FUNCTION public.handle_tdee_and_copy_values()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;

-- Function to update all daily logs when profile changes
CREATE OR REPLACE FUNCTION public.update_daily_logs_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;
