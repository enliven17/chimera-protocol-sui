-- Temporarily disable RLS for testing
ALTER TABLE bet_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Grant public access for testing
GRANT ALL ON bet_activities TO anon;
GRANT ALL ON comments TO anon;

-- Alternative: Create more permissive policies
DROP POLICY IF EXISTS "Anyone can read bet activities" ON bet_activities;
DROP POLICY IF EXISTS "Anyone can insert bet activities" ON bet_activities;

CREATE POLICY "Public read bet activities" ON bet_activities
  FOR ALL USING (true);

CREATE POLICY "Public insert bet activities" ON bet_activities
  FOR INSERT WITH CHECK (true);