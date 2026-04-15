import { apiClient } from './client';

export interface FavoritePayload {
  player_id: string;
  player_name: string;
  player_avatar_url?: string;
  notify_match_start?: boolean;
  notify_score_changes?: boolean;
}

export async function fetchFavorites() {
  const { data } = await apiClient.get('/favorites');
  return data;
}

export async function addFavorite(payload: FavoritePayload) {
  const { data } = await apiClient.post('/favorites', payload);
  return data;
}

export async function removeFavorite(playerId: string) {
  await apiClient.delete(`/favorites/${playerId}`);
}
