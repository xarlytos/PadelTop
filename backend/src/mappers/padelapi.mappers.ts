import type {
  RankingEntry,
  Tournament,
  TournamentStatus,
  Player,
  Team,
  Match,
  MatchStatus,
  SetScore,
} from '../types/domain.types';

export class DataMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataMappingError';
  }
}

// --- Helpers ---

function pickString(obj: unknown, keys: string[], fallback = ''): string {
  if (!obj || typeof obj !== 'object') return fallback;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] != null) {
      const val = record[key];
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
    }
  }
  return fallback;
}

function pickNumber(obj: unknown, keys: string[], fallback = 0): number {
  if (!obj || typeof obj !== 'object') return fallback;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] != null) {
      const n = Number(record[key]);
      if (!isNaN(n)) return n;
    }
  }
  return fallback;
}

function normalizeCountryCode(code?: string): string {
  if (!code) return 'ES';
  return code.toUpperCase();
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function normalizeTournamentStatus(status?: string, startDate?: string, endDate?: string): TournamentStatus {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'ongoing' || s === 'in_progress' || s === 'live') return 'ongoing';
  if (s === 'finished' || s === 'completed' || s === 'done' || s === 'ended') return 'finished';

  // Fallback por fechas si la API no envia status
  if (startDate && endDate) {
    const now = new Date();
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) return 'ongoing';
    if (now > end) return 'finished';
  }

  return 'upcoming';
}

function inferCircuit(name?: string, level?: string): string {
  const n = (name || '').toLowerCase();
  const l = (level || '').toLowerCase();
  if (n.includes('premier') || l.includes('major') || l.includes('finals') || l.includes('p1') || l.includes('p2')) return 'Premier Padel';
  if (n.includes('cupra') || l.includes('fip')) return 'FIP';
  return 'FIP';
}

function inferTier(level?: string): string {
  const l = (level || '').toLowerCase();
  if (l.includes('major')) return 'Major';
  if (l.includes('p1')) return 'P1';
  if (l.includes('p2')) return 'P2';
  if (l.includes('master')) return 'Master';
  if (l.includes('finals')) return 'Master';
  if (l.includes('open')) return 'Open';
  return 'Open';
}

function normalizeMatchStatus(status?: string): MatchStatus {
  const s = (status || '').toLowerCase();
  if (s === 'playing' || s === 'live' || s === 'in_progress') return 'live';
  if (s === 'scheduled' || s === 'pending' || s === 'upcoming' || s === 'not_started') return 'upcoming';
  return 'finished';
}

function parsePlayersFromName(name?: string): { teamA: Player[]; teamB: Player[] } {
  if (!name || !name.includes(' - ')) return { teamA: [], teamB: [] };
  const [left, right] = name.split(' - ');
  const parseSide = (side: string): Player[] =>
    side
      .split('/')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: n, name: n, country: 'Unknown', countryCode: 'ES' }));
  return { teamA: parseSide(left), teamB: parseSide(right) };
}

function parseDurationMinutes(d?: unknown): number | undefined {
  if (!d) return undefined;
  const str = String(d).trim();
  // Format: "01:30" (1h 30m) or "90" (minutes)
  if (str.includes(':')) {
    const [h, m] = str.split(':').map((s) => parseInt(s, 10));
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }
  const n = parseInt(str, 10);
  if (!isNaN(n)) return n;
  return undefined;
}

function parseDate(d?: string | number): string {
  if (!d) return new Date().toISOString().split('T')[0];
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
  return parsed.toISOString().split('T')[0];
}

// --- Player ---

function mapPlayer(raw: unknown): Player {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'unknown',
      name: 'Unknown',
      country: 'Unknown',
      countryCode: 'ES',
    };
  }

  const obj = raw as Record<string, unknown>;

  return {
    id: String(pickString(obj, ['id', 'slug'], 'unknown')),
    name: pickString(obj, ['name', 'full_name', 'fullName'], 'Unknown'),
    country: pickString(obj, ['nationality', 'country', 'country_name'], 'Unknown'),
    countryCode: normalizeCountryCode(pickString(obj, ['nationality', 'country_code', 'countryCode', 'iso_code'])),
    age: pickNumber(obj, ['age', 'years_old'], undefined as unknown as number) || undefined,
    avatarUrl: pickString(obj, ['photo_url', 'photoUrl', 'avatar_url', 'avatarUrl', 'image_url', 'imageUrl']) || undefined,
    ranking: pickNumber(obj, ['ranking', 'rank', 'position'], undefined as unknown as number) || undefined,
    points: pickNumber(obj, ['points', 'score', 'total_points'], undefined as unknown as number) || undefined,
    seed: pickString(obj, ['seed', 'seeding']) || undefined,
    category: pickString(obj, ['category', 'gender', 'sex'], undefined as any) || undefined,
    birthplace: pickString(obj, ['birthplace', 'birth_place', 'birthPlace', 'city']) || undefined,
  };
}

