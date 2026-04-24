import axios from 'axios';
import NodeCache from 'node-cache';
import type { RankingEntry, Player } from '../types/domain.types';

const BASE_URL = 'https://www.padelfip.com/wp-json/fip/v1/ranking/load-more';
const PLAYERS_PER_PAGE = 20;
const MAX_PLAYERS = 200;

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

function isFipId(id: string): boolean {
  return /^P\d+$/.test(id);
}

interface FipRankingPlayer {
  player_id: string;
  name: string;
  surname: string;
  rank: number;
  points: number;
  move: number;
  url: string;
  thumbnail: string;
  country_name: string;
  country_flag: string;
}

function normalizeCountryCode(flagUrl: string): string {
  if (flagUrl.includes('Spain')) return 'ES';
  if (flagUrl.includes('Argentina')) return 'AR';
  if (flagUrl.includes('France')) return 'FR';
  if (flagUrl.includes('Italy')) return 'IT';
  if (flagUrl.includes('Portugal')) return 'PT';
  if (flagUrl.includes('Brazil')) return 'BR';
  if (flagUrl.includes('Sweden')) return 'SE';
  if (flagUrl.includes('Belgium')) return 'BE';
  if (flagUrl.includes('Chile')) return 'CL';
  if (flagUrl.includes('Uruguay')) return 'UY';
  if (flagUrl.includes('Paraguay')) return 'PY';
  if (flagUrl.includes('Mexico')) return 'MX';
  if (flagUrl.includes('United_States') || flagUrl.includes('USA')) return 'US';
  if (flagUrl.includes('United_Kingdom') || flagUrl.includes('UK')) return 'GB';
  if (flagUrl.includes('Netherlands')) return 'NL';
  if (flagUrl.includes('Germany')) return 'DE';
  if (flagUrl.includes('Australia')) return 'AU';
  if (flagUrl.includes('Denmark')) return 'DK';
  if (flagUrl.includes('Finland')) return 'FI';
  if (flagUrl.includes('Norway')) return 'NO';
  if (flagUrl.includes('Poland')) return 'PL';
  if (flagUrl.includes('Czech')) return 'CZ';
  if (flagUrl.includes('Austria')) return 'AT';
  if (flagUrl.includes('Switzerland')) return 'CH';
  if (flagUrl.includes('Canada')) return 'CA';
  return 'ES';
}

async function fetchRankingPage(gender: 'male' | 'female', offset: number, weekNo: number): Promise<FipRankingPlayer[]> {
  const { data } = await axios.get<FipRankingPlayer[]>(BASE_URL, {
    params: {
      gender,
      offset,
      category: 'master',
      circuit: 'premierpadel',
      year: new Date().getFullYear(),
      week: weekNo,
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    timeout: 15000,
  });
  return Array.isArray(data) ? data : [];
}

async function fetchWeekNumber(): Promise<number> {
  const cached = cache.get<number>('fip_week_no');
  if (cached) return cached;

  try {
    const { data } = await axios.get('https://www.padelfip.com/fip-rankings/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      timeout: 15000,
    });

    const match = data.match(/data-week-no="(\d+)"/);
    const weekNo = match ? parseInt(match[1], 10) : 16;
    cache.set('fip_week_no', weekNo, 86400);
    return weekNo;
  } catch {
    return 16;
  }
}

export async function getFipRankings(gender: 'male' | 'female'): Promise<RankingEntry[]> {
  const cacheKey = `fip_rankings_v2_${gender}`;
  const cached = cache.get<RankingEntry[]>(cacheKey);
  if (cached) return cached;

  const weekNo = await fetchWeekNumber();
  const allPlayers: FipRankingPlayer[] = [];

  // Fetch pages in batches of 5 to speed up initial load
  const BATCH_SIZE = 5;
  for (let batchStart = 0; batchStart < MAX_PLAYERS; batchStart += PLAYERS_PER_PAGE * BATCH_SIZE) {
    const batchOffsets: number[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const offset = batchStart + i * PLAYERS_PER_PAGE;
      if (offset < MAX_PLAYERS) batchOffsets.push(offset);
    }

    const batchResults = await Promise.allSettled(
      batchOffsets.map((offset) => fetchRankingPage(gender, offset, weekNo))
    );

    let emptyPageCount = 0;
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        if (result.value.length === 0) {
          emptyPageCount++;
        } else {
          allPlayers.push(...result.value);
          if (result.value.length < PLAYERS_PER_PAGE) emptyPageCount++;
        }
      }
    }

    // Stop if all pages in batch were empty or short
    if (emptyPageCount === batchResults.length) break;
  }

  // Deduplicate by player_id — FIP API may return overlapping pages
  const uniquePlayers = new Map<string, FipRankingPlayer>();
  for (const p of allPlayers) {
    if (!uniquePlayers.has(p.player_id)) {
      uniquePlayers.set(p.player_id, p);
    }
  }

  const entries: RankingEntry[] = Array.from(uniquePlayers.values()).map((p) => ({
    position: p.rank,
    previousPosition: p.move !== 0 ? p.rank + p.move : undefined,
    player: {
      id: p.player_id,
      name: `${p.name} ${p.surname}`.trim(),
      country: p.country_name,
      countryCode: normalizeCountryCode(p.country_flag),
      avatarUrl: p.thumbnail || undefined,
      ranking: p.rank,
      points: p.points,
      category: gender,
    },
    points: p.points,
  }));

  // Also store individual player lookup index
  for (const entry of entries) {
    cache.set(`fip_player_${entry.player.id}`, entry.player, 3600);
  }

  cache.set(cacheKey, entries, 3600);
  return entries;
}

export async function getFipPlayerById(playerId: string): Promise<Player | null> {
  if (!isFipId(playerId)) return null;

  const cached = cache.get<Player>(`fip_player_${playerId}`);
  if (cached) return cached;

  // Try to fetch both genders to find the player
  for (const gender of ['male', 'female'] as const) {
    const entries = await getFipRankings(gender);
    const found = entries.find((e) => e.player.id === playerId);
    if (found) return found.player;
  }

  return null;
}
