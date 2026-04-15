import { apiClient } from './client';
import type { Match, MatchStatsData, PointEvent } from '../types/match.types';

export async function fetchLiveMatches(): Promise<Match[]> {
  const { data } = await apiClient.get('/matches/live');
  return data;
}

export async function fetchMatches(): Promise<Match[]> {
  const { data } = await apiClient.get('/matches');
  return data;
}

export async function fetchMatchById(matchId: string): Promise<Match> {
  const { data } = await apiClient.get(`/matches/${matchId}`);
  return data;
}

export async function fetchMatchStats(matchId: string): Promise<MatchStatsData> {
  const { data } = await apiClient.get(`/matches/${matchId}/stats`);
  return data;
}

export async function fetchMatchPoints(matchId: string): Promise<PointEvent[]> {
  const { data } = await apiClient.get(`/matches/${matchId}/points`);
  return data;
}
