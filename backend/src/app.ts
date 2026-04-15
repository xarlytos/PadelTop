import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import matchesRoutes from './routes/matches.routes';
import playersRoutes from './routes/players.routes';
import rankingsRoutes from './routes/rankings.routes';
import tournamentsRoutes from './routes/tournaments.routes';
import authRoutes from './routes/auth.routes';
import favoritesRoutes from './routes/favorites.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
