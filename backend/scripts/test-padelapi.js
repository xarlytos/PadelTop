/**
 * Script de prueba para PadelAPI.org
 *
 * Uso:
 *   1. Registrate en https://padelapi.org/register
 *   2. Crea un API token en https://padelapi.org/user/api-tokens
 *   3. Pon el token en backend/.env: PADELAPI_KEY=tu_token_aqui
 *   4. Ejecuta: node scripts/test-padelapi.js
 *
 * Este script hace peticiones a todos los endpoints gratuitos y guarda
 * las respuestas en scripts/padelapi-responses/ para que podamos ajustar
 * los mappers si el formato no coincide.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = process.env.PADELAPI_BASE_URL || 'https://padelapi.org/api';
const API_KEY = process.env.PADELAPI_KEY;

if (!API_KEY) {
  console.error('ERROR: No tienes PADELAPI_KEY configurado en backend/.env');
  console.error('Registrate en https://padelapi.org/register y crea un token.');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Authorization: `Bearer ${API_KEY}` },
});

const outDir = path.join(__dirname, 'padelapi-responses');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function testEndpoint(name, method, url, params = {}) {
  console.log(`\n--- ${name} ---`);
  try {
    const { data } = await client.request({ method, url, params });
    const file = path.join(outDir, `${name.replace(/\s+/g, '-').toLowerCase()}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`OK - Guardado en ${file}`);

    // Mostrar estructura de primer elemento si es array
    if (Array.isArray(data) && data.length > 0) {
      console.log('Primer elemento keys:', Object.keys(data[0]).join(', '));
    } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data) && data.data.length > 0) {
      console.log('data[0] keys:', Object.keys(data.data[0]).join(', '));
    } else if (data && typeof data === 'object') {
      console.log('Response keys:', Object.keys(data).join(', '));
    }
    return data;
  } catch (err) {
    console.error(`ERROR: ${err.response?.status} ${err.response?.statusText}`);
    if (err.response?.data) {
      console.error('Response:', JSON.stringify(err.response.data, null, 2));
    }
    return null;
  }
}

(async () => {
  console.log('Testing PadelAPI.org endpoints...');
  console.log('Base URL:', BASE_URL);

  await testEndpoint('Seasons', 'GET', '/season/list-seasons');

  const players = await testEndpoint('Players', 'GET', '/player/list-players', { per_page: 5, page: 1 });

  if (players && Array.isArray(players) && players.length > 0) {
    const firstPlayerId = players[0].id || players[0].slug;
    if (firstPlayerId) {
      await testEndpoint('Player Detail', 'GET', '/player/show-player', { id: firstPlayerId });
    }
  }

  const tournaments = await testEndpoint('Tournaments', 'GET', '/tournament/list-tournaments', { per_page: 5, page: 1 });

  if (tournaments && Array.isArray(tournaments) && tournaments.length > 0) {
    const firstTournamentId = tournaments[0].id || tournaments[0].slug;
    if (firstTournamentId) {
      await testEndpoint('Tournament Detail', 'GET', '/tournament/show-tournament', { id: firstTournamentId });
      await testEndpoint('Tournament Matches', 'GET', '/tournament/list-tournament-matches', { id: firstTournamentId, per_page: 5 });
    }
  }

  const matches = await testEndpoint('Matches', 'GET', '/match/list-matches', { per_page: 5, page: 1 });

  if (matches && Array.isArray(matches) && matches.length > 0) {
    const firstMatchId = matches[0].id || matches[0].match_id;
    if (firstMatchId) {
      await testEndpoint('Match Detail', 'GET', '/match/show-match', { id: firstMatchId });
    }
  }

  // Estos requieren plan de pago, pero los probamos para ver el error
  await testEndpoint('Live Matches (paid)', 'GET', '/live/list-live-matches');
  await testEndpoint('Match Stats (paid)', 'GET', '/match/show-match-stats', { id: 'test' });

  console.log('\n=== DONE ===');
  console.log(`Respuestas guardadas en: ${outDir}`);
  console.log('Revisa los archivos JSON y dime si el formato coincide con lo esperado.');
})();
