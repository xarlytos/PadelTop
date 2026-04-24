require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL no está definido en .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('1. Contando duplicados...');
    const countRes = await client.query(`
      SELECT player_id, gender, COUNT(*) as cnt
      FROM rankings
      GROUP BY player_id, gender
      HAVING COUNT(*) > 1
    `);
    console.log(`   Duplicados encontrados: ${countRes.rows.length} jugadores`);

    console.log('2. Eliminando duplicados (conservando el de menor posición)...');
    await client.query(`
      DELETE FROM rankings
      WHERE id NOT IN (
        SELECT DISTINCT ON (gender, player_id) id
        FROM rankings
        ORDER BY gender, player_id, position ASC
      )
    `);
    console.log('   Duplicados eliminados.');

    console.log('3. Añadiendo constraint UNIQUE(gender, player_id)...');
    await client.query(`
      ALTER TABLE rankings
      ADD CONSTRAINT rankings_gender_player_id_unique
      UNIQUE (gender, player_id)
    `);
    console.log('   Constraint añadido correctamente.');

    console.log('4. Verificando...');
    const verify = await client.query(`
      SELECT gender, COUNT(*) as total
      FROM rankings
      GROUP BY gender
    `);
    for (const row of verify.rows) {
      console.log(`   ${row.gender}: ${row.total} jugadores`);
    }

    console.log('\n✅ Todo listo. Los rankings ya no tendrán jugadores duplicados.');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message.includes('already exists')) {
      console.log('   El constraint ya existía. No pasa nada.');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
