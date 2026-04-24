import { query } from '../src/services/neon-client';

async function main() {
  const r = await query('SELECT COUNT(*) as total, COUNT(avatar_url) as with_avatar FROM rankings WHERE gender = $1', ['male']);
  console.log('Male rankings:', r.rows[0]);

  const r2 = await query('SELECT player_name, avatar_url FROM rankings WHERE gender = $1 AND avatar_url IS NOT NULL LIMIT 3', ['male']);
  console.log('Sample avatars:', r2.rows);
}

main().catch(e => { console.error(e.message); process.exit(1); });
