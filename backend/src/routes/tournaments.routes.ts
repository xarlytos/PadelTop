import { Router } from 'express';
import * as dataSource from '../services/data-source.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await dataSource.getTournaments();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch tournaments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await dataSource.getTournamentById(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch tournament' });
  }
});

router.get('/:id/matches', async (req, res) => {
  try {
    const data = await dataSource.getTournamentMatches(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch tournament matches' });
  }
});

export default router;
