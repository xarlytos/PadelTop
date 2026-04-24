import { Router } from 'express';
import * as dataSource from '../services/data-source.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await dataSource.getPlayers();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch players' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await dataSource.getPlayerById(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch player' });
  }
});

export default router;
