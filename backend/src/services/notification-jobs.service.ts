import { query } from './neon-client';
import {
  sendPushNotification,
  hasNotificationBeenSent,
  markNotificationSent,
} from './notifications.service';

// --- Tournament start notifications ---

export async function checkTournamentStarts(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tournamentsResult = await query(
      `SELECT id, name, city, country, start_date, end_date FROM tournaments WHERE start_date = $1`,
      [today]
    );

    if (tournamentsResult.rows.length === 0) return;

    const tokensResult = await query(
      `SELECT pt.user_id, pt.token FROM push_tokens pt
       JOIN profiles p ON p.id = pt.user_id
       WHERE p.notify_tournament_starts = true`
    );

    for (const tournament of tournamentsResult.rows) {
      const title = '🏆 Empieza un torneo';
      const body = `Hoy empieza el ${tournament.name}${tournament.city ? ` en ${tournament.city}` : ''}`;

      for (const row of tokensResult.rows) {
        const alreadySent = await hasNotificationBeenSent(row.user_id, 'tournament_start', tournament.id);
        if (alreadySent) continue;

        await sendPushNotification([row.token], { title, body });
        await markNotificationSent(row.user_id, 'tournament_start', tournament.id);
      }
    }

    console.log(`[NotificationJobs] Tournament start check complete. ${tournamentsResult.rows.length} tournaments notified.`);
  } catch (err: any) {
    console.error('[NotificationJobs] Tournament start check failed:', err.message);
  }
}

// --- Match start notifications ---

interface MatchRow {
  id: string;
  tournament_name: string;
  round: string;
  team_a: any;
  team_b: any;
}

function extractPlayerIdsFromTeam(teamJson: any): string[] {
  if (!teamJson || !teamJson.players || !Array.isArray(teamJson.players)) return [];
  return teamJson.players.map((p: any) => String(p.id || '')).filter(Boolean);
}

export async function checkMatchStarts(): Promise<void> {
  try {
    const matchesResult = await query(
      `SELECT id, tournament_name, round, team_a, team_b FROM matches WHERE status = 'live'`
    );

    const matches: MatchRow[] = matchesResult.rows;
    if (matches.length === 0) return;

    for (const match of matches) {
      const playerIds = [
        ...extractPlayerIdsFromTeam(match.team_a),
        ...extractPlayerIdsFromTeam(match.team_b),
      ];

      if (playerIds.length === 0) continue;

      const placeholders = playerIds.map((_, i) => `$${i + 1}`).join(',');
      const favoritesResult = await query(
        `SELECT DISTINCT user_id FROM favorites WHERE player_id IN (${placeholders}) AND notify_match_start = true`,
        playerIds
      );

      const userIds: string[] = favoritesResult.rows.map((r: any) => r.user_id);
      if (userIds.length === 0) continue;

      // Build message: list favorite player names
      const favoriteNamesResult = await query(
        `SELECT DISTINCT player_name FROM favorites WHERE user_id = ANY($1) AND player_id = ANY($2) AND notify_match_start = true`,
        [userIds, playerIds]
      );
      const names = favoriteNamesResult.rows.map((r: any) => r.player_name);

      const title = '🔥 Tu favorito juega';
      let body = `Un partido acaba de empezar`;
      if (names.length === 1) {
        body = `${names[0]} acaba de empezar su partido`;
      } else if (names.length > 1) {
        body = `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]} juegan ahora`;
      }
      if (match.round && match.round !== 'Unknown') {
        body += ` (${match.round})`;
      }

      for (const userId of userIds) {
        const alreadySent = await hasNotificationBeenSent(userId, 'match_start', match.id);
        if (alreadySent) continue;

        const userTokensResult = await query(
          `SELECT token FROM push_tokens WHERE user_id = $1`,
          [userId]
        );
        const tokens = userTokensResult.rows.map((r: any) => r.token);
        if (tokens.length === 0) continue;

        await sendPushNotification(tokens, { title, body, data: { matchId: match.id } });
        await markNotificationSent(userId, 'match_start', match.id);
      }
    }

    console.log(`[NotificationJobs] Match start check complete. ${matches.length} live matches checked.`);
  } catch (err: any) {
    console.error('[NotificationJobs] Match start check failed:', err.message);
  }
}

