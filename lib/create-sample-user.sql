-- SQL script to create a sample user in Supabase
-- Run this in your Supabase SQL Editor
-- Replace the email and password with your desired values

-- Option 1: Create user via Supabase Auth (recommended)
-- Go to Authentication > Users > Add User in Supabase Dashboard
-- Or use the SQL below:

-- Insert into auth.users (you'll need to use Supabase Dashboard or Admin API for this)
-- Then create the profile:

-- After creating the user in Supabase Dashboard, run this to set their role:
-- Replace 'user-email@example.com' with the actual email

-- Update profile role for existing user
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Or insert profile if it doesn't exist (if trigger didn't fire)
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
