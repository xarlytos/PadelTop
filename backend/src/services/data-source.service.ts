import { query } from './neon-client';
import * as padelApi from './padelapi.service';
import * as padelFipScraper from './padelfip-scraper.service';
import {
  mapPadelapiTournament,
  mapPadelapiMatch,
  mapPadelapiMatches,
  mapPadelapiPlayer,
  DataMappingError,
} from '../mappers/padelapi.mappers';
import type {
  RankingEntry,
  Tournament,
  Match,
  Player,
  MatchStatsData,
  PointEvent,
} from '../types/domain.types';

// No mock fallbacks - app uses only real API data

// --- Rankings ---

export async function getRankings(gender?: 'male' | 'female'): Promise<RankingEntry[]> {
  const g = gender || 'male';
  const result = await query(
    'SELECT DISTINCT ON (player_id) * FROM rankings WHERE gender = $1 ORDER BY player_id, position ASC',
    [g]
  );

  const entries = (result.rows || []).map((row: any) => ({
    position: row.position,
    previousPosition: row.previous_position,
    player: {
      id: row.player_id || '',
      name: row.player_name || 'Unknown',
      country: row.player_country || 'Unknown',
      countryCode: row.player_country_code || 'ES',
      avatarUrl: row.avatar_url || undefined,
    },
    points: row.points || 0,
  }));

  // Re-sort by position after deduplication
  return entries.sort((a, b) => a.position - b.position);
}

// --- Tournaments ---

export async function getTournaments(): Promise<Tournament[]> {
  const result = await query(
    'SELECT * FROM tournaments ORDER BY status ASC, start_date ASC'
  );

  const all = (result.rows || []).map(mapDbTournament);

  const currentYear = new Date().getFullYear();
  const filtered = all.filter((t) => t.circuit !== 'FIP' && t.season >= currentYear - 1);

  const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, finished: 2 };
  const sorted = filtered.sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 3;
    const orderB = statusOrder[b.status] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    if (a.status === 'finished') {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const ongoing = sorted.filter((t) => t.status === 'ongoing');
  const upcoming = sorted.filter((t) => t.status === 'upcoming').slice(0, 19);
  const finished = sorted.filter((t) => t.status === 'finished').slice(0, 1);

  return [...ongoing, ...upcoming, ...finished];
}

export async function getTournamentById(tournamentId: string): Promise<Tournament> {
  const result = await query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);

  if (result.rows.length === 0) {
    // Fallback to API if not in DB
    const raw = await padelApi.getTournamentById(tournamentId);
    if (!raw) throw new DataMappingError('Tournament not found');
    return mapPadelapiTournament(raw);
  }

  return mapDbTournament(result.rows[0]);
}

// --- Matches ---

export async function getLiveMatches(): Promise<Match[]> {
  // Live matches not available on free plan - return empty
  return [];
}