// --- Match result notifications ---

export async function checkMatchResults(): Promise<void> {
  try {
    const matchesResult = await query(
      `SELECT id, tournament_name, round, team_a, team_b, sets, winner FROM matches WHERE status = 'finished' AND winner IS NOT NULL`
    );

    const matches: (MatchRow & { sets: any; winner: string })[] = matchesResult.rows;
    if (matches.length === 0) return;

    for (const match of matches) {
      const playerIds = [
        ...extractPlayerIdsFromTeam(match.team_a),
        ...extractPlayerIdsFromTeam(match.team_b),
      ];

      if (playerIds.length === 0) continue;

      const placeholders = playerIds.map((_, i) => `$${i + 1}`).join(',');
      const favoritesResult = await query(
        `SELECT DISTINCT user_id FROM favorites WHERE player_id IN (${placeholders}) AND notify_score_changes = true`,
        playerIds
      );

      const userIds: string[] = favoritesResult.rows.map((r: any) => r.user_id);
      if (userIds.length === 0) continue;

      // Build score string
      const sets = Array.isArray(match.sets) ? match.sets : [];
      const scoreStr = sets
        .map((s: any) => {
          const a = s.teamA ?? s.team_a ?? s['team-1'] ?? '';
          const b = s.teamB ?? s.team_b ?? s['team-2'] ?? '';
          return `${a}-${b}`;
        })
        .filter(Boolean)
        .join(', ');

      // Determine winner team players
      let winnerNames: string[] = [];
      let loserNames: string[] = [];
      const teamAIds = extractPlayerIdsFromTeam(match.team_a);
      const teamBIds = extractPlayerIdsFromTeam(match.team_b);

      if (match.winner === 'team_1') {
        winnerNames = match.team_a?.players?.map((p: any) => p.name) || [];
        loserNames = match.team_b?.players?.map((p: any) => p.name) || [];
      } else if (match.winner === 'team_2') {
        winnerNames = match.team_b?.players?.map((p: any) => p.name) || [];
        loserNames = match.team_a?.players?.map((p: any) => p.name) || [];
      }

      for (const userId of userIds) {
        const alreadySent = await hasNotificationBeenSent(userId, 'match_result', match.id);
        if (alreadySent) continue;

        // Find which favorite player(s) this user has in this match
        const userFavoritesResult = await query(
          `SELECT player_id, player_name FROM favorites WHERE user_id = $1 AND player_id = ANY($2) AND notify_score_changes = true`,
          [userId, playerIds]
        );
        const favs = userFavoritesResult.rows;
        if (favs.length === 0) continue;

        const userTokensResult = await query(
          `SELECT token FROM push_tokens WHERE user_id = $1`,
          [userId]
        );
        const tokens = userTokensResult.rows.map((r: any) => r.token);
        if (tokens.length === 0) continue;

        // Check if user's favorite won or lost
        const favPlayerIds = favs.map((f: any) => f.player_id);
        const favInWinnerTeam = match.winner === 'team_1'
          ? favPlayerIds.some((id: string) => teamAIds.includes(id))
          : match.winner === 'team_2'
          ? favPlayerIds.some((id: string) => teamBIds.includes(id))
          : false;

        const favName = favs[0].player_name;
        const title = favInWinnerTeam ? '✅ Victoria' : '❌ Derrota';
        let body = `${favName} ${favInWinnerTeam ? 'ganó' : 'perdió'}`;
        if (scoreStr) {
          body += ` (${scoreStr})`;
        }
        if (match.round && match.round !== 'Unknown') {
          body += ` - ${match.round}`;
        }

        await sendPushNotification(tokens, { title, body, data: { matchId: match.id } });
        await markNotificationSent(userId, 'match_result', match.id);
      }
    }

    console.log(`[NotificationJobs] Match result check complete. ${matches.length} finished matches checked.`);
  } catch (err: any) {
    console.error('[NotificationJobs] Match result check failed:', err.message);
  }
}
