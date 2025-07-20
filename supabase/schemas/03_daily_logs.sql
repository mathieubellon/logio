-- =====================================================
-- DAILY LOGS TABLE
-- =====================================================
-- Daily calorie tracking with TDEE calculation and validation constraints

CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories_in INTEGER,
    calories_out INTEGER,
    balance INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    breakdown JSONB,
    age INTEGER,
    weight NUMERIC(5,2),
    height INTEGER,
    activity_level TEXT,
    tdee INTEGER,
    PRIMARY KEY (id),
    UNIQUE (user_id, date),
    -- Check constraints for data validation
    CONSTRAINT daily_logs_age_check CHECK (age >= 10 AND age <= 100),
    CONSTRAINT daily_logs_weight_check CHECK (weight >= 30::numeric AND weight <= 300::numeric),
    CONSTRAINT daily_logs_height_check CHECK (height >= 100 AND height <= 250),
    CONSTRAINT daily_logs_activity_level_check CHECK (activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::text, 'very_active'::text])),
    CONSTRAINT daily_logs_tdee_check CHECK (tdee >= 800 AND tdee <= 5000)
);

-- Add comments to columns
COMMENT ON TABLE public.daily_logs IS 'Daily calorie tracking logs with TDEE calculation';
COMMENT ON COLUMN public.daily_logs.age IS 'User age in years (10-100)';
COMMENT ON COLUMN public.daily_logs.weight IS 'User weight in kilograms (30-300)';
COMMENT ON COLUMN public.daily_logs.height IS 'User height in centimeters (100-250)';
COMMENT ON COLUMN public.daily_logs.activity_level IS 'User activity level: sedentary, light, moderate, active, very_active';
COMMENT ON COLUMN public.daily_logs.tdee IS 'Total Daily Energy Expenditure in calories (800-5000)';
COMMENT ON COLUMN public.daily_logs.balance IS 'Net calorie balance: calories_in - (calories_out + tdee)';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs USING btree (user_id, date DESC);
