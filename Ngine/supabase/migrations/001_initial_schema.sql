-- NGINE Database Schema
-- Postgres via Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anon BOOLEAN DEFAULT false,
  email TEXT UNIQUE,
  last_checkin_reminder_at TIMESTAMP WITH TIME ZONE,
  notification_time TIME DEFAULT '09:00:00'
);

-- Resolutions table
CREATE TABLE resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  why TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  mdd_text TEXT NOT NULL, -- e.g., "5 days per week"
  mdd_value INTEGER NOT NULL, -- e.g., 5
  support_style TEXT NOT NULL CHECK (support_style IN ('strict', 'logical', 'gentle')),
  status TEXT NOT NULL DEFAULT 'aligned' CHECK (status IN ('aligned', 'drifting', 'broken', 'recovering')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recovery_start_date DATE,
  recovery_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins table
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  execution TEXT NOT NULL CHECK (execution IN ('yes', 'partial', 'no')),
  blocker TEXT,
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resolution_id, date)
);

-- AI insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('drift', 'failure', 'summary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_resolutions_user_id ON resolutions(user_id);
CREATE INDEX idx_resolutions_status ON resolutions(status);
CREATE INDEX idx_checkins_resolution_id ON daily_checkins(resolution_id);
CREATE INDEX idx_checkins_date ON daily_checkins(date);
CREATE INDEX idx_ai_insights_resolution_id ON ai_insights(resolution_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for resolutions updated_at
CREATE TRIGGER update_resolutions_updated_at BEFORE UPDATE ON resolutions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

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
CREATE POLICY "Users can view own checkins" ON daily_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resolutions 
      WHERE resolutions.id = daily_checkins.resolution_id 
      AND resolutions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own checkins" ON daily_checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM resolutions 
      WHERE resolutions.id = daily_checkins.resolution_id 
      AND resolutions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checkins" ON daily_checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM resolutions 
      WHERE resolutions.id = daily_checkins.resolution_id 
      AND resolutions.user_id = auth.uid()
    )
  );

-- AI insights policies
CREATE POLICY "Users can view own insights" ON ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resolutions 
      WHERE resolutions.id = ai_insights.resolution_id 
      AND resolutions.user_id = auth.uid()
    )
  );

