import { apiClient } from './client';
import type { Tournament } from '../types/tournament.types';

export async function fetchTournaments(): Promise<Tournament[]> {
  const { data } = await apiClient.get('/tournaments');
  return data;
}

export async function fetchTournamentById(tournamentId: string): Promise<Tournament> {
  const { data } = await apiClient.get(`/tournaments/${tournamentId}`);
  return data;
}
