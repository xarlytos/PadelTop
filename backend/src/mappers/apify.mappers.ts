import type {
  ApifyRawRankingItem,
  ApifyRawTournament,
  ApifyRawPlayer,
  ApifyRawMatch,
  ApifyRawTeam,
} from '../types/apify.types';
import type {
  RankingEntry,
  Tournament,
  TournamentStatus,
  Player,
  Team,
  Match,
  MatchStatus,
  SetScore,
  GameScore,
  CurrentGameScore,
  CurrentSetGames,
} from '../types/domain.types';

export class DataMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataMappingError';
  }
}

// --- Helpers ---

function normalizeCountryCode(code?: string): string {
  if (!code) return 'ES';
  return code.toUpperCase();
}

function normalizeStatus(status?: string): TournamentStatus {
  const s = (status || '').toLowerCase();
  if (s === 'ongoing' || s === 'in_progress' || s === 'live') return 'ongoing';
  if (s === 'upcoming' || s === 'scheduled' || s === 'pending') return 'upcoming';
  if (s === 'finished' || s === 'completed' || s === 'done') return 'finished';
  return 'upcoming';
}

function normalizeMatchStatus(status?: string): MatchStatus {
  const s = (status || '').toLowerCase();
  if (s === 'live' || s === 'in_progress') return 'live';
  if (s === 'upcoming' || s === 'scheduled' || s === 'pending') return 'upcoming';
  return 'finished';
}

function parseDate(d?: string): string {
  if (!d) return new Date().toISOString().split('T')[0];
  // Try to normalize common date formats
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
  return parsed.toISOString().split('T')[0];
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

// --- Player / Team ---

function mapApifyPlayerInternal(raw: ApifyRawPlayer): Player {
  return {
    id: safeString(raw.id || raw.slug, 'unknown'),
    name: safeString(raw.name || raw.full_name, 'Unknown'),
    country: safeString(raw.country || raw.nationality, 'Unknown'),
    countryCode: normalizeCountryCode(safeString(raw.country_code)),
    age: typeof raw.age === 'number' ? raw.age : undefined,
    avatarUrl: safeString(raw.avatar_url || raw.image_url) || undefined,
    ranking: typeof raw.ranking === 'number' ? raw.ranking : undefined,
    points: typeof raw.points === 'number' ? raw.points : undefined,
    seed: safeString(raw.seed) || undefined,
  };
}

function mapApifyTeam(raw?: ApifyRawTeam): Team {
  const players = Array.isArray(raw?.players)
    ? raw.players.map(mapApifyPlayer)
    : [];
  return { players };
}

// --- Rankings ---

export function mapApifyRankings(raw: unknown): RankingEntry[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for rankings data');
  }

  return raw.map((item: ApifyRawRankingItem, index: number) => {
    const playerRaw = item.player || {};
    const player = mapApifyPlayer(playerRaw as ApifyRawPlayer);

    return {
      position: safeNumber(item.position, index + 1),
      previousPosition:
        typeof item.previous_position === 'number'
          ? item.previous_position
          : undefined,
      player,
      points: safeNumber(item.points),
    };
  });
}

// --- Tournaments ---

export function mapApifyTournaments(raw: unknown): Tournament[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for tournaments data');
  }

  return raw.map((item: ApifyRawTournament) => {
    const id = safeString(item.id || item.slug, 'unknown');
    const name = safeString(item.name || item.title, 'Unknown Tournament');
    const start = parseDate(item.start_date);
    const end = parseDate(item.end_date);

    return {
      id,
      name,
      circuit: safeString(item.circuit, 'FIP'),
      tier: safeString(item.tier, 'Open'),
      city: safeString(item.city, 'Unknown'),
      country: safeString(item.country, 'Unknown'),
      startDate: start,
      endDate: end,
      prizeMoney: safeString(item.prize_money || item.prize, '€ 0'),
      surface: safeString(item.surface, 'Cemento'),
      category: safeString(item.category, 'both'),
      status: normalizeStatus(item.status),
      pairsCount: typeof item.pairs_count === 'number' ? item.pairs_count : undefined,
      season: safeNumber(item.season || item.year, new Date().getFullYear()),
    };
  });
}

export function mapApifyTournament(raw: unknown): Tournament {
  const arr = mapApifyTournaments(Array.isArray(raw) ? raw : [raw]);
  if (arr.length === 0) {
    throw new DataMappingError('Expected tournament data');
  }
  return arr[0];
}

