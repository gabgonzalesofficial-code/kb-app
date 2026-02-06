-- Tools Table
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools(created_by);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);

-- Enable Row Level Security (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view tools
CREATE POLICY "Users can view tools"
  ON tools FOR SELECT
  USING (true);

-- Policy: Only admins and editors can insert tools
CREATE POLICY "Admins and editors can insert tools"
  ON tools FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Policy: Only admins and editors can update tools
CREATE POLICY "Admins and editors can update tools"
  ON tools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Policy: Only admins and editors can delete tools
CREATE POLICY "Admins and editors can delete tools"
  ON tools FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on UPDATE
CREATE TRIGGER update_tools_updated_at_trigger
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_tools_updated_at();
