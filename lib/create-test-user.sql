-- Method 1: Create user via Supabase Dashboard first, then run this SQL
-- 
-- Step 1: Go to Supabase Dashboard > Authentication > Users > Add User
--   - Email: admin@test.com
--   - Password: admin123
--   - Auto Confirm User: ✅
--   - Copy the User ID that gets created
--
-- Step 2: Replace 'USER_ID_HERE' below with the actual user ID from Step 1
-- Step 3: Run this SQL in Supabase SQL Editor

-- Insert profile for the user (replace USER_ID_HERE with actual UUID)
INSERT INTO profiles (id, full_name, role)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from auth.users
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';

-- ============================================
-- Method 2: If you already have a user, just update their profile
-- ============================================
-- Replace 'your-email@example.com' with your actual email

-- First, get the user ID (run this to find your user ID):
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert/update the profile (replace USER_ID with the ID from above):
-- INSERT INTO profiles (id, full_name, role)
-- VALUES (
--   'USER_ID',
--   'Your Name',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin', full_name = 'Your Name';

-- ============================================
-- Method 3: Create multiple test users
-- ============================================
-- After creating users in Dashboard, update their profiles:

-- Admin user
-- INSERT INTO profiles (id, full_name, role)
-- SELECT id, 'Admin User', 'admin'
-- FROM auth.users WHERE email = 'admin@test.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin User';

-- Editor user
-- INSERT INTO profiles (id, full_name, role)
-- SELECT id, 'Editor User', 'editor'
-- FROM auth.users WHERE email = 'editor@test.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'editor', full_name = 'Editor User';

-- Viewer user
-- INSERT INTO profiles (id, full_name, role)
-- SELECT id, 'Viewer User', 'viewer'
-- FROM auth.users WHERE email = 'viewer@test.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'viewer', full_name = 'Viewer User';
