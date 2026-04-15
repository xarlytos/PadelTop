import { Router } from 'express';
import * as padelApi from '../services/padelapi.service';

const router = Router();

router.get('/live', async (_req, res) => {
  try {
    const data = await padelApi.getLiveMatches();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch live matches' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const data = await padelApi.getMatches();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch matches' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await padelApi.getMatchById(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch match' });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const data = await padelApi.getMatchStats(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch match stats' });
  }
});

router.get('/:id/points', async (req, res) => {
  try {
    const data = await padelApi.getMatchPoints(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch match points' });
  }
});

export default router;
