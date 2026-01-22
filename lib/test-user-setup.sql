-- Quick Setup: Create Test User
-- 
-- STEP 1: Create user in Supabase Dashboard
--   1. Go to: https://supabase.com/dashboard/project/bvlonkcgdlmvcxcwxqol/auth/users
--   2. Click "Add User" → "Create new user"
--   3. Email: admin@test.com
--   4. Password: admin123
--   5. ✅ Check "Auto Confirm User"
--   6. Click "Create User"
--   7. Copy the User ID (UUID) that appears
--
-- STEP 2: Run this SQL (replace USER_ID with the UUID from Step 1)

-- Insert profile for admin user
INSERT INTO profiles (id, full_name, role)
VALUES (
  'USER_ID_HERE',  -- ⚠️ REPLACE THIS with the UUID from Step 1
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';

-- ============================================
-- ALTERNATIVE: Auto-create profile for existing user by email
-- ============================================
-- If you already created a user, run this instead:

INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Admin User',
  'admin'
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';

-- ============================================
-- Create profile for ANY existing user (first user found)
-- ============================================
-- This will create an admin profile for the first user in your auth.users table:

INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Test Admin'),
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';
