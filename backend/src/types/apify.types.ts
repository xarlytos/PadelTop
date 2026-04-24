export type ApifyAction =
  | 'get_rankings'
  | 'search_players'
  | 'get_player_profile'
  | 'get_circuit_stats'
  | 'get_titles_stats'
  | 'get_cupra_stats'
  | 'get_live_scores'
  | 'get_live_tournament'
  | 'get_news'
  | 'get_news_article'
  | 'get_tournaments'
  | 'get_tournament_detail'
  | 'get_countries';

export interface ApifyDatasetItem<T = unknown> {
  action: ApifyAction;
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}

// Raw ranking item shape (to be verified with real responses)
export interface ApifyRawRankingItem {
  position?: number;
  previous_position?: number;
  player?: {
    id?: string;
    name?: string;
    country?: string;
    country_code?: string;
    avatar_url?: string;
  };
  points?: number;
  // TODO: verify exact shape with real Apify response
  [key: string]: unknown;
}

// Raw tournament item shape (to be verified with real responses)
export interface ApifyRawTournament {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  circuit?: string;
  tier?: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  dates?: string;
  prize_money?: string;
  prize?: string;
  surface?: string;
  category?: string;
  status?: string;
  pairs_count?: number;
  season?: number;
  year?: number;
  // TODO: verify exact shape with real Apify response
  [key: string]: unknown;
}

// Raw player item shape (to be verified with real responses)
export interface ApifyRawPlayer {
  id?: string;
  slug?: string;
  name?: string;
  full_name?: string;
  country?: string;
  country_code?: string;
  nationality?: string;
  age?: number;
  avatar_url?: string;
  image_url?: string;
  ranking?: number;
  points?: number;
  seed?: string;
  // TODO: verify exact shape with real Apify response
  [key: string]: unknown;
}

// Raw match item shape (to be verified with real responses)
export interface ApifyRawMatch {
  id?: string;
  match_id?: string;
  tournament?: {
    id?: string;
    name?: string;
    logo?: string;
  };
  tournament_id?: string;
  tournament_name?: string;
  round?: string;
  status?: string;
  start_time?: string;
  datetime?: string;
  duration_minutes?: number;
  location?: string;
  location_flag?: string;
  country_code?: string;
  team_a?: ApifyRawTeam;
  team_b?: ApifyRawTeam;
  players?: ApifyRawPlayer[];
  score?: string;
  sets?: Array<{
    team_a?: number;
    team_b?: number;
    tiebreak_a?: number;
    tiebreak_b?: number;
  }>;
  current_game?: {
    team_a?: number;
    team_b?: number;
  };
  current_game_score?: {
    team_a?: string;
    team_b?: string;
  };
  current_set_games?: {
    team_a?: number;
    team_b?: number;
    tiebreak_a?: number;
    tiebreak_b?: number;
  };
  server?: string;
  // TODO: verify exact shape with real Apify response
  [key: string]: unknown;
}

export interface ApifyRawTeam {
  players?: ApifyRawPlayer[];
  // TODO: verify exact shape with real Apify response
  [key: string]: unknown;
}

export interface ApifyRunInput {
  action: ApifyAction;
  [key: string]: unknown;
}
