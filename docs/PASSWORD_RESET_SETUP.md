# Password Reset Setup Guide

## Supabase Configuration

For password reset to work correctly, you need to configure the redirect URL in your Supabase project:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Configure Authentication Settings**
   - Go to **Authentication** → **URL Configuration**
   - Add your site URL to **Site URL** (e.g., `http://localhost:3000` for development or your production URL)
   - Add redirect URLs:
     - `http://localhost:3000/reset-password` (for development)
     - `https://yourdomain.com/reset-password` (for production)

3. **Email Template Configuration**
   - Go to **Authentication** → **Email Templates**
   - Select **Reset Password** template
   - The redirect link should point to: `{{ .SiteURL }}/reset-password`
   - Make sure email sending is enabled

## How It Works

1. User clicks "Forgot password?" on login page
2. User enters email on `/forgot-password` page
3. Supabase sends email with reset link
4. User clicks link → redirected to `/reset-password` with hash fragments
5. Hash fragments are exchanged for a session
6. User sets new password
7. User is redirected to login page

## Troubleshooting

### "Invalid or expired reset link" Error

**Possible causes:**
1. Redirect URL not configured in Supabase
2. Hash fragments not being processed correctly
3. Token expired (links expire after 1 hour)
4. Browser blocking hash fragments

**Solutions:**
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Ensure redirect URL matches exactly: `yourdomain.com/reset-password`
3. Request a new reset link (they expire after 1 hour)
4. Check browser console for errors
5. Make sure you're using the exact URL from the email (don't copy/paste and modify)

### Email Not Received

1. Check spam folder
2. Verify email address is correct
3. Check Supabase Dashboard → Authentication → Users (verify user exists)
4. Check email sending configuration in Supabase

### Hash Fragments Not Working

If hash fragments aren't being processed:
1. Check browser console for errors
2. Ensure you're accessing the page directly from the email link
3. Don't navigate away before the hash is processed
4. Try in an incognito/private window

## Testing

1. Go to `/forgot-password`
2. Enter a valid user email
3. Check email inbox
4. Click the reset link in the email
5. Should redirect to `/reset-password` with hash fragments
6. Enter new password
7. Should redirect to login page