export async function getMatches(): Promise<Match[]> {
  const tournaments = await getTournaments();
  const tournamentMap = new Map(tournaments.map((t) => [t.id, t]));

  // Start with database (has historical matches accumulated over time)
  const result = await query(
    'SELECT * FROM matches ORDER BY status ASC, start_time ASC'
  );

  const dbMatches = (result.rows || []).map(mapDbMatch);
  const matchMap = new Map<string, Match>();
  for (const m of dbMatches) {
    // Only include matches from tournaments we track (excludes FIP)
    if (tournamentMap.has(m.tournamentId)) {
      matchMap.set(m.id, m);
    }
  }

  // Overlay with fresh API data from global /matches endpoint
  try {
    const raw = await padelApi.getMatches();
    if (Array.isArray(raw) && raw.length > 0) {
      const apiMatches = mapPadelapiMatches(raw);
      for (const m of apiMatches) {
        // Only include matches from tournaments we track (excludes FIP)
        if (tournamentMap.has(m.tournamentId)) {
          matchMap.set(m.id, m);
        }
      }
    }
  } catch {
    // ignore - will fall back to database data
  }

  // For ongoing tournaments, fetch full draw directly from API.
  // The tournament API is the source of truth for draw structure and dates.
  // The global /matches API is only used to enrich scores/results.
  const ongoingTournaments = tournaments.filter((t) => t.status === 'ongoing');
  for (const tournament of ongoingTournaments) {
    try {
      const raw = await padelApi.getTournamentMatches(tournament.id);
      if (Array.isArray(raw) && raw.length > 0) {
        const drawMatches = mapPadelapiMatches(raw);
        for (const m of drawMatches) {
          const existing = matchMap.get(m.id);
          if (!existing) {
            // New match not seen before — just add it
            matchMap.set(m.id, m);
            continue;
          }

          // --- Tournament API is source of truth for dates/round/teams ---
          const merged: Match = { ...m };

          // Only fall back to global API date if tournament API has NO date at all
          if (!m.startTime && existing.startTime) {
            merged.startTime = existing.startTime;
          }

          // If the existing match is finished and the new one is not, keep finished status
          if (existing.status === 'finished' && m.status !== 'finished') {
            merged.status = 'finished';
          }

          // Preserve existing score data if the new one is empty
          if ((!m.sets || m.sets.length === 0) && existing.sets && existing.sets.length > 0) {
            merged.sets = existing.sets;
          }

          // Preserve existing winner info if the new one lacks it
          if (!m.winner && existing.winner) {
            merged.winner = existing.winner;
          }

          // Preserve existing duration if the new one lacks it
          if (!m.durationMinutes && existing.durationMinutes) {
            merged.durationMinutes = existing.durationMinutes;
          }

          matchMap.set(m.id, merged);
        }
      }
    } catch {
      // ignore - will fall back to existing data
    }
  }

  const merged = Array.from(matchMap.values()).map((m) => {
    const tournament = tournamentMap.get(m.tournamentId);
    if (tournament) {
      const enriched: Match = { ...m };
      if (tournament.name) enriched.tournamentName = tournament.name;
      if (tournament.tier) enriched.tournamentTier = tournament.tier;
      return enriched;
    }
    return m;
  });

  const withAvatars = await Promise.all(merged.map(enrichMatchPlayers));

  // Enrich with schedule times from padelfip.com for ongoing/upcoming tournaments
  const tournamentsNeedingSchedule = new Map<string, Tournament>();
  // Note: We do NOT auto-assign session times to all matches in a round.
  // In padel, matches start in parallel across courts but sequentially on
  // each court. Without courtOrder data, assigning the same time to all
  // matches in a round is misleading. The scraper data is kept available
  // for future use when we have per-court scheduling.
  //
  // For now, matches without a real startTime keep their date-only value
  // and the frontend shows "Horario por determinar".

  return withAvatars;
}

export async function getTournamentMatches(tournamentId: string): Promise<Match[]> {
  let tournament: Tournament | null = null;
  try {
    tournament = await getTournamentById(tournamentId);
  } catch {
    // ignore
  }

  // Fetch directly from external API for freshest + complete draw data
  let apiMatches: Match[] = [];
  try {
    const raw = await padelApi.getTournamentMatches(tournamentId);
    if (Array.isArray(raw) && raw.length > 0) {
      apiMatches = mapPadelapiMatches(raw).map((m) => {
        if (!tournament) return m;
        const enriched: Match = { ...m };
        if (tournament.name) enriched.tournamentName = tournament.name;
        if (tournament.tier) enriched.tournamentTier = tournament.tier;
        return enriched;
      });
    }
  } catch {
    // ignore - will fall back to database
  }

  // If API returned data, use it (it's fresher and more complete)
  if (apiMatches.length > 0) {
    const enriched = await Promise.all(apiMatches.map(enrichMatchPlayers));
    return enriched;
  }

  // Fallback to database
  const result = await query(
    'SELECT * FROM matches WHERE tournament_id = $1 ORDER BY start_time ASC',
    [tournamentId]
  );

  const matches = (result.rows || []).map(mapDbMatch).map((m) => {
    if (!tournament) return m;
    const enriched: Match = { ...m };
    if (tournament.name) enriched.tournamentName = tournament.name;
    if (tournament.tier) enriched.tournamentTier = tournament.tier;
    return enriched;
  });

  const enriched = await Promise.all(matches.map(enrichMatchPlayers));
  return enriched;
}

