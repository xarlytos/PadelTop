import { query } from '../src/services/neon-client';

async function main() {
  try {
    await query('ALTER TABLE rankings ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    console.log('Columna avatar_url añadida correctamente');
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
