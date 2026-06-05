-- ==========================================
-- FIX: Xóa trigger cũ, tạo lại function + trigger
-- ==========================================

-- 1. Xóa trigger cũ nếu có
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Tạo lại function với error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log lỗi rõ ràng
  RAISE NOTICE 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Tạo lại trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Kiểm tra lại
SELECT tgname AS trigger_name, tgenabled AS enabled, proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
