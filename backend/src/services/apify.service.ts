import axios from 'axios';
import NodeCache from 'node-cache';
import type {
  ApifyAction,
  ApifyDatasetItem,
  ApifyRawMatch,
  ApifyRawPlayer,
  ApifyRawRankingItem,
  ApifyRawTournament,
  ApifyRunInput,
} from '../types/apify.types';

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const APIFY_ENABLED = process.env.APIFY_ENABLED !== 'false';
const APIFY_TIMEOUT_MS = Number(process.env.APIFY_TIMEOUT_MS || 15000);
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || 'fingolfin~padel-live-api';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const client = axios.create({
  baseURL: `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}`,
  timeout: APIFY_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApifyActorError extends Error {
  constructor(
    message: string,
    public action: ApifyAction,
    public actorError?: string
  ) {
    super(message);
    this.name = 'ApifyActorError';
  }
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  cache.set(key, data, ttlSeconds);
  return data;
}

async function runApifyAction<T>(action: ApifyAction, payload?: Record<string, unknown>): Promise<T> {
  if (!APIFY_ENABLED || !APIFY_TOKEN) {
    throw new ApifyActorError('Apify is not configured', action);
  }

  const runInput: ApifyRunInput = {
    action,
    ...(payload || {}),
  };

  const { data } = await client.post<ApifyDatasetItem<T>[]>(
    `/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
    runInput
  );

  if (!Array.isArray(data) || data.length === 0) {
    throw new ApifyActorError('Empty response from Apify Actor', action);
  }

  const item = data[0];
  if (!item.success) {
    throw new ApifyActorError(
      `Apify Actor returned error for action ${action}`,
      action,
      item.error || undefined
    );
  }

  return item.data;
}

export async function getRankings(): Promise<ApifyRawRankingItem[]> {
  return fetchWithCache(
    'apify_rankings',
    () => runApifyAction<ApifyRawRankingItem[]>('get_rankings', { gender: 'male', page: 1, limit: 100 }),
    300
  );
}

export async function getTournaments(): Promise<ApifyRawTournament[]> {
  return fetchWithCache(
    'apify_tournaments',
    () => runApifyAction<ApifyRawTournament[]>('get_tournaments', { year: new Date().getFullYear(), page: 1, limit: 100 }),
    300
  );
}

export async function getTournamentById(tournamentId: string): Promise<ApifyRawTournament> {
  return fetchWithCache(
    `apify_tournament_${tournamentId}`,
    () => runApifyAction<ApifyRawTournament>('get_tournament_detail', { slug: tournamentId }),
    300
  );
}

export async function getLiveMatches(): Promise<ApifyRawMatch[]> {
  return fetchWithCache(
    'apify_live_matches',
    () => runApifyAction<ApifyRawMatch[]>('get_live_scores'),
    30
  );
}

export async function getMatches(): Promise<ApifyRawMatch[]> {
  return getLiveMatches();
}

export async function getMatchById(matchId: string): Promise<ApifyRawMatch> {
  return fetchWithCache(
    `apify_match_${matchId}`,
    () => runApifyAction<ApifyRawMatch>('get_live_tournament', { tournament_id: matchId }),
    60
  );
}

export async function getMatchStats(_matchId: string): Promise<never> {
  throw new ApifyActorError('Match stats not supported by Apify Actor', 'get_circuit_stats');
}

export async function getMatchPoints(_matchId: string): Promise<never> {
  throw new ApifyActorError('Match points not supported by Apify Actor', 'get_live_scores');
}

export async function getPlayers(): Promise<ApifyRawPlayer[]> {
  return fetchWithCache(
    'apify_players',
    () => runApifyAction<ApifyRawPlayer[]>('search_players', { query: 'a', page: 1, limit: 100 }),
    300
  );
}

export async function getPlayerById(playerId: string): Promise<ApifyRawPlayer> {
  return fetchWithCache(
    `apify_player_${playerId}`,
    () => runApifyAction<ApifyRawPlayer>('get_player_profile', { slug: playerId }),
    300
  );
}

export { ApifyActorError };