export async function getMatchById(matchId: string): Promise<Match> {
  // Fetch from DB first (preserves historical data like scores)
  const dbResult = await query('SELECT * FROM matches WHERE id = $1', [matchId]);
  let dbMatch: Match | null = null;
  if (dbResult.rows.length > 0) {
    dbMatch = mapDbMatch(dbResult.rows[0]);
  }

  // Try API for freshest data (status, scores, etc.)
  let apiMatch: Match | null = null;
  try {
    const raw = await padelApi.getMatchById(matchId);
    if (raw) {
      apiMatch = mapPadelapiMatch(raw);
    }
  } catch {
    // ignore - will fall back to database data
  }

  // If both exist, do a granular merge (API is source of truth for status/dates, DB for missing scores)
  if (apiMatch && dbMatch) {
    const merged: Match = { ...apiMatch };

    // If API has no sets but DB does, preserve DB sets
    if ((!apiMatch.sets || apiMatch.sets.length === 0) && dbMatch.sets && dbMatch.sets.length > 0) {
      merged.sets = dbMatch.sets;
    }

    // If API has no winner but DB does, preserve DB winner
    if (!apiMatch.winner && dbMatch.winner) {
      merged.winner = dbMatch.winner;
    }

    // If API has no duration but DB does, preserve DB duration
    if (!apiMatch.durationMinutes && dbMatch.durationMinutes) {
      merged.durationMinutes = dbMatch.durationMinutes;
    }

    // If API has no startTime but DB does, preserve DB startTime
    if (!apiMatch.startTime && dbMatch.startTime) {
      merged.startTime = dbMatch.startTime;
    }

    // If API says upcoming but DB says finished, trust DB (API may lag)
    if (apiMatch.status === 'upcoming' && dbMatch.status === 'finished') {
      merged.status = 'finished';
    }

    let match = merged;
    try {
      const tournament = await getTournamentById(match.tournamentId);
      if (tournament) {
        const enriched: Match = { ...match };
        if (tournament.name) enriched.tournamentName = tournament.name;
        if (tournament.tier) enriched.tournamentTier = tournament.tier;
        match = enriched;
      }
    } catch {
      // ignore
    }
    return enrichMatchPlayers(match);
  }

  // If only API exists, use it
  if (apiMatch) {
    let match = apiMatch;
    try {
      const tournament = await getTournamentById(match.tournamentId);
      if (tournament) {
        const enriched: Match = { ...match };
        if (tournament.name) enriched.tournamentName = tournament.name;
        if (tournament.tier) enriched.tournamentTier = tournament.tier;
        match = enriched;
      }
    } catch {
      // ignore
    }
    return enrichMatchPlayers(match);
  }

  // If only DB exists, use it
  if (dbMatch) {
    let match = dbMatch;
    try {
      const tournament = await getTournamentById(match.tournamentId);
      if (tournament) {
        const enriched: Match = { ...match };
        if (tournament.name) enriched.tournamentName = tournament.name;
        if (tournament.tier) enriched.tournamentTier = tournament.tier;
        match = enriched;
      }
    } catch {
      // ignore
    }
    return enrichMatchPlayers(match);
  }

  throw new DataMappingError('Match not found');
}

export async function getMatchStats(_matchId: string): Promise<MatchStatsData | null> {
  return null;
}

export async function getMatchPoints(_matchId: string): Promise<PointEvent[]> {
  return [];
}

// --- Players ---

export async function getPlayers(): Promise<Player[]> {
  const result = await query('SELECT * FROM players ORDER BY ranking ASC');
  return (result.rows || []).map(mapDbPlayer);
}

export async function getPlayerById(playerId: string): Promise<Player> {
  const result = await query('SELECT * FROM players WHERE id = $1', [playerId]);

  if (result.rows.length > 0) {
    return mapDbPlayer(result.rows[0]);
  }

  // Fallback: search in rankings table (FIP scraped data)
  const rankResult = await query(
    'SELECT player_id, player_name, player_country, player_country_code, position, points, avatar_url FROM rankings WHERE player_id = $1 LIMIT 1',
    [playerId]
  );

  if (rankResult.rows.length > 0) {
    const row = rankResult.rows[0];
    return {
      id: row.player_id || playerId,
      name: row.player_name || 'Unknown',
      country: row.player_country || 'Unknown',
      countryCode: row.player_country_code || 'ES',
      avatarUrl: row.avatar_url || undefined,
      ranking: row.position,
      points: row.points,
    };
  }

  // Last fallback: try the external API
  const raw = await padelApi.getPlayerById(playerId);
  if (!raw) throw new DataMappingError('Player not found');
  return mapPadelapiPlayer(raw);
}

// --- DB mappers ---

function parseLocalDate(dateInput: unknown): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  const dateStr = String(dateInput || '');
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function inferStatusFromDates(startDate?: string, endDate?: string): 'ongoing' | 'upcoming' | 'finished' {
  if (!startDate || !endDate) return 'upcoming';
  const now = new Date();
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  end.setHours(23, 59, 59, 999);
  if (now >= start && now <= end) return 'ongoing';
  if (now > end) return 'finished';
  return 'upcoming';
}

function toIsoDateString(value: unknown): string {
  if (!value) return new Date().toISOString().split('T')[0];
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const str = String(value);
  if (str.includes('T')) return str.split('T')[0];
  return str;
}

