import { mockPlayers } from './players.mock';
import type { Player } from '../types/player.types';

export interface DrawMatch {
  id: string;
  round: string;
  teamA: { players: Player[] };
  teamB: { players: Player[] };
  winner?: 'A' | 'B';
  score?: string;
}

export const mockTournamentDraws: Record<string, DrawMatch[]> = {
  'tour-1': [
    {
      id: 'd1',
      round: 'Cuartos',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
      winner: 'A',
      score: '6-3 6-4',
    },
    {
      id: 'd2',
      round: 'Cuartos',
      teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
      teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
      winner: 'A',
      score: '7-6 6-3',
    },
    {
      id: 'd3',
      round: 'Semifinal',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
      winner: 'A',
      score: '7-6 4-6 6-4',
    },
    {
      id: 'd4',
      round: 'Final',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
    },
  ],
  'tour-3': [
    {
      id: 'm1',
      round: 'Cuartos',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
      winner: 'A',
      score: '6-2 6-3',
    },
    {
      id: 'm2',
      round: 'Cuartos',
      teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
      teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
      winner: 'B',
      score: '6-4 7-6',
    },
    {
      id: 'm3',
      round: 'Semifinal',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
      winner: 'A',
      score: '6-3 6-4',
    },
    {
      id: 'm4',
      round: 'Final',
      teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
      teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
      winner: 'B',
      score: '6-7 6-4 6-3',
    },
  ],
};

export const mockTournamentParticipants: Record<string, string[]> = {
  'tour-1': [
    'Tapia / Coello',
    'Galan / Chingotto',
    'Lebrón / Di Nenno',
    'Navarro / Stupaczuk',
    'Sanyo / Momo',
    'Ruiz / Tello',
    'Lamperti / Sanz',
    'Pincho / Diaz',
  ],
  'tour-2': [
    'Tapia / Coello',
    'Galan / Chingotto',
    'Lebrón / Di Nenno',
    'Navarro / Stupaczuk',
    'Triay / Fernández',
    'Salazar / Josemaría',
    'Sánchez / Riera',
  ],
  'tour-3': [
    'Tapia / Coello',
    'Galan / Chingotto',
    'Lebrón / Di Nenno',
    'Navarro / Stupaczuk',
    'Sanyo / Momo',
    'Ruiz / Tello',
  ],
};
