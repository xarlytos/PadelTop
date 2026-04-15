import type { Team } from './player.types';

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface SetScore {
  teamA: number;
  teamB: number;
  tieBreakA?: number;
  tieBreakB?: number;
}

export interface GameScore {
  teamA: number;
  teamB: number;
}

export interface CurrentGameScore {
  teamA: string;
  teamB: string;
}

export interface CurrentSetGames {
  teamA: number;
  teamB: number;
  tieBreakA?: number;
  tieBreakB?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentLogo?: string;
  round: string;
  status: MatchStatus;
  startTime?: string;
  durationMinutes?: number;
  location?: string;
  locationFlag?: string;
  teamA: Team;
  teamB: Team;
  sets: SetScore[];
  currentGame?: GameScore;
  currentGameScore?: CurrentGameScore;
  currentSetGames?: CurrentSetGames;
  server?: 'A' | 'B';
}

export interface MatchStatsData {
  pointsWon: { teamA: number; teamB: number };
  unforcedErrors: { teamA: number; teamB: number };
  winners: { teamA: number; teamB: number };
  doubleFaults: { teamA: number; teamB: number };
  breakPoints: { teamA: string; teamB: string };
  firstServePercentage: { teamA: number; teamB: number };
  firstServePointsWon: { teamA: number; teamB: number };
  secondServePointsWon: { teamA: number; teamB: number };
}

export interface PointEvent {
  id: string;
  setIndex: number;
  gameIndex: number;
  pointNumber: number;
  scoreBefore: string;
  server: 'A' | 'B';
  winner: 'A' | 'B';
  description?: string;
}
