-- Add tmdb_list_id column to user_lists table for sync tracking

ALTER TABLE user_lists 
ADD COLUMN IF NOT EXISTS tmdb_list_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tmdb_list_id ON user_lists(tmdb_list_id);

-- Add comment
COMMENT ON COLUMN user_lists.tmdb_list_id IS 'TMDB list ID for bidirectional sync';
