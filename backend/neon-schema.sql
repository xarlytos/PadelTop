-- Neon PostgreSQL schema for app data (tournaments, players, matches, rankings, sync_state)
-- Run this in your Neon SQL editor

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  circuit TEXT,
  tier TEXT,
  city TEXT,
  country TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  season INTEGER,
  pairs_count INTEGER,
  surface TEXT,
  prize_money TEXT,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  country_code TEXT,
  age INTEGER,
  avatar_url TEXT,
  ranking INTEGER,
  points INTEGER,
  seed TEXT,
  category TEXT,
  birthplace TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id),
  tournament_name TEXT,
  round TEXT,
  status TEXT,
  category TEXT,
  start_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  court TEXT,
  team_a JSONB,
  team_b JSONB,
  sets JSONB,
  winner TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gender TEXT NOT NULL,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  player_id TEXT,
  player_name TEXT,
  player_country TEXT,
  player_country_code TEXT,
  points INTEGER,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gender, position)
);

CREATE TABLE IF NOT EXISTS sync_state (
  source TEXT PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  records_count INTEGER,
  status TEXT,
  error_message TEXT
);
