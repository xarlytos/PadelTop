import type { MatchStatsData } from '../types/match.types';

export const mockMatchStats: Record<string, MatchStatsData> = {
  'match-1': {
    pointsWon: { teamA: 87, teamB: 82 },
    unforcedErrors: { teamA: 24, teamB: 28 },
    winners: { teamA: 42, teamB: 38 },
    doubleFaults: { teamA: 3, teamB: 5 },
    breakPoints: { teamA: '4/9', teamB: '3/7' },
    firstServePercentage: { teamA: 68, teamB: 62 },
    firstServePointsWon: { teamA: 72, teamB: 65 },
    secondServePointsWon: { teamA: 54, teamB: 48 },
  },
  'match-3': {
    pointsWon: { teamA: 78, teamB: 64 },
    unforcedErrors: { teamA: 18, teamB: 22 },
    winners: { teamA: 36, teamB: 29 },
    doubleFaults: { teamA: 2, teamB: 4 },
    breakPoints: { teamA: '5/8', teamB: '2/5' },
    firstServePercentage: { teamA: 71, teamB: 58 },
    firstServePointsWon: { teamA: 75, teamB: 60 },
    secondServePointsWon: { teamA: 58, teamB: 45 },
  },
  'match-4': {
    pointsWon: { teamA: 92, teamB: 88 },
    unforcedErrors: { teamA: 26, teamB: 30 },
    winners: { teamA: 45, teamB: 41 },
    doubleFaults: { teamA: 4, teamB: 6 },
    breakPoints: { teamA: '3/6', teamB: '4/10' },
    firstServePercentage: { teamA: 65, teamB: 64 },
    firstServePointsWon: { teamA: 70, teamB: 66 },
    secondServePointsWon: { teamA: 52, teamB: 50 },
  },
};
