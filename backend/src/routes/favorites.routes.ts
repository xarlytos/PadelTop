import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

const MAX_FREE_FAVORITES = 2;

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch favorites' });
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { player_id, player_name, player_avatar_url, notify_match_start, notify_score_changes } = req.body;

    const { count, error: countError } = await getSupabase()
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (countError) throw countError;

    if ((count || 0) >= MAX_FREE_FAVORITES) {
      res.status(403).json({ error: 'Free plan limit reached', limit: MAX_FREE_FAVORITES });
      return;
    }

    const { data, error } = await getSupabase()
      .from('favorites')
      .insert({
        user_id: req.user.id,
        player_id,
        player_name,
        player_avatar_url,
        notify_match_start: notify_match_start ?? true,
        notify_score_changes: notify_score_changes ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add favorite' });
  }
});

router.delete('/:playerId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { error } = await getSupabase()
      .from('favorites')
      .delete()
      .eq('user_id', req.user.id)
      .eq('player_id', req.params.playerId);

    if (error) throw error;
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove favorite' });
  }
});

export default router;
