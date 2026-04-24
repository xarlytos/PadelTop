import { Router } from 'express';
import { getSupabase } from '../services/db-client';

const router = Router();

const WEBHOOK_BEARER = process.env.REVENUECAT_WEBHOOK_AUTH_BEARER || '';

router.post('/revenuecat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (WEBHOOK_BEARER && token !== WEBHOOK_BEARER) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const event = req.body.event;
    if (!event) {
      res.status(400).json({ error: 'Missing event' });
      return;
    }

    const {
      type,
      app_user_id,
      product_id,
      store,
      transaction_id,
      expiration_at_ms,
      purchased_at_ms,
    } = event;

    if (!app_user_id) {
      res.status(400).json({ error: 'Missing app_user_id' });
      return;
    }

    const supabase = getSupabase();

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION': {
        const expiresAt = expiration_at_ms
          ? new Date(expiration_at_ms).toISOString()
          : null;

        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_expires_at: expiresAt,
            subscription_platform: store,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', app_user_id);

        await supabase.from('subscriptions').upsert(
          {
            user_id: app_user_id,
            platform: store,
            product_id,
            transaction_id,
            starts_at: purchased_at_ms ? new Date(purchased_at_ms).toISOString() : null,
            expires_at: expiresAt,
            is_active: true,
          } as any,
          { onConflict: 'transaction_id' }
        );
        break;
      }

      case 'EXPIRATION':
      case 'CANCELLATION': {
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', app_user_id);

        if (transaction_id) {
          await supabase
            .from('subscriptions')
            .update({ is_active: false } as never)
            .eq('transaction_id', transaction_id);
        }
        break;
      }

      case 'BILLING_ISSUE': {
        console.warn('[RevenueCat Webhook] Billing issue for user:', app_user_id);
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('[RevenueCat Webhook] Error:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
});

export default router;
