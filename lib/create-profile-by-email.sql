-- Create profile for user by email
-- This queries auth.users (which HAS email) to get the user ID,
-- then inserts into profiles (which doesn't have email)

INSERT INTO profiles (id, full_name, role)
SELECT 
  id,
  'Admin User',
  'admin'
FROM auth.users
WHERE email = 'fdg.gonzalesgabriel@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'Admin User';
