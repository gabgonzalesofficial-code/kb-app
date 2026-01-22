# Schema Update Summary

Your database schema has been updated to match your existing structure:

## Profiles Table
- `id` (UUID, references auth.users)
- `full_name` (TEXT)
- `role` (TEXT: 'admin', 'editor', 'viewer')

## Documents Table  
- `id` (UUID)
- `title` (TEXT)
- `description` (TEXT)
- `s3_key` (TEXT)
- `content_text` (TEXT)
- `created_by` (UUID, references profiles.id)
- `created_at` (TIMESTAMP)

## Changes Made

1. **Removed versioning** - Your schema doesn't include version_number or document_versions table
2. **Updated field names**:
   - `uploaded_by` → `created_by` (references profiles.id)
   - Removed: `filename`, `mime_type`, `file_size`, `s3_bucket`, `version_number`, `updated_at`
   - Added: `content_text` for full-text search
3. **Profile changes**:
   - Removed `email` from profiles (email comes from auth.users)
   - Added `full_name` support
4. **Search updated** to use `content_text` field matching your GIN index

## Next Steps

1. Make sure your `profiles` table has the trigger to auto-create profiles on user signup
2. Update existing profiles to set `full_name` if needed
3. The app now matches your schema structure!
