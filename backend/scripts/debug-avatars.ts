import { query } from '../src/services/neon-client';

async function main() {
  const matches = await query('SELECT team_a, team_b FROM matches LIMIT 50');
  const matchNames = new Set<string>();
  for (const m of matches.rows) {
    for (const team of [m.team_a?.players || [], m.team_b?.players || []]) {
      for (const p of team) {
        if (p.name) matchNames.add(p.name.trim());
      }
    }
  }

  const rankings = await query('SELECT player_name, avatar_url FROM rankings WHERE gender = $1', ['male']);
  const rankingNames = new Map<string, string>();
  for (const r of rankings.rows) {
    if (r.avatar_url) rankingNames.set(r.player_name.trim().toLowerCase(), r.avatar_url);
  }

  console.log('Jugadores en partidos:', matchNames.size);
  console.log('Jugadores en rankings con foto:', rankingNames.size);

  let withAvatar = 0;
  let withoutAvatar = 0;
  const missing: string[] = [];
  for (const name of matchNames) {
    if (rankingNames.has(name.toLowerCase())) {
      withAvatar++;
    } else {
      withoutAvatar++;
      missing.push(name);
    }
  }

  console.log('Con foto:', withAvatar);
  console.log('Sin foto:', withoutAvatar);
  console.log('\nFaltan:', missing.slice(0, 10));
}

main().catch(e => { console.error(e.message); process.exit(1); });
