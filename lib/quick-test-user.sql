-- Quick Test: Create a test user profile
-- 
-- IMPORTANT: You must create the auth user FIRST via Supabase Dashboard
-- Then run this SQL to create/update their profile

-- Option A: If you know the user's email, use this:
-- (Replace 'admin@test.com' with your user's email)

INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Test Admin',
  'admin'
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Test Admin';

-- Option B: If you know the user ID, use this:
-- (Replace the UUID with your actual user ID)

-- INSERT INTO profiles (id, full_name, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',  -- Replace with actual UUID
--   'Test Admin',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin', full_name = 'Test Admin';

-- Option C: Create profile for the first user in auth.users (if you have one)
INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Test User'),
  'admin'
FROM auth.users
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = COALESCE(EXCLUDED.full_name, 'Test User');
