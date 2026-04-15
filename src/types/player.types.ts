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
}

export interface Team {
  players: Player[];
}
