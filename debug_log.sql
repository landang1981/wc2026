-- ==========================================
-- DEBUG: Kiểm tra trigger handle_new_user
-- ==========================================

-- 1. Kiểm tra trigger có tồn tại không
SELECT tgname, tgrelid::regclass, proname 
FROM pg_trigger t 
JOIN pg_proc p ON t.tgfoid = p.oid 
WHERE tgname = 'on_auth_user_created';

-- 2. Kiểm tra function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Xem profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
