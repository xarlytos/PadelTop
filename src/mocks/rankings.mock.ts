import type { RankingEntry } from '../types/ranking.types';
import { mockPlayers } from './players.mock';

export const mockRankingsMale: RankingEntry[] = [
  { position: 1, previousPosition: 1, player: mockPlayers.tapia, points: 12540 },
  { position: 2, previousPosition: 2, player: mockPlayers.galan, points: 11200 },
  { position: 3, previousPosition: 4, player: mockPlayers.lebron, points: 9870 },
  { position: 4, previousPosition: 3, player: mockPlayers.dinenno, points: 9650 },
  { position: 5, previousPosition: 5, player: mockPlayers.navarro, points: 9120 },
];

export const mockRankingsFemale: RankingEntry[] = [
  { position: 1, previousPosition: 2, player: mockPlayers.triay, points: 11800 },
  { position: 2, previousPosition: 1, player: mockPlayers.salazar, points: 10950 },
  { position: 3, previousPosition: 3, player: mockPlayers.ari, points: 10500 },
  { position: 4, previousPosition: 4, player: mockPlayers.orrono, points: 9800 },
  { position: 5, previousPosition: 5, player: mockPlayers.riefa, points: 9200 },
];
