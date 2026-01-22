-- Simple: Create profile for the first user in auth.users
-- This will work if you have at least one user in auth.users

INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Admin User',
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';
