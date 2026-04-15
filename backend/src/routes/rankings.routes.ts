import { Router } from 'express';
import * as padelApi from '../services/padelapi.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await padelApi.getRankings();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch rankings' });
  }
});

export default router;
