-- Create admin profile for a user by email
-- This queries auth.users (which HAS email) to get the user ID,
-- then inserts into profiles (which doesn't have email column)

-- Create profile for your email (fdg.gonzalesgabriel@gmail.com)
INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Admin User',
  'admin'
FROM auth.users
WHERE email = 'fdg.gonzalesgabriel@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';

-- Option 2: If you want to use a different email, just change 'admin@test.com' above
-- For example, if your email is 'yourname@example.com':
-- WHERE email = 'yourname@example.com'

-- Option 3: Create admin profile for the FIRST user in your auth.users table
-- (Use this if you're not sure which email to use)
-- INSERT INTO profiles (id, full_name, role)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
--   'admin'
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
-- ORDER BY created_at
-- LIMIT 1
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin';
