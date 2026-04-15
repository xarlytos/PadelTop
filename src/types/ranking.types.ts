import type { Player } from './player.types';

export interface RankingEntry {
  position: number;
  previousPosition?: number;
  player: Player;
  points: number;
}
