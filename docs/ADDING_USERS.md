# How to Add Sample Users

There are several ways to add users to your knowledge base application:

## Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/bvlonkcgdlmvcxcwxqol
   - Click on **Authentication** in the left sidebar
   - Click on **Users**

2. **Add a New User**
   - Click **Add User** button
   - Choose **Create new user**
   - Enter:
     - **Email**: e.g., `admin@example.com`
     - **Password**: Choose a secure password
     - **Auto Confirm User**: ✅ Check this (so they can login immediately)
   - Click **Create User**

3. **Set User Role**
   - Go to **SQL Editor** in Supabase Dashboard
   - Run this SQL (replace email with your user's email):

```sql
-- Set user role to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Or set to editor
UPDATE profiles
SET role = 'editor'
WHERE email = 'editor@example.com';

-- Or set to viewer (default)
UPDATE profiles
SET role = 'viewer'
WHERE email = 'viewer@example.com';
```

## Method 2: Using the Login Page (Self-Registration)

If you want users to sign up themselves:

1. **Enable Email Signup in Supabase**
   - Go to **Authentication** > **Providers**
   - Enable **Email** provider
   - Configure email templates if needed

2. **Create Signup Page** (optional - you can add this later)
   - Users can then sign up at `/signup` (if you create the page)
   - They'll automatically get `viewer` role
   - Admin can change roles later via `/users` page

## Method 3: Create Test Users via SQL

Run this in Supabase SQL Editor to create test users:

```sql
-- First, you need to create the auth user via Supabase Dashboard or Admin API
-- Then update/create their profile:

-- Admin user
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Editor user
INSERT INTO profiles (id, email, role)
SELECT id, email, 'editor'
FROM auth.users
WHERE email = 'editor@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'editor';

-- Viewer user (default)
INSERT INTO profiles (id, email, role)
SELECT id, email, 'viewer'
FROM auth.users
WHERE email = 'viewer@test.com'
ON CONFLICT (id) DO UPDATE SET role = 'viewer';
```

## Quick Setup: Create Admin User

1. **Create user in Supabase Dashboard:**
   - Authentication > Users > Add User
   - Email: `admin@example.com`
   - Password: `admin123` (change this!)
   - Auto Confirm: ✅

2. **Set admin role:**
   - SQL Editor > Run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

3. **Login:**
   - Go to `/login`
   - Use `admin@example.com` / `admin123`
   - You'll have full admin access!

## User Roles

- **admin**: Can manage users, upload, edit, delete documents
- **editor**: Can upload and edit documents
- **viewer**: Can only view and download documents

## Notes

- The `profiles` table is automatically created when a user signs up (via trigger)
- Default role is `viewer`
- Only admins can change user roles via the `/users` page
- Make sure you've run `lib/profiles-schema.sql` first!
