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
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

export default router;
