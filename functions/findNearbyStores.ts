import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

// Map of grocery store brand names to our store keys
const STORE_NAME_MAP = [
  { key: 'kroger',        patterns: ['kroger'] },
  { key: 'walmart',       patterns: ['walmart'] },
  { key: 'amazon',        patterns: ['amazon fresh', 'amazon go'] },
  { key: 'aldi',          patterns: ['aldi'] },
  { key: 'trader_joes',   patterns: ["trader joe"] },
  { key: 'whole_foods',   patterns: ['whole foods'] },
  { key: 'publix',        patterns: ['publix'] },
  { key: 'safeway',       patterns: ['safeway'] },
  { key: 'albertsons',    patterns: ['albertsons'] },
  { key: 'heb',           patterns: ['h-e-b', 'heb'] },
  { key: 'meijer',        patterns: ['meijer'] },
  { key: 'hyvee',         patterns: ['hy-vee', 'hyvee'] },
  { key: 'fred_meyer',    patterns: ['fred meyer'] },
  { key: 'fresh_market',  patterns: ['fresh market'] },
  { key: 'wegmans',       patterns: ['wegmans'] },
  { key: 'harris_teeter', patterns: ['harris teeter'] },
  { key: 'food_lion',     patterns: ['food lion'] },
  { key: 'giant_eagle',   patterns: ['giant eagle'] },
  { key: 'stop_shop',     patterns: ['stop & shop', 'stop and shop'] },
  { key: 'jewel_osco',    patterns: ['jewel-osco', 'jewel osco'] },
  { key: 'hannaford',     patterns: ['hannaford'] },
  { key: 'market_basket', patterns: ['market basket'] },
  { key: 'smiths',        patterns: ["smith's food", "smiths food"] },
  { key: 'acme',          patterns: ['acme markets', 'acme market'] },
  { key: 'iga',           patterns: [' iga '] },
  { key: 'king_soopers',  patterns: ['king soopers'] },
  { key: 'city_market',   patterns: ['city market'] },
  { key: 'rouses',        patterns: ['rouses'] },
  { key: 'stater_bros',   patterns: ['stater bros'] },
  { key: 'bristol_farms', patterns: ['bristol farms'] },
  { key: 'gelsons',       patterns: ["gelson's", 'gelsons'] },
  { key: 'frys',          patterns: ["fry's food", "frys food"] },
  { key: 'piggly_wiggly', patterns: ['piggly wiggly'] },
  { key: 'hornbachers',   patterns: ["hornbacher"] },
  { key: 'big_y',         patterns: ['big y'] },
  { key: 'stew_leonards', patterns: ["stew leonard"] },
  { key: 'detweilers',    patterns: ["detweiler"] },
  { key: 'foodland',      patterns: ['foodland'] },
  { key: 'kta',           patterns: ['kta super'] },
];

function matchStoreKey(name) {
  const lower = name.toLowerCase();
  for (const { key, patterns } of STORE_NAME_MAP) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return null;
}

async function geocodeZip(zip) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results.length) throw new Error('Could not geocode zip code');
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

async function searchGroceryStores(lat, lng) {
  // Use Places Text Search for grocery stores within 25 miles (~40km)
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=40000&type=grocery_or_supermarket&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { zip_code } = await req.json();
  if (!zip_code || zip_code.length < 5) {
    return Response.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  // Geocode the zip code
  const { lat, lng } = await geocodeZip(zip_code);

  // Search for grocery stores nearby
  const places = await searchGroceryStores(lat, lng);

  // Match place names to our known store keys (deduplicated)
  const foundKeys = new Set();
  for (const place of places) {
    const key = matchStoreKey(place.name);
    if (key) foundKeys.add(key);
  }

  return Response.json({ store_keys: Array.from(foundKeys) });
});