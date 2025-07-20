-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- User profile information that extends auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    height INTEGER CHECK (height >= 100 AND height <= 250),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male or female';
COMMENT ON COLUMN public.profiles.height IS 'User height in centimeters (100-250)';
COMMENT ON COLUMN public.profiles.activity_level IS 'User activity level: sedentary, light, moderate, active, very_active'; 