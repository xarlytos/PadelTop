import { mockPlayers } from './players.mock';
import type { Player } from '../types/player.types';

export interface TournamentMatch {
  id: string;
  round: string;
  teamA: { players: Player[] };
  teamB: { players: Player[] };
  winner?: 'A' | 'B';
  score?: string;
}

export interface TournamentData {
  draws: {
    male?: TournamentMatch[];
    female?: TournamentMatch[];
  };
  participants: {
    male?: string[];
    female?: string[];
  };
}

export const mockTournamentData: Record<string, TournamentData> = {
  'tour-1': {
    draws: {
      male: [
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
      female: [
        {
          id: 'd1f',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.triay, mockPlayers.salazar] },
          teamB: { players: [mockPlayers.ari, mockPlayers.paula] },
          winner: 'A',
          score: '6-3 6-4',
        },
        {
          id: 'd2f',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.orrono, mockPlayers.riefa] },
          teamB: { players: [mockPlayers.triay, mockPlayers.salazar] },
          winner: 'B',
          score: '7-5 6-3',
        },
        {
          id: 'd3f',
          round: 'Semifinal',
          teamA: { players: [mockPlayers.triay, mockPlayers.salazar] },
          teamB: { players: [mockPlayers.orrono, mockPlayers.riefa] },
          winner: 'A',
          score: '6-4 6-4',
        },
        {
          id: 'd4f',
          round: 'Final',
          teamA: { players: [mockPlayers.triay, mockPlayers.salazar] },
          teamB: { players: [mockPlayers.ari, mockPlayers.paula] },
          winner: 'A',
          score: '6-3 6-2',
        },
      ],
    },
    participants: {
      male: [
        'Tapia / Coello',
        'Galan / Chingotto',
        'Lebrón / Di Nenno',
        'Navarro / Stupaczuk',
        'Sanyo / Momo',
        'Ruiz / Tello',
        'Lamperti / Sanz',
        'Pincho / Diaz',
      ],
      female: [
        'Triay / Salazar',
        'Ari / Paula',
        'Orrono / Riefa',
        'Sánchez / Riera',
      ],
    },
  },
  'tour-2': {
    draws: {
      male: [
        { id: 'm1', round: 'Cuartos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-4 6-2' },
        { id: 'm2', round: 'Cuartos', teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'B', score: '6-3 7-5' },
        { id: 'm3', round: 'Semifinal', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'A', score: '6-3 6-4' },
        { id: 'm4', round: 'Final', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] } },
      ],
      female: [
        { id: 'f1', round: 'Cuartos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-4' },
        { id: 'f2', round: 'Cuartos', teamA: { players: [mockPlayers.orrono, mockPlayers.riefa] }, teamB: { players: [mockPlayers.triay, mockPlayers.salazar] }, winner: 'A', score: '7-5 6-3' },
        { id: 'f3', round: 'Semifinal', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-4 6-4' },
        { id: 'f4', round: 'Final', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'B', score: '6-7 6-4 6-3' },
      ],
    },
    participants: {
      male: [
        'Tapia / Coello',
        'Galan / Chingotto',
        'Lebrón / Di Nenno',
        'Navarro / Stupaczuk',
      ],
      female: [
        'Triay / Salazar',
        'Ari / Paula',
        'Orrono / Riefa',
        'Sánchez / Riera',
      ],
    },
  },
  'tour-3': {
    draws: {
      male: [
        { id: 'm1', round: 'Cuartos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-2 6-3' },
        { id: 'm2', round: 'Cuartos', teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'B', score: '6-4 7-6' },
        { id: 'm3', round: 'Semifinal', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'A', score: '6-3 6-4' },
        { id: 'm4', round: 'Final', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'B', score: '6-7 6-4 6-3' },
      ],
      female: [
        { id: 'f1', round: 'Cuartos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-2' },
        { id: 'f2', round: 'Cuartos', teamA: { players: [mockPlayers.orrono, mockPlayers.riefa] }, teamB: { players: [mockPlayers.triay, mockPlayers.salazar] }, winner: 'A', score: '7-6 6-4' },
        { id: 'f3', round: 'Semifinal', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-2' },
        { id: 'f4', round: 'Final', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-4 6-4' },
      ],
    },
    participants: {
      male: [
        'Tapia / Coello',
        'Galan / Chingotto',
        'Lebrón / Di Nenno',
        'Navarro / Stupaczuk',
        'Sanyo / Momo',
        'Ruiz / Tello',
      ],
      female: [
        'Triay / Salazar',
        'Ari / Paula',
        'Orrono / Riefa',
        'Sánchez / Riera',
      ],
    },
  },
  'tour-4': {
    draws: {
      male: [
        { id: 'r1', round: 'Octavos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-4 6-3' },
        { id: 'r2', round: 'Octavos', teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'A', score: '6-3 7-5' },
        { id: 'r3', round: 'Cuartos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, winner: 'A', score: '6-4 6-2' },
        { id: 'r4', round: 'Semifinal', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '7-5 6-3' },
      ],
      female: [
        { id: 'rf1', round: 'Octavos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-4' },
        { id: 'rf2', round: 'Octavos', teamA: { players: [mockPlayers.orrono, mockPlayers.riefa] }, teamB: { players: [mockPlayers.triay, mockPlayers.salazar] }, winner: 'A', score: '6-2 6-3' },
        { id: 'rf3', round: 'Cuartos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '7-6 6-4' },
        { id: 'rf4', round: 'Semifinal', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.orrono, mockPlayers.riefa] }, winner: 'A', score: '6-3 6-2' },
      ],
    },
    participants: {
      male: ['Tapia / Coello', 'Galan / Chingotto', 'Lebrón / Di Nenno', 'Navarro / Stupaczuk'],
      female: ['Triay / Salazar', 'Ari / Paula', 'Orrono / Riefa'],
    },
  },
  'tour-5': {
    draws: {
      male: [
        { id: 'a1', round: 'Cuartos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-2 6-3' },
        { id: 'a2', round: 'Semifinal', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, winner: 'A', score: '6-4 6-2' },
        { id: 'a3', round: 'Final', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-3 6-4' },
      ],
      female: [
        { id: 'a1f', round: 'Cuartos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-4' },
        { id: 'a2f', round: 'Semifinal', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.orrono, mockPlayers.riefa] }, winner: 'A', score: '6-4 6-2' },
        { id: 'a3f', round: 'Final', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-3 6-4' },
      ],
    },
    participants: {
      male: ['Tapia / Coello', 'Galan / Chingotto', 'Lebrón / Di Nenno', 'Navarro / Stupaczuk'],
      female: ['Triay / Salazar', 'Ari / Paula', 'Orrono / Riefa', 'Sánchez / Riera'],
    },
  },
  'tour-6': {
    draws: {
      male: [
        { id: 'mi1', round: 'Dieciseisavos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-3 6-4' },
        { id: 'mi2', round: 'Octavos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] }, winner: 'A', score: '6-4 6-3' },
        { id: 'mi3', round: 'Cuartos', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] }, winner: 'A', score: '7-5 6-4' },
        { id: 'mi4', round: 'Semifinal', teamA: { players: [mockPlayers.tapia, mockPlayers.coello] }, teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] }, winner: 'A', score: '6-3 6-2' },
      ],
      female: [
        { id: 'fi1', round: 'Dieciseisavos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '6-4 6-3' },
        { id: 'fi2', round: 'Octavos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.orrono, mockPlayers.riefa] }, winner: 'A', score: '6-2 6-4' },
        { id: 'fi3', round: 'Cuartos', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.ari, mockPlayers.paula] }, winner: 'A', score: '7-6 6-3' },
        { id: 'fi4', round: 'Semifinal', teamA: { players: [mockPlayers.triay, mockPlayers.salazar] }, teamB: { players: [mockPlayers.orrono, mockPlayers.riefa] }, winner: 'A', score: '6-4 6-2' },
      ],
    },
    participants: {
      male: ['Tapia / Coello', 'Galan / Chingotto', 'Lebrón / Di Nenno', 'Navarro / Stupaczuk'],
      female: ['Triay / Salazar', 'Ari / Paula', 'Orrono / Riefa', 'Sánchez / Riera'],
    },
  },
};
