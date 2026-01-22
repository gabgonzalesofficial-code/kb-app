# How to Set Up Supabase Service Role Key

## Step-by-Step Guide

### Step 1: Get Your Service Role Key from Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/bvlonkcgdlmvcxcwxqol
   - Or go to: https://supabase.com/dashboard → Select your project

2. **Navigate to Settings**
   - Click **"Settings"** in the left sidebar
   - Click **"API"** under Project Settings

3. **Find the Service Role Key**
   - Look for **"service_role"** key (NOT the anon key)
   - It will be a long string starting with `eyJ...`
   - ⚠️ **WARNING:** This key has admin privileges - keep it secret!

4. **Copy the Key**
   - Click the eye icon to reveal it
   - Copy the entire key

### Step 2: Add to Your .env File

1. **Open your `.env` file** in the project root
2. **Add this line** (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Example:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bG9ua2NnZGxtdmN4Y3d4cW9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyNzQxNiwiZXhwIjoyMDg0NjAzNDE2fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Your Dev Server

After adding the key, **restart your development server**:

1. Stop the current server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   # or
   bun dev
   ```

### Step 4: Verify It Works

1. Go to `/users` page (as admin)
2. Click **"+ Add User"**
3. Try creating a test user
4. If it works, you're all set!

## For Production (Vercel)

When deploying to Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Name: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: Paste your service role key
6. Select: Production, Preview, Development
7. Click **"Save"**
8. Redeploy your application

## Security Notes

- ⚠️ **NEVER** commit `.env` to Git (it's already in `.gitignore`)
- ⚠️ **NEVER** expose the service role key to the client
- ⚠️ This key bypasses Row Level Security - use only server-side
- ✅ The key is only used in API routes (server-side)
- ✅ It's safe to use in Next.js API routes

## Troubleshooting

### Still getting "Admin credentials not set"?
- ✅ Check `.env` file exists in project root
- ✅ Verify the key name is exactly `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Make sure there are no spaces around the `=`
- ✅ Restart your dev server after adding the key
- ✅ Check for typos in the key value

### Key not working?
- ✅ Make sure you copied the **service_role** key, not the **anon** key
- ✅ Verify the key is complete (it's a long string)
- ✅ Check Supabase Dashboard to ensure the key is active
