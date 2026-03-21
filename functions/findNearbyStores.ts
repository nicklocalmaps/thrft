import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

// Map of grocery store brand names to our store keys
const STORE_NAME_MAP = [
  { key: 'kroger',          patterns: ['kroger'] },
  { key: 'walmart',         patterns: ['walmart'] },
  { key: 'amazon',          patterns: ['amazon fresh', 'amazon go'] },
  { key: 'aldi',            patterns: ['aldi'] },
  { key: 'trader_joes',     patterns: ["trader joe"] },
  { key: 'whole_foods',     patterns: ['whole foods'] },
  { key: 'target',          patterns: ['target'] },
  { key: 'costco',          patterns: ['costco'] },
  { key: 'cvs',             patterns: ['cvs pharmacy', 'cvs/pharmacy'] },
  { key: 'walgreens',       patterns: ['walgreens'] },
  { key: 'publix',          patterns: ['publix'] },
  { key: 'safeway',         patterns: ['safeway'] },
  { key: 'albertsons',      patterns: ['albertsons'] },
  { key: 'heb',             patterns: ['h-e-b', 'heb'] },
  { key: 'meijer',          patterns: ['meijer'] },
  { key: 'hyvee',           patterns: ['hy-vee', 'hyvee'] },
  { key: 'fred_meyer',      patterns: ['fred meyer'] },
  { key: 'fresh_market',    patterns: ['fresh market'] },
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
  { key: 'iga',             patterns: [' iga '] },
  { key: 'king_soopers',    patterns: ['king soopers'] },
  { key: 'city_market',     patterns: ['city market'] },
  { key: 'rouses',          patterns: ['rouses'] },
  { key: 'stater_bros',     patterns: ['stater bros'] },
  { key: 'bristol_farms',   patterns: ['bristol farms'] },
  { key: 'gelsons',         patterns: ["gelson's", 'gelsons'] },
  { key: 'frys',            patterns: ["fry's food", "frys food"] },
  { key: 'piggly_wiggly',   patterns: ['piggly wiggly'] },
  { key: 'hornbachers',     patterns: ["hornbacher"] },
  { key: 'big_y',           patterns: ['big y'] },
  { key: 'stew_leonards',   patterns: ["stew leonard"] },
  { key: 'detweilers',      patterns: ["detweiler"] },
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

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ~25 miles in km
const RADIUS_KM = 40;
const RADIUS_M = RADIUS_KM * 1000;

// All chains to explicitly text-search for
const CHAINS_TO_SEARCH = [
  'Walmart Supercenter', 'Kroger', 'H-E-B', 'Publix', 'Safeway', 'Albertsons',
  'Meijer', 'Hy-Vee', 'Wegmans', 'Food Lion', 'Harris Teeter', 'Giant Eagle',
  'Stop & Shop', 'Jewel-Osco', 'Hannaford', 'Market Basket', 'King Soopers',
  'Stater Bros', 'Fred Meyer', 'Piggly Wiggly', 'Rouses Market', 'Amazon Fresh',
  'Target', 'Costco', 'CVS Pharmacy', 'Walgreens', 'ALDI', 'Trader Joe\'s',
  'Whole Foods Market', 'The Fresh Market',
  'Winn-Dixie', "Lowe's Foods", 'Vons', 'Pavilions', 'Smart & Final',
  "Raley's", 'Save Mart', 'Randalls', 'Tom Thumb', 'Schnucks',
  'ShopRite', 'Giant Food', "Martin's Food", 'Shoppers Food',
];

async function searchGroceryStores(lat, lng) {
  // 1. General nearby grocery search
  const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${RADIUS_M}&type=grocery_or_supermarket&key=${GOOGLE_API_KEY}`;
  const nearbyRes = await fetch(nearbyUrl);
  const nearbyData = await nearbyRes.json();
  const nearbyResults = nearbyData.results || [];

  // 2. Targeted text searches for all known chains
  const textSearches = CHAINS_TO_SEARCH.map(chain => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(chain)}&location=${lat},${lng}&radius=${RADIUS_M}&key=${GOOGLE_API_KEY}`;
    return fetch(url).then(r => r.json()).then(d => d.results || []).catch(() => []);
  });

  const chainResults = await Promise.all(textSearches);
  return [...nearbyResults, ...chainResults.flat()];
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
  const places = await searchGroceryStores(lat, lng);

  const foundKeys = new Set();
  for (const place of places) {
    const key = matchStoreKey(place.name);
    if (!key) continue;

    // Strictly enforce distance — Google text search treats radius as a BIAS, not a hard limit
    const plat = place.geometry?.location?.lat;
    const plng = place.geometry?.location?.lng;

    if (plat == null || plng == null) {
      console.log(`SKIP no-coords: ${place.name}`);
      continue;
    }

    const distKm = haversineKm(lat, lng, plat, plng);
    if (distKm > RADIUS_KM) {
      console.log(`SKIP too-far (${distKm.toFixed(1)}km): ${place.name}`);
      continue;
    }

    console.log(`FOUND (${distKm.toFixed(1)}km): ${place.name} → ${key}`);
    foundKeys.add(key);
  }

  const storeKeys = Array.from(foundKeys);
  console.log('Result:', storeKeys.join(', '));
  return Response.json({ store_keys: storeKeys });
});