import axios from 'axios';
import NodeCache from 'node-cache';

const BASE_URL = process.env.PADELAPI_BASE_URL || 'https://padelapi.org/api';

const cache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

// TTLs según dinamismo de los datos
const TTL = {
  STATIC: 1800,      // 30 min — listados que cambian poco
  MODERATE: 900,     // 15 min — detalle de torneo / partido
  DYNAMIC: 600,      // 10 min — partidos en directo / resultados
};

function getClient() {
  const apiKey = process.env.PADELAPI_KEY;
  return axios.create({
    baseURL: BASE_URL,
    timeout: Number(process.env.PADELAPI_TIMEOUT_MS || 10000),
    headers: apiKey
      ? { Authorization: `Bearer ${apiKey}` }
      : {},
  });
}

interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    // Stale-while-revalidate: if cache exists, return immediately
    // and refresh in background if close to expiry
    const ttlRemaining = cache.getTtl(key);
    const now = Date.now();
    if (ttlRemaining && ttlRemaining - now < ttlSeconds * 500) {
      // Less than half TTL remaining, refresh in background
      fetcher().then((fresh) => cache.set(key, fresh, ttlSeconds)).catch(() => {});
    }
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttlSeconds);
  return data;
}

function extractData<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as PaginatedResponse<T>).data;
  }
  return [];
}

function extractItem<T>(response: T | null): T | null {
  if (!response) return null;
  if (typeof response === 'object' && 'data' in response) {
    const data = (response as Record<string, unknown>).data;
    if (Array.isArray(data) && data.length > 0) return data[0] as T;
    return data as T;
  }
  return response;
}

// --- Rate limiting helper ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPagesSequential<T>(
  url: string,
  maxPages: number,
  perPage: number,
  delayMs: number
): Promise<T[]> {
  const client = getClient();
  const results: T[] = [];
  const seen = new Set<string | number>();

  for (let page = 1; page <= maxPages; page++) {
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      try {
        const { data } = await client.get<PaginatedResponse<T>>(url, {
          params: { per_page: perPage, page },
        });
        const items = extractData(data);
        if (items.length === 0) {
          return results; // no more data
        }
        for (const item of items) {
          const id = (item as any)?.id;
          if (id !== undefined && id !== null && !seen.has(id)) {
            seen.add(id);
            results.push(item);
          }
        }
        if (items.length < perPage) {
          return results; // last page reached
        }
        break; // success, move to next page
      } catch (err: any) {
        if (err.response?.status === 429 && retries < maxRetries) {
          const waitMs = 5000 * (retries + 1);
          console.warn(`[PadelAPI] Rate limited on ${url} page ${page}, retrying in ${waitMs}ms...`);
          await sleep(waitMs);
          retries++;
          continue;
        }
        if (err.response?.status === 429) {
          console.warn(`[PadelAPI] Rate limited on ${url} page ${page}, returning ${results.length} items after retries`);
          break;
        }
        throw err;
      }
    }

    if (page < maxPages) {
      await sleep(delayMs);
    }
  }

  return results;
}

// --- Seasons ---

export async function getSeasons() {
  return fetchWithCache(
    'padelapi_seasons',
    async () => {
      const { data } = await getClient().get<PaginatedResponse<unknown>>('/seasons');
      return extractData(data);
    },
    TTL.STATIC
  );
}

// --- Players ---

export async function getPlayers() {
  return fetchWithCache(
    'padelapi_players',
    async () => {
      const { data } = await getClient().get<PaginatedResponse<unknown>>('/players', {
        params: { per_page: 50, page: 1 },
      });
      return extractData(data);
    },
    TTL.STATIC
  );
}

export async function getPlayerById(playerId: string) {
  return fetchWithCache(
    `padelapi_player_${playerId}`,
    async () => {
      const { data } = await getClient().get<unknown>(`/players/${playerId}`);
      return extractItem(data);
    },
    TTL.STATIC
  );
}

export async function getPlayerMatches(playerId: string) {
  return fetchWithCache(
    `padelapi_player_matches_${playerId}`,
    async () => {
      const { data } = await getClient().get<PaginatedResponse<unknown>>(`/players/${playerId}/matches`, {
        params: { per_page: 50, page: 1 },
      });
      return extractData(data);
    },
    TTL.DYNAMIC
  );
}

// --- Tournaments ---

export async function getTournaments(maxPages = 3) {
  return fetchWithCache(
    'padelapi_tournaments',
    async () => {
      return fetchPagesSequential('/tournaments', maxPages, 50, 2000);
    },
    TTL.STATIC
  );
}

export async function getTournamentById(tournamentId: string) {
  return fetchWithCache(
    `padelapi_tournament_${tournamentId}`,
    async () => {
      const { data } = await getClient().get<unknown>(`/tournaments/${tournamentId}`);
      return extractItem(data);
    },
    TTL.MODERATE
  );
}

export async function getTournamentMatches(tournamentId: string) {
  return fetchWithCache(
    `padelapi_tournament_matches_${tournamentId}`,
    async () => {
      return fetchPagesSequential(`/tournaments/${tournamentId}/matches`, 2, 50, 3000);
    },
    TTL.DYNAMIC
  );
}

// --- Matches ---

export async function getLiveMatches(): Promise<unknown[]> {
  return [];
}

export async function getMatches() {
  return fetchWithCache(
    'padelapi_matches',
    async () => {
      return fetchPagesSequential('/matches', 2, 50, 3000);
    },
    TTL.DYNAMIC
  );
}

export async function getMatchById(matchId: string) {
  return fetchWithCache(
    `padelapi_match_${matchId}`,
    async () => {
      const { data } = await getClient().get<unknown>(`/matches/${matchId}`);
      return extractItem(data);
    },
    TTL.MODERATE
  );
}

export async function getMatchStats(_matchId: string): Promise<unknown | null> {
  return null;
}

export async function getMatchPoints(_matchId: string): Promise<unknown[]> {
  return [];
}

// --- Rankings (derived from top players) ---

export async function getRankings() {
  return fetchWithCache(
    'padelapi_rankings',
    async () => {
      return fetchPagesSequential('/players', 2, 50, 3000);
    },
    TTL.STATIC
  );
}
