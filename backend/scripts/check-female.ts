import { query } from '../src/services/neon-client';

async function main() {
  const r = await query('SELECT COUNT(*) as total, COUNT(avatar_url) as with_avatar FROM rankings WHERE gender = $1', ['female']);
  console.log('Female rankings:', r.rows[0]);
}

main().catch(e => { console.error(e.message); process.exit(1); });
