import axios from 'axios';
import NodeCache from 'node-cache';

const BASE_URL = process.env.PADELAPI_BASE_URL || 'https://api.padelapi.org/v1';
const API_KEY = process.env.PADELAPI_KEY;

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: API_KEY ? { 'X-API-Key': API_KEY } : {},
});

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  cache.set(key, data, ttlSeconds);
  return data;
}

export async function getLiveMatches() {
  return fetchWithCache(
    'live_matches',
    async () => {
      const { data } = await client.get('/live');
      return data;
    },
    30
  );
}

export async function getMatches() {
  return fetchWithCache(
    'matches_list',
    async () => {
      const { data } = await client.get('/matches');
      return data;
    },
    60
  );
}

export async function getMatchById(matchId: string) {
  return fetchWithCache(
    `match_${matchId}`,
    async () => {
      const { data } = await client.get(`/matches/${matchId}`);
      return data;
    },
    60
  );
}

export async function getMatchStats(matchId: string) {
  return fetchWithCache(
    `match_stats_${matchId}`,
    async () => {
      const { data } = await client.get(`/matches/${matchId}/stats`);
      return data;
    },
    120
  );
}

export async function getMatchPoints(matchId: string) {
  return fetchWithCache(
    `match_points_${matchId}`,
    async () => {
      const { data } = await client.get(`/matches/${matchId}/points`);
      return data;
    },
    120
  );
}

export async function getPlayers() {
  return fetchWithCache(
    'players_list',
    async () => {
      const { data } = await client.get('/players');
      return data;
    },
    300
  );
}

export async function getPlayerById(playerId: string) {
  return fetchWithCache(
    `player_${playerId}`,
    async () => {
      const { data } = await client.get(`/players/${playerId}`);
      return data;
    },
    300
  );
}

export async function getRankings() {
  return fetchWithCache(
    'rankings',
    async () => {
      const { data } = await client.get('/rankings');
      return data;
    },
    300
  );
}

export async function getTournaments() {
  return fetchWithCache(
    'tournaments',
    async () => {
      const { data } = await client.get('/tournaments');
      return data;
    },
    300
  );
}

export async function getTournamentById(tournamentId: string) {
  return fetchWithCache(
    `tournament_${tournamentId}`,
    async () => {
      const { data } = await client.get(`/tournaments/${tournamentId}`);
      return data;
    },
    300
  );
}
