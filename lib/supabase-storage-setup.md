# Supabase Storage Bucket Setup

Since you're using Supabase Storage (not AWS S3), you need to:

1. **Go to Supabase Storage Dashboard:**
   https://supabase.com/dashboard/project/bvlonkcgdlmvcxcwxqol/storage/buckets

2. **Create a bucket:**
   - Click "New bucket"
   - Name: `documents` (or any name you prefer)
   - Public bucket: ✅ Check this (or uncheck if you want private)
   - Click "Create bucket"

3. **Add bucket name to .env:**
   ```
   AWS_S3_BUCKET=documents
   ```

4. **Get Storage credentials:**
   - Go to: https://supabase.com/dashboard/project/bvlonkcgdlmvcxcwxqol/settings/storage
   - The endpoint is already in your .env: `AWS_S3_ENDPOINT`
   - Access key and secret are the same as your API keys