// --- Team ---

function mapTeam(raw: unknown): Team {
  if (!Array.isArray(raw)) {
    return { players: [] };
  }
  return {
    players: raw.map(mapPlayer),
  };
}

// --- Rankings ---

export function mapPadelapiRankings(raw: unknown): RankingEntry[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for rankings data');
  }

  const entries: RankingEntry[] = raw
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const obj = item as Record<string, unknown>;

      const player = mapPlayer(obj);
      const position = pickNumber(obj, ['ranking', 'rank', 'position'], 0);
      const points = pickNumber(obj, ['points', 'score'], 0);

      if (!position) return null;

      const entry: RankingEntry = {
        position,
        player: {
          ...player,
          ranking: position,
          points,
        },
        points,
      };
      return entry;
    })
    .filter((e): e is RankingEntry => e !== null)
    .sort((a, b) => a.position - b.position);

  return entries;
}

// --- Tournaments ---

export function mapPadelapiTournaments(raw: unknown): Tournament[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for tournaments data');
  }

  const tournaments = raw.map((item: unknown) => {
    if (!item || typeof item !== 'object') {
      throw new DataMappingError('Expected object for tournament item');
    }
    const obj = item as Record<string, unknown>;

    const id = String(pickString(obj, ['id', 'slug'], 'unknown'));
    const name = pickString(obj, ['name', 'title'], 'Unknown Tournament');
    const start = parseDate(pickString(obj, ['start_date', 'startDate']));
    const end = parseDate(pickString(obj, ['end_date', 'endDate']));

    const level = pickString(obj, ['level']);

    return {
      id,
      name,
      circuit: inferCircuit(name, level),
      tier: inferTier(level),
      city: pickString(obj, ['location', 'city', 'venue_city'], 'Unknown'),
      country: pickString(obj, ['country', 'location_country', 'venue_country', 'nation'], 'Unknown'),
      startDate: start,
      endDate: end,
      prizeMoney: '€ 0',
      surface: pickString(obj, ['surface', 'court_surface', 'court_type'], 'Cemento'),
      category: pickString(obj, ['category', 'gender', 'sex', 'division'], 'both'),
      status: normalizeTournamentStatus(pickString(obj, ['status', 'state']), start, end),
      pairsCount: undefined,
      season: pickNumber(obj, ['season', 'year'], new Date().getFullYear()),
    };
  });

  // Sort: ongoing first, then upcoming by startDate asc, then finished by endDate desc
  const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, finished: 2 };
  return tournaments.sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 3;
    const orderB = statusOrder[b.status] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    if (a.status === 'finished') {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

export function mapPadelapiTournament(raw: unknown): Tournament {
  const arr = mapPadelapiTournaments(Array.isArray(raw) ? raw : [raw]);
  if (arr.length === 0) {
    throw new DataMappingError('Expected tournament data');
  }
  return arr[0];
}

// --- Matches ---

function parseSetScore(value?: string): { score: number; tiebreak?: number } | null {
  if (!value) return null;
  // Format: "6" or "6(4)" — tiebreak is inside parentheses
  const match = value.match(/^(\d+)\((\d+)\)$/);
  if (match) {
    return { score: parseInt(match[1], 10), tiebreak: parseInt(match[2], 10) };
  }
  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    return { score: num };
  }
  return null;
}

function parseScore(scoreRaw?: unknown): SetScore[] {
  if (!scoreRaw || scoreRaw === 'hidden_free_plan') return [];

  // PadelAPI returns score as an array of objects: [{team_1: "6(4)", team_2: "7"}, ...]
  if (Array.isArray(scoreRaw)) {
    const sets: SetScore[] = [];
    for (const item of scoreRaw) {
      const parsedA = parseSetScore(String(item?.team_1 ?? item?.teamA ?? ''));
      const parsedB = parseSetScore(String(item?.team_2 ?? item?.teamB ?? ''));
      if (!parsedA || !parsedB) continue;
      const set: SetScore = { teamA: parsedA.score, teamB: parsedB.score };
      if (parsedA.tiebreak !== undefined) set.tieBreakA = parsedA.tiebreak;
      if (parsedB.tiebreak !== undefined) set.tieBreakB = parsedB.tiebreak;
      sets.push(set);
    }
    return sets;
  }

  // Fallback: some sources return score as a string like "6-4 6-1"
  const scoreStr = String(scoreRaw);
  const sets: SetScore[] = [];
  const parts = scoreStr.trim().split(/\s+/);
  parts.forEach((part) => {
    const [a, b] = part.split('-').map((s) => parseInt(s, 10));
    if (!isNaN(a) && !isNaN(b)) {
      sets.push({ teamA: a, teamB: b });
    }
  });
  return sets;
}

