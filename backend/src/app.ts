import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';

import matchesRoutes from './routes/matches.routes';
import playersRoutes from './routes/players.routes';
import rankingsRoutes from './routes/rankings.routes';
import tournamentsRoutes from './routes/tournaments.routes';
import authRoutes from './routes/auth.routes';
import favoritesRoutes from './routes/favorites.routes';
import livestreamsRoutes from './routes/livestreams.routes';
import webhookRoutes from './routes/webhooks.routes';
import { query } from './services/neon-client';
import { syncTournaments, syncMatches, syncRankings, syncPlayers } from './services/sync.service';
import { checkTournamentStarts, checkMatchStarts, checkMatchResults } from './services/notification-jobs.service';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Log env check
if (!process.env.DATABASE_URL) {
  console.error('[Startup] ERROR: DATABASE_URL is not set!');
} else {
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`[Startup] Neon DB configured: ${dbUrl.hostname}/${dbUrl.pathname.slice(1)}`);
}

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/matches', matchesRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/livestreams', livestreamsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Check if data exists in Neon DB
async function hasData(table: string): Promise<boolean> {
  try {
    const result = await query(`SELECT COUNT(*) FROM ${table}`);
    const count = parseInt(result.rows[0]?.count || '0', 10);
    return count > 0;
  } catch {
    return false;
  }
}

// Initial sync if tables are empty
async function initialSync(): Promise<void> {
  console.log('[Startup] Testing Neon connection...');
  try {
    await query('SELECT 1');
    console.log('[Startup] Neon connection OK');
  } catch (err: any) {
    console.error('[Startup] Neon connection FAILED:', err.message || String(err));
    return;
  }

  console.log('[Startup] Checking if data exists in database...');
  const hasTournaments = await hasData('tournaments');
  const hasMatches = await hasData('matches');
  const hasRankings = await hasData('rankings');
  const hasPlayers = await hasData('players');

  if (!hasTournaments || !hasMatches || !hasRankings || !hasPlayers) {
    console.log('[Startup] Some tables are empty, running initial sync...');
    const start = Date.now();

    try {
      if (!hasTournaments) await syncTournaments();
      if (!hasMatches) await syncMatches();
      if (!hasRankings) {
        await syncRankings('male');
        await syncRankings('female');
      }
      if (!hasPlayers) await syncPlayers();

      console.log(`[Startup] Initial sync completed in ${Date.now() - start}ms`);
    } catch (err: any) {
      console.warn('[Startup] Initial sync error:', err.message || String(err));
    }
  } else {
    console.log('[Startup] Database already has data, skipping initial sync');
  }
}

// Schedule periodic sync jobs
function scheduleSyncJobs(): void {
  // Tournaments: every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    console.log('[Cron] Syncing tournaments...');
    syncTournaments().catch((err) => console.error('[Cron] Tournament sync failed:', err));
  });

  // Matches: every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('[Cron] Syncing matches...');
    syncMatches().catch((err) => console.error('[Cron] Match sync failed:', err));
  });

  // Rankings male: once per day at 4:00 AM
  cron.schedule('0 4 * * *', () => {
    console.log('[Cron] Syncing male rankings...');
    syncRankings('male').catch((err) => console.error('[Cron] Male ranking sync failed:', err));
  });

  // Rankings female: once per day at 4:30 AM
  cron.schedule('30 4 * * *', () => {
    console.log('[Cron] Syncing female rankings...');
    syncRankings('female').catch((err) => console.error('[Cron] Female ranking sync failed:', err));
  });

  // Players: every 2 hours
  cron.schedule('0 */2 * * *', () => {
    console.log('[Cron] Syncing players...');
    syncPlayers().catch((err) => console.error('[Cron] Player sync failed:', err));
  });

  console.log('[Cron] Scheduled sync jobs: tournaments (30min), matches (10min), rankings (daily 4am), players (2h)');
}

// Schedule notification jobs
function scheduleNotificationJobs(): void {
  // Tournament starts: once per day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('[Cron] Checking tournament starts...');
    checkTournamentStarts().catch((err) => console.error('[Cron] Tournament start check failed:', err));
  });

  // Match starts: every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('[Cron] Checking match starts...');
    checkMatchStarts().catch((err) => console.error('[Cron] Match start check failed:', err));
  });

  // Match results: every 5 minutes (offset by 2 min from match starts)
  cron.schedule('2-57/5 * * * *', () => {
    console.log('[Cron] Checking match results...');
    checkMatchResults().catch((err) => console.error('[Cron] Match result check failed:', err));
  });

  console.log('[Cron] Scheduled notification jobs: tournament starts (9am daily), match starts (5min), match results (5min offset)');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('[PadelAPI] Servidor iniciado - Verificando datos...');

  // Run initial sync then start cron jobs
  initialSync().then(() => {
    scheduleSyncJobs();
    scheduleNotificationJobs();
    console.log('[PadelAPI] BACKEND LISTO - Ya puede recibir peticiones');
  }).catch((err) => {
    console.error('[Startup] Failed:', err);
    scheduleSyncJobs();
    scheduleNotificationJobs();
    console.log('[PadelAPI] BACKEND LISTO (con errores de sync)');
  });
});
