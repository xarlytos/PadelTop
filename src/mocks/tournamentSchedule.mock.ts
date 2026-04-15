import { mockPlayers } from './players.mock';

export interface ScheduledMatch {
  id: string;
  round: string;
  teamA: { players: { name: string; countryCode?: string }[] };
  teamB: { players: { name: string; countryCode?: string }[] };
  court?: string;
  time?: string;
  winner?: 'A' | 'B';
  score?: string;
}

export interface DaySchedule {
  date: string;
  label: string;
  matches: ScheduledMatch[];
}

export const mockTournamentSchedules: Record<string, DaySchedule[]> = {
  'tour-1': [
    {
      date: '2026-04-07',
      label: 'Lunes',
      matches: [
        {
          id: 's1-1',
          round: '1ª Ronda',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          winner: 'A',
          score: '6-2 6-3',
          court: 'Pista Central',
          time: '16:00',
        },
        {
          id: 's1-2',
          round: '1ª Ronda',
          teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'A',
          score: '6-4 6-2',
          court: 'Pista 2',
          time: '18:00',
        },
      ],
    },
    {
      date: '2026-04-08',
      label: 'Martes',
      matches: [
        {
          id: 's2-1',
          round: '1ª Ronda',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          winner: 'A',
          score: '6-3 6-4',
          court: 'Pista Central',
          time: '17:00',
        },
        {
          id: 's2-2',
          round: '1ª Ronda',
          teamA: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'B',
          score: '7-6 6-3',
          court: 'Pista 2',
          time: '19:00',
        },
      ],
    },
    {
      date: '2026-04-10',
      label: 'Jueves',
      matches: [
        {
          id: 's3-1',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'A',
          score: '6-3 6-4',
          court: 'Pista Central',
          time: '18:00',
        },
        {
          id: 's3-2',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          winner: 'A',
          score: '7-6 6-3',
          court: 'Pista 2',
          time: '20:00',
        },
      ],
    },
    {
      date: '2026-04-12',
      label: 'Sábado',
      matches: [
        {
          id: 's4-1',
          round: 'Semifinal',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          winner: 'A',
          score: '7-6 4-6 6-4',
          court: 'Pista Central',
          time: '18:00',
        },
        {
          id: 's4-2',
          round: 'Semifinal',
          teamA: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'A',
          score: '6-3 6-4',
          court: 'Pista Central',
          time: '20:30',
        },
      ],
    },
    {
      date: '2026-04-15',
      label: 'Martes',
      matches: [
        {
          id: 's5-1',
          round: 'Final',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          court: 'Pista Central',
          time: '19:00',
        },
      ],
    },
  ],
  'tour-3': [
    {
      date: '2026-03-12',
      label: 'Jueves',
      matches: [
        {
          id: 'm1-1',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          winner: 'A',
          score: '6-2 6-3',
          court: 'Pista Central',
          time: '18:00',
        },
        {
          id: 'm1-2',
          round: 'Cuartos',
          teamA: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'B',
          score: '6-4 7-6',
          court: 'Pista Central',
          time: '20:00',
        },
      ],
    },
    {
      date: '2026-03-13',
      label: 'Viernes',
      matches: [
        {
          id: 'm2-1',
          round: 'Semifinal',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.lebron, mockPlayers.dinenno] },
          winner: 'A',
          score: '6-3 6-4',
          court: 'Pista Central',
          time: '18:00',
        },
        {
          id: 'm2-2',
          round: 'Semifinal',
          teamA: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          teamB: { players: [mockPlayers.navarro, mockPlayers.stupaczuk] },
          winner: 'A',
          score: '7-5 6-2',
          court: 'Pista Central',
          time: '20:30',
        },
      ],
    },
    {
      date: '2026-03-16',
      label: 'Lunes',
      matches: [
        {
          id: 'm3-1',
          round: 'Final',
          teamA: { players: [mockPlayers.tapia, mockPlayers.coello] },
          teamB: { players: [mockPlayers.galan, mockPlayers.chingotto] },
          winner: 'B',
          score: '6-7 6-4 6-3',
          court: 'Pista Central',
          time: '19:00',
        },
      ],
    },
  ],
};
