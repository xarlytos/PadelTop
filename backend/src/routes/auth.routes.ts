import { Router } from 'express';
import { getSupabase } from '../services/db-client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

router.post('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { display_name, avatar_url, theme } = req.body;
    const { data, error } = await getSupabase()
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        display_name,
        avatar_url,
        theme: theme || 'system',
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

router.post('/fcm-token', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token || typeof fcm_token !== 'string') {
      res.status(400).json({ error: 'fcm_token is required' });
      return;
    }

    const { error } = await getSupabase()
      .from('push_tokens')
      .upsert({ user_id: req.user.id, token: fcm_token } as never, { onConflict: 'user_id,token' });

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to store push token' });
  }
});

router.delete('/fcm-token', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fcm_token } = req.body;
    let query = getSupabase().from('push_tokens').delete();

    if (fcm_token && typeof fcm_token === 'string') {
      query = query.eq('user_id', req.user.id).eq('token', fcm_token);
    } else {
      query = query.eq('user_id', req.user.id);
    }

    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear push token' });
  }
});

router.patch('/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { notify_tournament_starts } = req.body;
    const updates: any = {};
    if (typeof notify_tournament_starts === 'boolean') {
      updates.notify_tournament_starts = notify_tournament_starts;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const { error } = await getSupabase()
      .from('profiles')
      .update(updates as never)
      .eq('id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notification preferences' });
  }
});

// Upload avatar via backend (avoids RLS issues on client)
router.post('/avatar', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { image, fileExt = 'jpg' } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'image (base64) is required' });
      return;
    }

    const buffer = Buffer.from(image, 'base64');
    const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${req.user.id}/${fileName}`;
    const contentType = `image/${fileExt === 'png' ? 'png' : fileExt === 'webp' ? 'webp' : 'jpeg'}`;

    const { error: uploadError } = await getSupabase()
      .storage
      .from('avatars')
      .upload(filePath, buffer, { upsert: true, contentType });

    if (uploadError) {
      res.status(500).json({ error: uploadError.message });
      return;
    }

    const { data } = getSupabase().storage.from('avatars').getPublicUrl(filePath);
    res.json({ publicUrl: data.publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
  }
});

router.delete('/account', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;

    // 1. Eliminar perfil (cascada a favorites, push_tokens, subscriptions, sent_notifications)
    const { error: profileError } = await getSupabase()
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      res.status(500).json({ error: profileError.message || 'Failed to delete profile data' });
      return;
    }

    // 2. Eliminar usuario de Supabase Auth
    const { error: authError } = await getSupabase().auth.admin.deleteUser(userId);

    if (authError) {
      res.status(500).json({ error: authError.message || 'Failed to delete user account' });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete account' });
  }
});

export default router;
