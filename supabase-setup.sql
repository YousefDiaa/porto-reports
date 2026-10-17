-- ==========================================
-- Porto Sporting Club Reports - Supabase SQL
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Specializations table
CREATE TABLE IF NOT EXISTS specializations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#003C71',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  content           JSONB NOT NULL DEFAULT '{}',
  content_html      TEXT NOT NULL DEFAULT '',
  specialization_id UUID REFERENCES specializations(id) ON DELETE SET NULL,
  report_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_spec ON reports(specialization_id);
CREATE INDEX IF NOT EXISTS idx_reports_published ON reports(is_published);
CREATE INDEX IF NOT EXISTS idx_reports_published_date ON reports(is_published, report_date DESC);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS)
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow full access (dashboard is protected via NextAuth)
CREATE POLICY "Allow all on reports"
  ON reports FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Allow all on specializations"
  ON specializations FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- 6. Sample specializations (optional, remove if not needed)
INSERT INTO specializations (name, description, color) VALUES
  ('كرة القدم', 'أكاديمية وفريق كرة القدم', '#003C71'),
  ('السباحة', 'أكاديمية السباحة', '#2563EB'),
  ('التنس', 'أكاديمية التنس', '#16A34A'),
  ('الإدارة', 'تقارير إدارية وتنظيمية', '#9333EA'),
  ('البادل', 'أكاديمية وبطولات البادل', '#EA580C')
ON CONFLICT (name) DO NOTHING;
