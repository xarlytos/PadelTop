import { query } from '../src/services/neon-client';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

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
  const rankingMap = new Map<string, string>();
  for (const r of rankings.rows) {
    if (r.avatar_url) rankingMap.set(normalizeName(r.player_name), r.avatar_url);
  }

  let withAvatar = 0;
  let withoutAvatar = 0;
  const missing: string[] = [];
  for (const name of matchNames) {
    if (rankingMap.has(normalizeName(name))) {
      withAvatar++;
    } else {
      withoutAvatar++;
      missing.push(name);
    }
  }

  console.log('Con foto (normalizado):', withAvatar);
  console.log('Sin foto (normalizado):', withoutAvatar);
  console.log('\nFaltan:', missing.slice(0, 15));

  // Show some ranking names for comparison
  console.log('\nEjemplos en rankings:');
  const rankingNames = Array.from(rankingMap.keys()).slice(0, 15);
  console.log(rankingNames);
}

main().catch(e => { console.error(e.message); process.exit(1); });