// --- Matches ---

function mapApifySet(raw: { team_a?: number; team_b?: number; tiebreak_a?: number; tiebreak_b?: number }): SetScore {
  return {
    teamA: safeNumber(raw.team_a),
    teamB: safeNumber(raw.team_b),
    tieBreakA: typeof raw.tiebreak_a === 'number' ? raw.tiebreak_a : undefined,
    tieBreakB: typeof raw.tiebreak_b === 'number' ? raw.tiebreak_b : undefined,
  };
}

function mapApifyGameScore(raw?: { team_a?: number; team_b?: number }): GameScore | undefined {
  if (!raw) return undefined;
  return {
    teamA: safeNumber(raw.team_a),
    teamB: safeNumber(raw.team_b),
  };
}

function mapApifyCurrentGameScore(raw?: { team_a?: string; team_b?: string }): CurrentGameScore | undefined {
  if (!raw) return undefined;
  const a = safeString(raw.team_a);
  const b = safeString(raw.team_b);
  if (!a && !b) return undefined;
  return { teamA: a || '0', teamB: b || '0' };
}

function mapApifyCurrentSetGames(raw?: { team_a?: number; team_b?: number; tiebreak_a?: number; tiebreak_b?: number }): CurrentSetGames | undefined {
  if (!raw) return undefined;
  return {
    teamA: safeNumber(raw.team_a),
    teamB: safeNumber(raw.team_b),
    tieBreakA: typeof raw.tiebreak_a === 'number' ? raw.tiebreak_a : undefined,
    tieBreakB: typeof raw.tiebreak_b === 'number' ? raw.tiebreak_b : undefined,
  };
}

export function mapApifyMatches(raw: unknown): Match[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for matches data');
  }

  return raw.map((item: ApifyRawMatch) => {
    const tournament = item.tournament || {};
    const sets = Array.isArray(item.sets)
      ? item.sets.map(mapApifySet)
      : [];

    // Try to derive sets from score string if sets array is missing
    if (sets.length === 0 && typeof item.score === 'string' && item.score.trim()) {
      const scoreParts = item.score.trim().split(/\s+/);
      scoreParts.forEach((part) => {
        const [a, b] = part.split('-').map((s) => parseInt(s, 10));
        if (!isNaN(a) && !isNaN(b)) {
          sets.push({ teamA: a, teamB: b });
        }
      });
    }

    return {
      id: safeString(item.id || item.match_id, 'unknown'),
      tournamentId: safeString(tournament.id || item.tournament_id, 'unknown'),
      tournamentName: safeString(tournament.name || item.tournament_name, 'Unknown Tournament'),
      tournamentLogo: safeString(tournament.logo) || undefined,
      round: safeString(item.round, 'Unknown'),
      status: normalizeMatchStatus(item.status),
      startTime: item.start_time || item.datetime || undefined,
      durationMinutes: typeof item.duration_minutes === 'number' ? item.duration_minutes : undefined,
      location: safeString(item.location) || undefined,
      locationFlag: safeString(item.location_flag || item.country_code) || undefined,
      teamA: mapApifyTeam(item.team_a),
      teamB: mapApifyTeam(item.team_b),
      sets,
      currentGame: mapApifyGameScore(item.current_game),
      currentGameScore: mapApifyCurrentGameScore(item.current_game_score),
      currentSetGames: mapApifyCurrentSetGames(item.current_set_games),
      server: item.server === 'A' || item.server === 'B' ? item.server : undefined,
    };
  });
}

export function mapApifyMatch(raw: unknown): Match {
  const arr = mapApifyMatches(Array.isArray(raw) ? raw : [raw]);
  if (arr.length === 0) {
    throw new DataMappingError('Expected match data');
  }
  return arr[0];
}

// --- Players ---

export function mapApifyPlayers(raw: unknown): Player[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for players data');
  }
  return raw.map((item: ApifyRawPlayer) => mapApifyPlayerInternal(item));
}

export function mapApifyPlayer(raw: unknown): Player {
  if (Array.isArray(raw)) {
    const arr = mapApifyPlayers(raw);
    if (arr.length === 0) throw new DataMappingError('Expected player data');
    return arr[0];
  }
  if (!raw || typeof raw !== 'object') {
    throw new DataMappingError('Expected object for player data');
  }
  return mapApifyPlayerInternal(raw as ApifyRawPlayer);
}
