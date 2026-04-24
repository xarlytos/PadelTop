import { syncRankings } from '../src/services/sync.service';

async function main() {
  try {
    await syncRankings('female');
    console.log('Female sync completed');
  } catch (err: any) {
    console.error('Error:', err.message || err);
  }
}

main();
