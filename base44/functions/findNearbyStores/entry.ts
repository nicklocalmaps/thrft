import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Map store keys to name patterns to match against OSM data
const STORE_NAME_MAP = [
  { key: 'kroger',          patterns: ['kroger'] },
  { key: 'walmart',         patterns: ['walmart supercenter', 'walmart neighborhood market', 'walmart'] },
  { key: 'amazon',          patterns: ['amazon fresh'] },
  { key: 'aldi',            patterns: ['aldi'] },
  { key: 'trader_joes',     patterns: ["trader joe"] },
  { key: 'whole_foods',     patterns: ['whole foods'] },
  { key: 'target',          patterns: ['target'] },
  { key: 'costco',          patterns: ['costco'] },
  { key: 'publix',          patterns: ['publix'] },
  { key: 'safeway',         patterns: ['safeway'] },
  { key: 'albertsons',      patterns: ['albertsons'] },
  { key: 'heb',             patterns: ['h-e-b', 'heb'] },
  { key: 'meijer',          patterns: ['meijer'] },
  { key: 'hyvee',           patterns: ['hy-vee', 'hyvee'] },
  { key: 'fred_meyer',      patterns: ['fred meyer'] },
  { key: 'fresh_market',    patterns: ['the fresh market'] },
  { key: 'wegmans',         patterns: ['wegmans'] },
  { key: 'harris_teeter',   patterns: ['harris teeter'] },
  { key: 'food_lion',       patterns: ['food lion'] },
  { key: 'giant_eagle',     patterns: ['giant eagle'] },
  { key: 'stop_shop',       patterns: ['stop & shop', 'stop and shop'] },
  { key: 'jewel_osco',      patterns: ['jewel-osco', 'jewel osco'] },
  { key: 'hannaford',       patterns: ['hannaford'] },
  { key: 'market_basket',   patterns: ['market basket'] },
  { key: 'smiths',          patterns: ["smith's food", "smiths food"] },
  { key: 'acme',            patterns: ['acme markets', 'acme market'] },
  { key: 'king_soopers',    patterns: ['king soopers'] },
  { key: 'city_market',     patterns: ['city market'] },
  { key: 'rouses',          patterns: ['rouses'] },
  { key: 'stater_bros',     patterns: ['stater bros'] },
  { key: 'bristol_farms',   patterns: ['bristol farms'] },
  { key: 'gelsons',         patterns: ["gelson's", 'gelsons'] },
  { key: 'frys',            patterns: ["fry's food", "frys food"] },
  { key: 'piggly_wiggly',   patterns: ['piggly wiggly'] },
  { key: 'big_y',           patterns: ['big y'] },
  { key: 'stew_leonards',   patterns: ["stew leonard"] },
  { key: 'foodland',        patterns: ['foodland'] },
  { key: 'kta',             patterns: ['kta super'] },
  { key: 'winn_dixie',      patterns: ['winn-dixie', 'winn dixie'] },
  { key: 'lowes_foods',     patterns: ["lowes foods", "lowe's foods"] },
  { key: 'vons',            patterns: ['vons'] },
  { key: 'pavilions',       patterns: ['pavilions'] },
  { key: 'smart_final',     patterns: ['smart & final', 'smart and final'] },
  { key: 'raleys',          patterns: ["raley's", 'raleys'] },
  { key: 'savemart',        patterns: ['save mart', 'savemart'] },
  { key: 'randalls',        patterns: ['randalls'] },
  { key: 'tom_thumb',       patterns: ['tom thumb'] },
  { key: 'schnucks',        patterns: ['schnucks'] },
  { key: 'dierbergs',       patterns: ['dierbergs'] },
  { key: 'shoprite',        patterns: ['shoprite', 'shop-rite'] },
  { key: 'giant_food',      patterns: ['giant food'] },
  { key: 'giant_martin',    patterns: ["giant martin", "martin's food"] },
  { key: 'shoppers',        patterns: ['shoppers food'] },
  { key: 'hornbachers',     patterns: ["hornbacher"] },
  { key: 'iga',             patterns: [' iga '] },
];

function matchStoreKey(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const { key, patterns } of STORE_NAME_MAP) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return null;
}

// Convert zip code to lat/lng using OSM Nominatim (free, no key)
async function geocodeZip(zip) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'THRFT-GroceryApp/1.0' } });
  const data = await res.json();
  if (!data.length) throw new Error('Could not geocode zip code');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// Query Overpass API for supermarkets within radius (free, no key)
async function queryOverpass(lat, lng, radiusMeters) {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      node["shop"="convenience"](around:${radiusMeters},${lat},${lng});
      node["shop"="wholesale"](around:${radiusMeters},${lat},${lng});
      way["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      way["shop"="wholesale"](around:${radiusMeters},${lat},${lng});
    );
    out tags;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain', 'User-Agent': 'THRFT-GroceryApp/1.0' },
  });
  const data = await res.json();
  return data.elements || [];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { zip_code } = await req.json();
  if (!zip_code || zip_code.length < 5) {
    return Response.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  const { lat, lng } = await geocodeZip(zip_code);
  console.log(`Geocoded ${zip_code} → ${lat}, ${lng}`);

  // 40km ≈ 25 miles
  const elements = await queryOverpass(lat, lng, 40000);
  console.log(`OSM returned ${elements.length} elements`);

  const foundKeys = new Set();
  for (const el of elements) {
    const name = el.tags?.name || el.tags?.brand || '';
    const key = matchStoreKey(name);
    if (key) {
      foundKeys.add(key);
      console.log(`Matched: ${name} → ${key}`);
    }
  }

  const storeKeys = Array.from(foundKeys);
  console.log('Final result:', storeKeys.join(', '));
  return Response.json({ store_keys: storeKeys });
});