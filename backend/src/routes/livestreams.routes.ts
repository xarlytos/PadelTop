import { Router } from 'express';
import * as youtubeService from '../services/youtube.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const streams = await youtubeService.getPremierPadelLiveStreams();
    res.json(streams);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch live streams' });
  }
});

export default router;
