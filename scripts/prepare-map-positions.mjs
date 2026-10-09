import {readFile, writeFile} from 'node:fs/promises';
import {mapAddress, matchCoordinates} from '../lib/maps/address.mjs';
try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim();
const secret = process.env.NAVER_MAP_CLIENT_SECRET?.trim();
if (!clientId || !secret) throw Error('Naver map credentials are missing');
const cases = JSON.parse(await readFile('lib/real-cases.json', 'utf8'));
const positions = {};
for (const query of new Set(cases.map(item => mapAddress(item.address)))) {
  const url = new URL('https://maps.apigw.ntruss.com/map-geocode/v2/geocode');
  url.searchParams.set('query', query);
  let response;
  try { response = await fetch(url, {headers: {'x-ncp-apigw-api-key-id': clientId, 'x-ncp-apigw-api-key': secret}, signal: AbortSignal.timeout(10000)}); }
  catch { throw Error('Geocoding network request failed; previous snapshot retained'); }
  if (!response.ok) throw Error(`Geocoding HTTP ${response.status}; previous snapshot retained`);
  const data = await response.json();
  if (data.status !== 'OK' || !Array.isArray(data.addresses)) throw Error('Unexpected geocoding response; previous snapshot retained');
  const position = matchCoordinates(query, data.addresses);
  positions[query] = position ? {...position, verifiedAt: new Date().toISOString()} : null;
  console.log(`${position ? 'VERIFIED' : 'UNRESOLVED'} ${query}`);
}
// Only the browser's public Client ID and verified address coordinates are saved.
// The secret stays in the local Node process; CI builds use this snapshot without keys.
await writeFile('lib/maps/public-config.json', JSON.stringify({clientId, positions}, null, 2) + '\n');
