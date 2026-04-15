import { Router } from 'express';
import * as padelApi from '../services/padelapi.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await padelApi.getTournaments();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch tournaments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await padelApi.getTournamentById(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch tournament' });
  }
});

export default router;
