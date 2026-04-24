import { query } from '../src/services/neon-client';
import { syncRankings } from '../src/services/sync.service';

async function main() {
  console.log('Borrando rankings actuales...');
  await query('DELETE FROM rankings');
  console.log('Re-sincronizando rankings masculino...');
  await syncRankings('male');
  console.log('Re-sincronizando rankings femenino...');
  await syncRankings('female');
  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
