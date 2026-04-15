export type TournamentStatus = 'ongoing' | 'upcoming' | 'finished';
export type TournamentCircuit = 'Premier Padel' | 'FIP';
export type TournamentCategory = 'male' | 'female' | 'both';
export type TournamentTier = 'P1' | 'P2' | 'Major' | 'Open' | 'Master';

export interface Tournament {
  id: string;
  name: string;
  circuit: TournamentCircuit;
  tier: TournamentTier;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  prizeMoney: string;
  surface: string;
  category: TournamentCategory;
  status: TournamentStatus;
  pairsCount?: number;
  season: number;
}
