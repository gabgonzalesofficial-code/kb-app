# Deployment Guide: GitHub + Vercel

## Prerequisites

1. GitHub account: https://github.com
2. Vercel account: https://vercel.com (sign in with GitHub)

## Step 1: Push Code to GitHub

### Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit: KB App with authentication and document management"
```

### Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `kb-app` (or your preferred name)
3. Choose **Public** or **Private**
4. **Don't** check "Initialize with README"
5. Click **"Create repository"**

### Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/gabgonzalesofficial-code/kb-app.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

## Step 2: Deploy to Vercel

### Import Project

1. Go to: https://vercel.com
2. Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Find and select your `kb-app` repository
5. Click **"Import"**

### Configure Build Settings

Vercel should auto-detect Next.js, but verify:
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Add Environment Variables

**IMPORTANT:** Add these in Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://bvlonkcgdlmvcxcwxqol.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=documents
AWS_S3_ENDPOINT=https://bvlonkcgdlmvcxcwxqol.storage.supabase.co/storage/v1/s3
```

**To add env vars:**
1. In project settings, go to **"Environment Variables"**
2. Add each variable for **Production**, **Preview**, and **Development**
3. Click **"Save"**

### Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://kb-app-xxxxx.vercel.app`

## Step 3: Verify Deployment

1. Visit your Vercel URL
2. Test login functionality
3. Test document upload/search

## Auto-Deployments

- **Every push to `main`** → Auto-deploys to production
- **Pull requests** → Creates preview deployments
- **All deployments** are visible in Vercel dashboard

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### Environment Variables Not Working
- Make sure they're set in Vercel, not just `.env`
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new env vars

### API Routes Failing
- Verify Supabase URL is accessible
- Check CORS settings in Supabase
- Ensure middleware is working correctly

## Next Steps

- Add custom domain in Vercel project settings
- Set up preview deployments for pull requests
- Configure analytics if needed
