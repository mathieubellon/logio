-- =====================================================
-- DATABASE TRIGGERS
-- =====================================================
-- All triggers for the Caltrack app

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on daily_logs
CREATE OR REPLACE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to handle TDEE calculation and copy values (runs first)
CREATE OR REPLACE TRIGGER handle_tdee_and_copy_values_trigger
  BEFORE INSERT OR UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tdee_and_copy_values();

-- Trigger to calculate calories from breakdown (runs after TDEE trigger)
CREATE OR REPLACE TRIGGER calculate_calories_trigger
  BEFORE INSERT OR UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_calories_from_breakdown();

-- Trigger for profile updates that affect daily logs
CREATE OR REPLACE TRIGGER update_daily_logs_on_profile_change
  AFTER UPDATE OF date_of_birth, height, activity_level ON public.profiles
  FOR EACH ROW
  WHEN (
    OLD.date_of_birth IS DISTINCT FROM NEW.date_of_birth OR
    OLD.height IS DISTINCT FROM NEW.height OR
    OLD.activity_level IS DISTINCT FROM NEW.activity_level
  )
  EXECUTE FUNCTION public.update_daily_logs_from_profile();

-- Trigger to update balance on insert or update
CREATE OR REPLACE TRIGGER trg_calculate_balance_for_daily_logs
  BEFORE INSERT OR UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_balance_for_daily_logs();
