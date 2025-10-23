-- Create bet_activities table
CREATE TABLE IF NOT EXISTS bet_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  option INTEGER NOT NULL CHECK (option IN (0, 1)),
  amount TEXT NOT NULL,
  shares TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  market_title TEXT,
  option_a TEXT,
  option_b TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bet_activities_market_id ON bet_activities(market_id);
CREATE INDEX IF NOT EXISTS idx_bet_activities_user_address ON bet_activities(user_address);
CREATE INDEX IF NOT EXISTS idx_bet_activities_created_at ON bet_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_market_id ON comments(market_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_address ON comments(user_address);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE bet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for bet_activities
CREATE POLICY "Anyone can read bet activities" ON bet_activities
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert bet activities" ON bet_activities
  FOR INSERT WITH CHECK (true);

-- Create policies for comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (user_address = current_setting('request.jwt.claims', true)::json->>'user_address');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();