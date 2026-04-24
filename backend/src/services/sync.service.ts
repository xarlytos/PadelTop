import { query, transaction } from './neon-client';
import * as padelApi from './padelapi.service';
import * as fipRankings from './fiprankings.service';
import {
  mapPadelapiTournaments,
  mapPadelapiMatches,
  mapPadelapiPlayers,
} from '../mappers/padelapi.mappers';
import type { Tournament, Player, Match } from '../types/domain.types';

export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (err: any) {
    console.error('[Neon] Connection test failed:', err.message || err);
    return false;
  }
}

// --- Tournament sync ---

export async function syncTournaments(): Promise<void> {
  const source = 'tournaments';
  try {
    const raw = await padelApi.getTournaments(5);
    const tournaments = mapRawTournaments(raw);

    await transaction(async (client) => {
      for (const t of tournaments) {
        await client.query(
          `INSERT INTO tournaments (id, name, circuit, tier, city, country, start_date, end_date, status, season, pairs_count, surface, prize_money, category, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             circuit = EXCLUDED.circuit,
             tier = EXCLUDED.tier,
             city = EXCLUDED.city,
             country = EXCLUDED.country,
             start_date = EXCLUDED.start_date,
             end_date = EXCLUDED.end_date,
             status = EXCLUDED.status,
             season = EXCLUDED.season,
             pairs_count = EXCLUDED.pairs_count,
             surface = EXCLUDED.surface,
             prize_money = EXCLUDED.prize_money,
             category = EXCLUDED.category,
             updated_at = NOW()`,
          [t.id, t.name, t.circuit, t.tier, t.city, t.country, t.startDate, t.endDate, t.status, t.season, t.pairsCount, t.surface, t.prizeMoney, t.category]
        );
      }
    });

    await updateSyncState(source, tournaments.length, 'ok');
    console.log(`[Sync] ${tournaments.length} tournaments synced`);
  } catch (err: any) {
    const msg = err.message || String(err);
    console.error('[Sync] Failed to sync tournaments:', msg);
    await updateSyncState(source, 0, 'error', msg);
  }
}

// --- Match sync ---

export async function syncMatches(): Promise<void> {
  const source = 'matches';
  try {
    const raw = await padelApi.getMatches();
    const matches = mapRawMatches(raw);

    await transaction(async (client) => {
      for (const m of matches) {
        await client.query(
          `INSERT INTO matches (id, tournament_id, tournament_name, round, status, category, start_time, duration_minutes, location, court, team_a, team_b, sets, winner, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
           ON CONFLICT (id) DO UPDATE SET
             tournament_id = EXCLUDED.tournament_id,
             tournament_name = EXCLUDED.tournament_name,
             round = EXCLUDED.round,
             status = EXCLUDED.status,
             category = EXCLUDED.category,
             start_time = EXCLUDED.start_time,
             duration_minutes = EXCLUDED.duration_minutes,
             location = EXCLUDED.location,
             court = EXCLUDED.court,
             team_a = EXCLUDED.team_a,
             team_b = EXCLUDED.team_b,
             sets = EXCLUDED.sets,
             winner = EXCLUDED.winner,
             updated_at = NOW()`,
          [m.id, m.tournamentId, m.tournamentName, m.round, m.status, m.category, m.startTime, m.durationMinutes, m.location, m.court, JSON.stringify(m.teamA), JSON.stringify(m.teamB), JSON.stringify(m.sets), m.winner]
        );
      }
    });

    await updateSyncState(source, matches.length, 'ok');
    console.log(`[Sync] ${matches.length} matches synced`);
  } catch (err: any) {
    const msg = err.message || String(err);
    console.error('[Sync] Failed to sync matches:', msg);
    await updateSyncState(source, 0, 'error', msg);
  }
}

// --- Rankings sync ---

export async function syncRankings(gender: 'male' | 'female'): Promise<void> {
  const source = `rankings_${gender}`;
  try {
    const entries = await fipRankings.getFipRankings(gender);

    await transaction(async (client) => {
      await client.query('DELETE FROM rankings WHERE gender = $1', [gender]);

      for (const e of entries) {
        await client.query(
          `INSERT INTO rankings (gender, position, previous_position, player_id, player_name, player_country, player_country_code, points, avatar_url, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
           ON CONFLICT (gender, player_id) DO UPDATE SET
             position = EXCLUDED.position,
             previous_position = EXCLUDED.previous_position,
             player_name = EXCLUDED.player_name,
             player_country = EXCLUDED.player_country,
             player_country_code = EXCLUDED.player_country_code,
             points = EXCLUDED.points,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = NOW()`,
          [gender, e.position, e.previousPosition, e.player.id, e.player.name, e.player.country, e.player.countryCode, e.points, e.player.avatarUrl || null]
        );
      }
    });

    await updateSyncState(source, entries.length, 'ok');
    console.log(`[Sync] ${entries.length} ${gender} rankings synced`);
  } catch (err: any) {
    const msg = err.message || String(err);
    console.error(`[Sync] Failed to sync ${gender} rankings:`, msg);
    await updateSyncState(source, 0, 'error', msg);
  }
}

// --- Player sync ---

export async function syncPlayers(): Promise<void> {
  const source = 'players';
  try {
    const raw = await padelApi.getPlayers();
    const players = mapRawPlayers(raw);

    await transaction(async (client) => {
      for (const p of players) {
        await client.query(
          `INSERT INTO players (id, name, country, country_code, age, avatar_url, ranking, points, seed, category, birthplace, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             country = EXCLUDED.country,
             country_code = EXCLUDED.country_code,
             age = EXCLUDED.age,
             avatar_url = EXCLUDED.avatar_url,
             ranking = EXCLUDED.ranking,
             points = EXCLUDED.points,
             seed = EXCLUDED.seed,
             category = EXCLUDED.category,
             birthplace = EXCLUDED.birthplace,
             updated_at = NOW()`,
          [p.id, p.name, p.country, p.countryCode, p.age, p.avatarUrl, p.ranking, p.points, p.seed, p.category, p.birthplace]
        );
      }
    });

    await updateSyncState(source, players.length, 'ok');
    console.log(`[Sync] ${players.length} players synced`);
  } catch (err: any) {
    const msg = err.message || String(err);
    console.error('[Sync] Failed to sync players:', msg);
    await updateSyncState(source, 0, 'error', msg);
  }
}

// --- Helpers ---

async function updateSyncState(
  source: string,
  count: number,
  status: 'ok' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO sync_state (source, last_sync_at, records_count, status, error_message)
       VALUES ($1, NOW(), $2, $3, $4)
       ON CONFLICT (source) DO UPDATE SET
         last_sync_at = EXCLUDED.last_sync_at,
         records_count = EXCLUDED.records_count,
         status = EXCLUDED.status,
         error_message = EXCLUDED.error_message`,
      [source, count, status, errorMessage || null]
    );
  } catch (err: any) {
    console.warn('[Sync] Failed to update sync_state:', err.message || String(err));
  }
}

// --- Raw mappers ---

function mapRawTournaments(raw: unknown[]): Tournament[] {
  return mapPadelapiTournaments(raw);
}

function mapRawMatches(raw: unknown[]): Match[] {
  return mapPadelapiMatches(raw);
}

function mapRawPlayers(raw: unknown[]): Player[] {
  return mapPadelapiPlayers(raw);
}
