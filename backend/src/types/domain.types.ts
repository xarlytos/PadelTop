// Domain types matching the frontend contract

export interface Player {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  age?: number;
  avatarUrl?: string;
  ranking?: number;
  points?: number;
  seed?: string;
  category?: string;
  birthplace?: string;
}

export interface Team {
  players: Player[];
}

export interface RankingEntry {
  position: number;
  previousPosition?: number;
  player: Player;
  points: number;
}

export type TournamentStatus = 'ongoing' | 'upcoming' | 'finished';

export interface Tournament {
  id: string;
  name: string;
  circuit: string;
  tier: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  prizeMoney: string;
  surface: string;
  category: string;
  status: TournamentStatus;
  pairsCount?: number;
  season: number;
}

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
  category?: string;
  startTime?: string;
  durationMinutes?: number;
  location?: string;
  locationFlag?: string;
  court?: string;
  courtOrder?: number;
  teamA: Team;
  teamB: Team;
  sets: SetScore[];
  currentGame?: GameScore;
  currentGameScore?: CurrentGameScore;
  currentSetGames?: CurrentSetGames;
  server?: 'A' | 'B';
  winner?: 'team_1' | 'team_2';
  tournamentTier?: string;
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
