-- ============================================================
-- WC2026 Seed Users
-- T?o 3 default user v?i 3 role: admin, superuser, user
-- Run AFTER 001_initial_schema.sql trong Supabase SQL Editor
-- ============================================================
-- ? Y�U C?U: Ch?y v?i vai tr� service_role
-- V�o SQL Editor > ch?n "Use service role key" > Paste v� Run
-- N?u kh�ng ???c, d�ng c�ch th? c�ng ? cu?i file
-- ============================================================

-- H�m helper t?o user + profile
DO $$
DECLARE
  v_id UUID;
BEGIN
  -- ========================
  -- 1. ADMIN
  -- Email: admin@wc2026.internal
  -- Pass:  Admin@2026
  -- ========================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@wc2026.internal') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'admin@wc2026.internal', crypt('Admin@2026', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{"display_name":"Qu?n Tr? Vi�n","role":"admin"}');
    UPDATE profiles SET role = 'admin', must_change_password = FALSE WHERE id = v_id;
  END IF;

  -- ========================
  -- 2. SUPERUSER
  -- Email: superuser@wc2026.internal
  -- Pass:  Super@2026
  -- ========================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superuser@wc2026.internal') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'superuser@wc2026.internal', crypt('Super@2026', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{"display_name":"Ng??i V?n H�nh","role":"superuser"}');
    UPDATE profiles SET role = 'superuser', must_change_password = FALSE WHERE id = v_id;
  END IF;

  -- ========================
  -- 3. USER (ph?i d?i mk l?n d?u)
  -- Email: user@wc2026.internal
  -- Pass:  User@2026
  -- ========================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user@wc2026.internal') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'user@wc2026.internal', crypt('User@2026', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{"display_name":"Ng??i Ch?i","role":"user"}');
    UPDATE profiles SET role = 'user', must_change_password = TRUE WHERE id = v_id;
  END IF;
END;
$$;

-- ============================================================
-- Verify
-- ============================================================
SELECT u.email, p.display_name, p.role, p.must_change_password
FROM auth.users u
JOIN profiles p ON p.id = u.id
ORDER BY p.role;

-- ============================================================
-- C�CH TH? C�NG (n?u SQL tr�n kh�ng ch?y ???c):
-- ============================================================
-- 1. V�o Authentication > Users > Add User
--    admin@wc2026.internal / Admin@2026
--    superuser@wc2026.internal / Super@2026
--    user@wc2026.internal / User@2026
-- 2. Ch?y l?nh d??i �? set role:
--
-- UPDATE profiles SET role = 'admin',    must_change_password = FALSE WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@wc2026.internal');
-- UPDATE profiles SET role = 'superuser', must_change_password = FALSE WHERE id = (SELECT id FROM auth.users WHERE email = 'superuser@wc2026.internal');
-- UPDATE profiles SET role = 'user',      must_change_password = TRUE  WHERE id = (SELECT id FROM auth.users WHERE email = 'user@wc2026.internal');
