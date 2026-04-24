import axios from 'axios';

const BASE_URL = 'https://www.padelfip.com/wp-json/fip/v1/ranking/load-more';

async function main() {
  try {
    // Get week number
    const { data: html } = await axios.get('https://www.padelfip.com/fip-rankings/', {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      timeout: 15000,
    });
    const match = html.match(/data-week-no="(\d+)"/);
    const weekNo = match ? parseInt(match[1], 10) : 16;
    console.log('Week:', weekNo);

    // Test male
    const maleRes = await axios.get(BASE_URL, {
      params: { gender: 'male', offset: 0, category: 'master', circuit: 'premierpadel', year: 2026, week: weekNo },
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      timeout: 15000,
    });
    console.log('Male count:', Array.isArray(maleRes.data) ? maleRes.data.length : 'not array');

    // Test female
    const femaleRes = await axios.get(BASE_URL, {
      params: { gender: 'female', offset: 0, category: 'master', circuit: 'premierpadel', year: 2026, week: weekNo },
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      timeout: 15000,
    });
    console.log('Female count:', Array.isArray(femaleRes.data) ? femaleRes.data.length : 'not array');
    console.log('Female sample:', JSON.stringify(femaleRes.data).slice(0, 200));

    // Try without category/circuit filters
    const femaleRes2 = await axios.get(BASE_URL, {
      params: { gender: 'female', offset: 0, year: 2026, week: weekNo },
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      timeout: 15000,
    });
    console.log('Female (no filters) count:', Array.isArray(femaleRes2.data) ? femaleRes2.data.length : 'not array');

  } catch (err: any) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

main();
