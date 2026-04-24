-- Perfil de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  subscription_platform TEXT,  -- 'ios' | 'android' | null
  fcm_token TEXT,              -- Token para notificaciones push
  notify_tournament_starts BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system', -- 'dark' | 'light' | 'system'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens push (soporta múltiples dispositivos por usuario)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Jugadores favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,          -- ID del jugador en padelapi.org
  player_name TEXT NOT NULL,
  player_avatar_url TEXT,
  notify_match_start BOOLEAN DEFAULT TRUE,
  notify_score_changes BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

-- Historial de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL,           -- 'ios' | 'android'
  product_id TEXT NOT NULL,
  transaction_id TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Favorites: users can manage their own favorites
CREATE POLICY "Users can read own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Tablas de datos de la app (no user-specific, public read)
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
  UNIQUE(gender, position),
  UNIQUE(gender, player_id)
);

CREATE TABLE IF NOT EXISTS sync_state (
  source TEXT PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  records_count INTEGER,
  status TEXT,
  error_message TEXT
);

-- Public read access for app data tables (no auth required)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read rankings" ON rankings FOR SELECT USING (true);

-- Notificaciones enviadas (tracking para evitar duplicados)
CREATE TABLE IF NOT EXISTS sent_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- 'tournament_start' | 'match_start' | 'match_result'
  reference_id TEXT NOT NULL,      -- tournament_id o match_id
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_sent_notifications_user_type_ref ON sent_notifications(user_id, type, reference_id);

-- Public read access for app data tables (no auth required)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read rankings" ON rankings FOR SELECT USING (true);

-- No insert/update/delete from client — only backend sync service
CREATE POLICY "Deny all write tournaments" ON tournaments FOR ALL USING (false);
CREATE POLICY "Deny all write players" ON players FOR ALL USING (false);
CREATE POLICY "Deny all write matches" ON matches FOR ALL USING (false);
CREATE POLICY "Deny all write rankings" ON rankings FOR ALL USING (false);

-- Migración: añadir avatar_url a rankings si no existe (para DBs ya creadas)
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS avatar_url TEXT;