function mapDbTournament(row: any): Tournament {
  const startDate = toIsoDateString(row.start_date);
  const endDate = toIsoDateString(row.end_date);
  return {
    id: row.id,
    name: row.name,
    circuit: row.circuit || 'FIP',
    tier: row.tier || 'Open',
    city: row.city || 'Unknown',
    country: row.country || 'Unknown',
    startDate,
    endDate,
    prizeMoney: row.prize_money || '€ 0',
    surface: row.surface || 'Cemento',
    category: row.category || 'both',
    status: inferStatusFromDates(startDate, endDate),
    pairsCount: row.pairs_count,
    season: row.season || new Date().getFullYear(),
  };
}

function mapDbMatch(row: any): Match {
  return {
    id: row.id,
    tournamentId: row.tournament_id || '',
    tournamentName: row.tournament_name || 'Unknown Tournament',
    tournamentLogo: undefined,
    round: row.round || 'Unknown',
    status: row.status || 'upcoming',
    category: row.category,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    location: row.location,
    locationFlag: undefined,
    court: row.court,
    courtOrder: undefined,
    teamA: row.team_a || { players: [] },
    teamB: row.team_b || { players: [] },
    sets: row.sets || [],
    currentGame: undefined,
    currentGameScore: undefined,
    currentSetGames: undefined,
    server: undefined,
    winner: row.winner,
  };
}

// Enrich match players with avatar URLs from players and rankings tables
async function enrichMatchPlayers(match: Match): Promise<Match> {
  const missingNames: string[] = [];
  for (const team of [match.teamA, match.teamB]) {
    for (const p of team.players) {
      if (p.name && !p.avatarUrl) missingNames.push(p.name);
    }
  }
  if (missingNames.length === 0) return match;

  const placeholders = missingNames.map((_, i) => `$${i + 1}`).join(',');
  const avatarMap = new Map<string, string>();

  try {
    const playerResult = await query(`SELECT name, avatar_url FROM players WHERE name IN (${placeholders})`, missingNames);
    for (const row of playerResult.rows || []) {
      if (row.avatar_url) avatarMap.set(row.name, row.avatar_url);
    }
  } catch { /* ignore */ }

  // Fallback: search rankings table (FIP scraped data with thumbnails)
  const stillMissing = missingNames.filter((n) => !avatarMap.has(n));
  if (stillMissing.length > 0) {
    const rankPlaceholders = stillMissing.map((_, i) => `$${i + 1}`).join(',');
    try {
      const rankResult = await query(`SELECT player_name, avatar_url FROM rankings WHERE player_name IN (${rankPlaceholders}) AND avatar_url IS NOT NULL`, stillMissing);
      for (const row of rankResult.rows || []) {
        avatarMap.set(row.player_name, row.avatar_url);
      }
    } catch { /* ignore */ }
  }

  const enrichTeam = (team: { players: Player[] }) => ({
    ...team,
    players: team.players.map((p) =>
      p.avatarUrl || !avatarMap.has(p.name) ? p : { ...p, avatarUrl: avatarMap.get(p.name) }
    ),
  });

  return {
    ...match,
    teamA: enrichTeam(match.teamA),
    teamB: enrichTeam(match.teamB),
  };
}

// Enrich matches with schedule times from padelfip.com
async function enrichMatchesWithSchedule(matches: Match[], tournament: Tournament): Promise<Match[]> {
  try {
    const schedules = await padelFipScraper.scrapeTournamentSchedule(tournament.name, tournament.season);
    if (schedules.length === 0) return matches;

    return matches.map((match) => {
      // Skip if match already has a real time (not just date)
      const st = match.startTime;
      if (typeof st === 'string' && st.includes('T') && !st.includes('T00:00:00')) {
        return match;
      }

      // Find schedule for this match's round and date
      const matchDate = typeof st === 'string' ? st.split('T')[0] : '';
      const schedule = schedules.find((s) =>
        s.roundName === match.round && s.date === matchDate
      );

      if (schedule && typeof st === 'string') {
        // Combine existing date with schedule time
        const datePart = st.split('T')[0];
        return {
          ...match,
          startTime: `${datePart}T${schedule.startTime}:00`,
        };
      }

      return match;
    });
  } catch {
    return matches;
  }
}

function mapDbPlayer(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    country: row.country || 'Unknown',
    countryCode: row.country_code || 'ES',
    age: row.age,
    avatarUrl: row.avatar_url,
    ranking: row.ranking,
    points: row.points,
    seed: row.seed,
    category: row.category,
    birthplace: row.birthplace,
  };
}