export function mapPadelapiMatches(raw: unknown): Match[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for matches data');
  }

  const matches = raw.map((item: unknown) => {
    if (!item || typeof item !== 'object') {
      throw new DataMappingError('Expected object for match item');
    }
    const obj = item as Record<string, unknown>;

    const playersObj = (obj.players || {}) as Record<string, unknown>;
    let team1 = Array.isArray(playersObj.team_1) ? playersObj.team_1 : [];
    let team2 = Array.isArray(playersObj.team_2) ? playersObj.team_2 : [];

    // Fallback: extract player names from the match name field when arrays are empty
    if (team1.length === 0 && team2.length === 0) {
      const matchName = pickString(obj, ['name']);
      if (matchName) {
        const parsed = parsePlayersFromName(matchName);
        team1 = parsed.teamA as unknown[];
        team2 = parsed.teamB as unknown[];
      }
    }

    const scoreRaw = obj.score ?? obj.result;
    const sets = parseScore(scoreRaw);

    // Derive tournament info from connections if available
    const connections = (obj.connections || {}) as Record<string, unknown>;
    const tournamentUrl = pickString(connections, ['tournament']);
    const tournamentId = tournamentUrl ? tournamentUrl.split('/').pop() || 'unknown' : 'unknown';

    const winnerRaw = pickString(obj, ['winner']);
    const winner: 'team_1' | 'team_2' | undefined =
      winnerRaw === 'team_1' || winnerRaw === 'team_2' ? winnerRaw : undefined;

    return {
      id: String(pickString(obj, ['id', 'match_id'], 'unknown')),
      tournamentId,
      tournamentName: pickString(obj, ['tournament_name', 'tournamentName'], 'Unknown Tournament'),
      tournamentLogo: undefined,
      round: pickString(obj, ['round_name', 'roundName', 'round'], 'Unknown'),
      status: normalizeMatchStatus(pickString(obj, ['status', 'state'])),
      category: pickString(obj, ['category', 'gender', 'sex']) || undefined,
      startTime: pickString(obj, ['started_time', 'played_at', 'playedAt', 'start_time', 'startTime', 'datetime']) || undefined,
      durationMinutes: parseDurationMinutes(obj.duration) || pickNumber(obj, ['duration_minutes', 'durationMinutes'], undefined as unknown as number) || undefined,
      location: pickString(obj, ['location', 'venue']) || undefined,
      locationFlag: undefined,
      court: pickString(obj, ['court']) || undefined,
      courtOrder: pickNumber(obj, ['court_order', 'courtOrder'], undefined as unknown as number) || undefined,
      teamA: mapTeam(team1),
      teamB: mapTeam(team2),
      sets,
      currentGame: undefined,
      currentGameScore: undefined,
      currentSetGames: undefined,
      server: undefined,
      winner,
    };
  });

  // Sort: live first, then upcoming by startTime asc, then finished by startTime desc
  const statusOrder: Record<string, number> = { live: 0, upcoming: 1, finished: 2 };
  return matches.sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 3;
    const orderB = statusOrder[b.status] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    if (a.status === 'finished') {
      return new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime();
    }
    return new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime();
  });
}

export function mapPadelapiMatch(raw: unknown): Match {
  const arr = mapPadelapiMatches(Array.isArray(raw) ? raw : [raw]);
  if (arr.length === 0) {
    throw new DataMappingError('Expected match data');
  }
  return arr[0];
}

// --- Players list ---

export function mapPadelapiPlayers(raw: unknown): Player[] {
  if (!Array.isArray(raw)) {
    throw new DataMappingError('Expected array for players data');
  }
  return raw.map(mapPlayer);
}

export function mapPadelapiPlayer(raw: unknown): Player {
  if (Array.isArray(raw)) {
    const arr = mapPadelapiPlayers(raw);
    if (arr.length === 0) throw new DataMappingError('Expected player data');
    return arr[0];
  }
  if (!raw || typeof raw !== 'object') {
    throw new DataMappingError('Expected object for player data');
  }
  return mapPlayer(raw);
}
