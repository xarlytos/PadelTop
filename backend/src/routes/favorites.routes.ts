import { Router } from 'express';
import { getSupabase } from '../services/db-client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

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

    // Check if user is premium
    const { data: profile, error: profileError } = await getSupabase()
      .from('profiles')
      .select('is_premium')
      .eq('id', req.user.id)
      .single();

    if (profileError) throw profileError;

    if (!(profile as any)?.is_premium) {
      const { count, error: countError } = await getSupabase()
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id);

      if (countError) throw countError;

      if ((count || 0) >= MAX_FREE_FAVORITES) {
        res.status(403).json({ error: 'Free plan limit reached', limit: MAX_FREE_FAVORITES });
        return;
      }
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
      } as any)
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

router.patch('/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { notify_match_start, notify_score_changes } = req.body;
    const updates: any = {};
    if (typeof notify_match_start === 'boolean') updates.notify_match_start = notify_match_start;
    if (typeof notify_score_changes === 'boolean') updates.notify_score_changes = notify_score_changes;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const { error } = await getSupabase()
      .from('favorites')
      .update(updates as never)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notification preferences' });
  }
});

export default router;
