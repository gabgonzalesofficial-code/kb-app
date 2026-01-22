-- Fix S3 keys that have bucket name prefix
-- Run this SQL to remove "documents/" prefix from s3_key if it exists

-- Check current keys first:
-- SELECT id, s3_key FROM documents LIMIT 10;

-- Update keys that start with "documents/"
UPDATE documents
SET s3_key = SUBSTRING(s3_key FROM LENGTH('documents/') + 1)
WHERE s3_key LIKE 'documents/%';

-- Verify the fix:
-- SELECT id, s3_key FROM documents LIMIT 10;
