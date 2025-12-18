-- ================================================
-- SUPABASE AUTH + RLS SECURITY MIGRATION
-- ================================================
-- This migration secures all tables with Row Level Security
-- and integrates with Supabase Auth

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- 2. Add auth_user_id column to profiles
-- This links TMDB users to Supabase auth.users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);

-- 3. RLS Policies for PROFILES
-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- 4. RLS Policies for HISTORY
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = history.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = history.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own history"
  ON history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = history.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 5. RLS Policies for FAVORITES
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = favorites.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = favorites.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 6. RLS Policies for WATCHLIST
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = watchlist.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own watchlist"
  ON watchlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = watchlist.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 7. RLS Policies for RATINGS
CREATE POLICY "Users can view own ratings"
  ON ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = ratings.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own ratings"
  ON ratings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = ratings.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 8. RLS Policies for TRACKED_SHOWS
CREATE POLICY "Users can view own tracked shows"
  ON tracked_shows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = tracked_shows.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own tracked shows"
  ON tracked_shows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = tracked_shows.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 9. RLS Policies for WATCHED_EPISODES
CREATE POLICY "Users can view own watched episodes"
  ON watched_episodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = watched_episodes.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own watched episodes"
  ON watched_episodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = watched_episodes.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 10. RLS Policies for USER_LISTS
CREATE POLICY "Users can view own lists"
  ON user_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = user_lists.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own lists"
  ON user_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = user_lists.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 11. RLS Policies for LIST_ITEMS
CREATE POLICY "Users can view own list items"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists 
      JOIN profiles ON profiles.tmdb_id = user_lists.user_id
      WHERE list_items.list_id = user_lists.id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own list items"
  ON list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_lists 
      JOIN profiles ON profiles.tmdb_id = user_lists.user_id
      WHERE list_items.list_id = user_lists.id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 12. RLS Policies for RSS_FEEDS
CREATE POLICY "Users can view own rss feeds"
  ON rss_feeds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = rss_feeds.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own rss feeds"
  ON rss_feeds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.tmdb_id = rss_feeds.user_id 
      AND profiles.auth_user_id = auth.uid()
    )
  );

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
