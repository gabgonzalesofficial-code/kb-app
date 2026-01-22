-- Check if you have any users in auth.users first
-- Run this to see existing users:
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at;

-- Then create a profile for the first user (replace with actual UUID if needed):
INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Admin User',
  'admin'
FROM auth.users
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';

-- OR if you know the specific user ID, use this:
-- INSERT INTO profiles (id, full_name, role)
-- VALUES (
--   'paste-user-uuid-here',  -- Get this from auth.users table
--   'Admin User',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin', full_name = 'Admin User';
