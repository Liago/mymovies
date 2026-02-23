-- User preferences table
create table if not exists user_preferences (
  user_id integer primary key references profiles(tmdb_id) on delete cascade,
  timeline_show_watched boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
