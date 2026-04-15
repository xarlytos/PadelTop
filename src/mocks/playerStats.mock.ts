export interface PlayerSeasonStats {
  matchesPlayed: number;
  matchesWon: number;
  titles: number;
  finals: number;
  aces: number;
  doubleFaults: number;
  pointsWonPercentage: number;
  breakPointsConverted: string;
}

export interface PlayerTournamentResult {
  tournamentName: string;
  year: number;
  result: string;
  partner?: string;
}

export const mockPlayerSeasonStats: Record<string, PlayerSeasonStats> = {
  tapia: {
    matchesPlayed: 42,
    matchesWon: 38,
    titles: 8,
    finals: 3,
    aces: 124,
    doubleFaults: 28,
    pointsWonPercentage: 58,
    breakPointsConverted: '45%',
  },
  coello: {
    matchesPlayed: 42,
    matchesWon: 38,
    titles: 8,
    finals: 3,
    aces: 98,
    doubleFaults: 32,
    pointsWonPercentage: 56,
    breakPointsConverted: '42%',
  },
  galan: {
    matchesPlayed: 40,
    matchesWon: 34,
    titles: 5,
    finals: 4,
    aces: 110,
    doubleFaults: 35,
    pointsWonPercentage: 55,
    breakPointsConverted: '41%',
  },
  chingotto: {
    matchesPlayed: 40,
    matchesWon: 34,
    titles: 5,
    finals: 4,
    aces: 87,
    doubleFaults: 30,
    pointsWonPercentage: 54,
    breakPointsConverted: '40%',
  },
  triay: {
    matchesPlayed: 36,
    matchesWon: 31,
    titles: 6,
    finals: 3,
    aces: 45,
    doubleFaults: 18,
    pointsWonPercentage: 57,
    breakPointsConverted: '44%',
  },
  salazar: {
    matchesPlayed: 35,
    matchesWon: 28,
    titles: 4,
    finals: 5,
    aces: 38,
    doubleFaults: 22,
    pointsWonPercentage: 54,
    breakPointsConverted: '39%',
  },
};

export const mockPlayerTournamentHistory: Record<string, PlayerTournamentResult[]> = {
  tapia: [
    { tournamentName: 'Gijón Open', year: 2026, result: 'Campeón', partner: 'Coello' },
    { tournamentName: 'Madrid Major', year: 2026, result: 'Finalista', partner: 'Coello' },
    { tournamentName: 'Qatar Major', year: 2026, result: 'Campeón', partner: 'Coello' },
    { tournamentName: 'Alicante Open', year: 2025, result: 'Semifinal', partner: 'Coello' },
  ],
  coello: [
    { tournamentName: 'Gijón Open', year: 2026, result: 'Campeón', partner: 'Tapia' },
    { tournamentName: 'Madrid Major', year: 2026, result: 'Finalista', partner: 'Tapia' },
    { tournamentName: 'Qatar Major', year: 2026, result: 'Campeón', partner: 'Tapia' },
  ],
  galan: [
    { tournamentName: 'Gijón Open', year: 2026, result: 'Finalista', partner: 'Chingotto' },
    { tournamentName: 'Madrid Major', year: 2026, result: 'Campeón', partner: 'Chingotto' },
    { tournamentName: 'Brussels Open', year: 2025, result: 'Semifinal', partner: 'Chingotto' },
  ],
  triay: [
    { tournamentName: 'Gijón Open', year: 2026, result: 'Campeón', partner: 'Fernández' },
    { tournamentName: 'Madrid Major', year: 2026, result: 'Campeón', partner: 'Fernández' },
    { tournamentName: 'Amsterdam Open', year: 2025, result: 'Finalista', partner: 'Fernández' },
  ],
};
