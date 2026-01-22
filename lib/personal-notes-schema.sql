-- Personal Notes Table
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS personal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_personal_notes_user_id ON personal_notes(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_personal_notes_created_at ON personal_notes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notes
CREATE POLICY "Users can view own notes"
  ON personal_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
  ON personal_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON personal_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
  ON personal_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personal_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER personal_notes_updated_at
  BEFORE UPDATE ON personal_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_personal_notes_updated_at();
