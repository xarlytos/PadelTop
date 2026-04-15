import { apiClient } from './client';
import type { Player } from '../types/player.types';

export async function fetchPlayers(): Promise<Player[]> {
  const { data } = await apiClient.get('/players');
  return data;
}

export async function fetchPlayerById(playerId: string): Promise<Player> {
  const { data } = await apiClient.get(`/players/${playerId}`);
  return data;
}
