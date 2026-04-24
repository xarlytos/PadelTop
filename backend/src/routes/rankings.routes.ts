import { Router } from 'express';
import * as dataSource from '../services/data-source.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const gender = req.query.gender as 'male' | 'female' | undefined;
    const data = await dataSource.getRankings(gender);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch rankings' });
  }
});

export default router;
