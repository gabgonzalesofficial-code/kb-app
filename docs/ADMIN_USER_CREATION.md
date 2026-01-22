# Admin User Creation Feature

## Overview

Admins can now create new users directly from the application UI without needing to use the Supabase Dashboard.

## Setup

### 1. Add Service Role Key to Environment Variables

Add this to your `.env` file (server-side only):

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To get your service role key:**
1. Go to Supabase Dashboard
2. Navigate to: Settings → API
3. Find "service_role" key (NOT the anon key)
4. Copy and add to `.env`

⚠️ **IMPORTANT:** Never expose this key to the client! It's only used server-side.

### 2. For Vercel Deployment

Add `SUPABASE_SERVICE_ROLE_KEY` to your Vercel environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key
3. Set it for Production, Preview, and Development environments

## Usage

### As Admin

1. Navigate to `/users` page
2. Click **"+ Add User"** button
3. Fill in the form:
   - **Email** (required)
   - **Password** (required, minimum 6 characters)
   - **Full Name** (optional)
   - **Role** (required: admin, editor, or viewer)
4. Click **"Create User"**

### Features

- ✅ Email validation
- ✅ Password strength check (minimum 6 characters)
- ✅ Auto-confirm email (user can login immediately)
- ✅ Automatic profile creation
- ✅ Error handling for duplicate emails
- ✅ Role assignment during creation

## Security

- Only admins can access this feature
- Service role key is server-side only
- Input validation on all fields
- Password requirements enforced
- Email format validation

## API Endpoint

### POST `/api/users`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "editor"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "editor"
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid email, weak password)
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

## Troubleshooting

### "Server configuration error: Admin credentials not set"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- Restart your dev server after adding the key
- For production, check Vercel environment variables

### "User with this email already exists"
- The email is already registered in Supabase
- Use a different email or update existing user's role instead

### "Failed to create user profile"
- Check that `profiles` table exists
- Verify the trigger `handle_new_user()` is set up
- Check Supabase logs for details
