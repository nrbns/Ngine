-- NGINE Database Schema (Complete - Life Profile & Aims & Gallery)
-- Run this in Supabase SQL Editor

-- Users table (extended with identity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  alias TEXT,
  core_identity TEXT, -- "Who I want to become"
  life_phase TEXT, -- Optional: "Student", "Professional", "Entrepreneur", etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life focus areas (Health, Career, Money, Learning, Discipline, Spiritual)
CREATE TABLE IF NOT EXISTS user_focus_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('Health', 'Career', 'Money', 'Learning', 'Discipline', 'Spiritual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, area)
);

-- Life Aims (long-term direction)
CREATE TABLE IF NOT EXISTS aims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resolutions table (linked to aims)
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  aim_id UUID REFERENCES aims(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  why TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  mdd TEXT NOT NULL,
  mdd_value INTEGER NOT NULL, -- Numeric value for calculations
  support TEXT NOT NULL CHECK (support IN ('strict', 'logical', 'gentle')),
  status TEXT NOT NULL DEFAULT 'aligned' CHECK (status IN ('aligned', 'drifting', 'broken', 'recovering')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recovery_start_date DATE,
  recovery_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  execution TEXT NOT NULL CHECK (execution IN ('yes', 'partial', 'no')),
  blocker TEXT,
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resolution_id, date)
);

-- GOAL PROOFS TABLE (NEW - Proof-of-progress gallery)
CREATE TABLE IF NOT EXISTS goal_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'screenshot')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID REFERENCES resolutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('drift', 'failure', 'summary', 'reflection')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily reflection insights (one per day per user)
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  insight_text TEXT NOT NULL,
  integrity_score INTEGER, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_user_focus_areas_user_id ON user_focus_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_aims_user_id ON aims(user_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_user_id ON resolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_aim_id ON resolutions(aim_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_status ON resolutions(status);
CREATE INDEX IF NOT EXISTS idx_checkins_resolution_id ON checkins(resolution_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_goal_proofs_resolution_id ON goal_proofs(resolution_id);
CREATE INDEX IF NOT EXISTS idx_goal_proofs_user_id ON goal_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_proofs_created_at ON goal_proofs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, date);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aims ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User focus areas policies
CREATE POLICY "Users can manage own focus areas" ON user_focus_areas
  FOR ALL USING (auth.uid() = user_id);

-- Aims policies
CREATE POLICY "Users can view own aims" ON aims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own aims" ON aims
  FOR ALL USING (auth.uid() = user_id);

-- Resolutions policies
CREATE POLICY "Users can view own resolutions" ON resolutions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resolutions" ON resolutions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resolutions" ON resolutions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resolutions" ON resolutions
  FOR DELETE USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resolutions
      WHERE resolutions.id = checkins.resolution_id
      AND resolutions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own checkins" ON checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM resolutions
      WHERE resolutions.id = checkins.resolution_id
      AND resolutions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checkins" ON checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM resolutions
      WHERE resolutions.id = checkins.resolution_id
      AND resolutions.user_id = auth.uid()
    )
  );

-- GOAL PROOFS POLICIES (NEW)
CREATE POLICY "Users can view own goal proofs" ON goal_proofs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goal proofs" ON goal_proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal proofs" ON goal_proofs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal proofs" ON goal_proofs
  FOR DELETE USING (auth.uid() = user_id);

-- Daily flags to track per-user daily state (check-ins, ad shown state)
CREATE TABLE IF NOT EXISTS user_daily_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checkin_done BOOLEAN NOT NULL DEFAULT FALSE,
  ad_shown BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_flags_user_date ON user_daily_flags(user_id, date);

-- Simple RLS policy: allow authenticated users to insert or update their own flags
ALTER TABLE user_daily_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can upsert their daily flags" ON user_daily_flags
FOR ALL
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Note: Consider using service-side functions for comprehensive business rules

-- AI insights policies
CREATE POLICY "Users can view own insights" ON ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" ON ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily reflections policies
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reflections" ON daily_reflections
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aims_updated_at BEFORE UPDATE ON aims
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resolutions_updated_at BEFORE UPDATE ON resolutions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();