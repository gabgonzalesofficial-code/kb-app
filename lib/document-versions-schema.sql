-- Document versions table schema
-- Run this SQL in your Supabase SQL editor to create the document_versions table

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  s3_key TEXT NOT NULL,
  s3_bucket TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(document_id, version_number)
);

-- Create index on document_id for faster queries
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- Create index on version_number for sorting
CREATE INDEX IF NOT EXISTS idx_document_versions_version ON document_versions(document_id, version_number DESC);

-- Add version_number column to documents table if it doesn't exist
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Enable Row Level Security (RLS)
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all document versions
CREATE POLICY "Users can view all document versions"
  ON document_versions FOR SELECT
  USING (true);

-- Policy: Only admins and editors can insert document versions
CREATE POLICY "Admins and editors can insert document versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );
