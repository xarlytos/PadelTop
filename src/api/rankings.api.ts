import { apiClient } from './client';
import type { RankingEntry } from '../types/ranking.types';

export async function fetchRankings(): Promise<RankingEntry[]> {
  const { data } = await apiClient.get('/rankings');
  return data;
}
