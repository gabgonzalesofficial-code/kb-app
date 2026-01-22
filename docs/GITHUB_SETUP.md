# GitHub Setup Guide

## Quick Setup Steps

### 1. Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `kb-app` (or your choice)
3. Description: "Knowledge Base Application with Next.js and Supabase"
4. Choose **Public** or **Private**
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 2. Push Your Code

Run these commands in your terminal:

```bash
# Check current status
git status

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: KB App with authentication and document management"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kb-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Verify on GitHub

- Go to your repository: `https://github.com/YOUR_USERNAME/kb-app`
- You should see all your files
- Check that `.env` is **NOT** visible (it's in `.gitignore`)

## Important: Never Commit Secrets

Your `.gitignore` already excludes:
- `.env*` files
- `node_modules/`
- `.next/`
- Other sensitive files

**Double-check** that `.env` is not committed:
```bash
git status
# Should NOT show .env file
```

## Next: Deploy to Vercel

After pushing to GitHub, follow the deployment guide in `docs/DEPLOYMENT.md`
