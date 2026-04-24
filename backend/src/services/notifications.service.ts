import { Expo } from 'expo-server-sdk';
import { query } from './neon-client';

const expo = new Expo();

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ success: number; failure: number; invalidTokens: string[] }> {
  const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
  const invalidFormatTokens = tokens.filter((t) => !Expo.isExpoPushToken(t));

  if (validTokens.length === 0) {
    return { success: 0, failure: tokens.length, invalidTokens: invalidFormatTokens };
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
    priority: 'high' as const,
    channelId: 'default',
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens: string[] = [...invalidFormatTokens];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      ticketChunk.forEach((ticket, idx) => {
        if (ticket.status === 'ok') {
          successCount++;
        } else {
          failureCount++;
          if (ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push(chunk[idx].to as string);
          }
        }
      });
    } catch (err: any) {
      console.error('[Notifications] Failed to send chunk:', err.message);
      failureCount += chunk.length;
    }
  }

  if (invalidTokens.length > 0) {
    await cleanupInvalidTokens(invalidTokens);
  }

  return { success: successCount, failure: failureCount, invalidTokens };
}

async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  try {
    const placeholders = tokens.map((_, i) => `$${i + 1}`).join(',');
    await query(`DELETE FROM push_tokens WHERE token IN (${placeholders})`, tokens);
    console.log(`[Notifications] Cleaned up ${tokens.length} invalid push tokens`);
  } catch (err: any) {
    console.error('[Notifications] Failed to cleanup invalid tokens:', err.message);
  }
}

export async function getFcmTokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query(
    `SELECT token FROM push_tokens WHERE user_id IN (${placeholders})`,
    userIds
  );
  return result.rows.map((r: any) => r.token).filter(Boolean);
}

export async function hasNotificationBeenSent(
  userId: string,
  type: string,
  referenceId: string
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM sent_notifications WHERE user_id = $1 AND type = $2 AND reference_id = $3 LIMIT 1`,
    [userId, type, referenceId]
  );
  return result.rows.length > 0;
}

export async function markNotificationSent(
  userId: string,
  type: string,
  referenceId: string
): Promise<void> {
  await query(
    `INSERT INTO sent_notifications (user_id, type, reference_id, sent_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, type, reference_id) DO NOTHING`,
    [userId, type, referenceId]
  );
}
