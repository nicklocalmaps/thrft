// krogerPrices v4 - chain names fixed
const BASE = 'https://api.kroger.com/v1';

const KROGER_FAMILY = ['kroger', 'fred_meyer', 'king_soopers', 'city_market', 'smiths', 'harris_teeter', 'jewel_osco'];

// Map our store keys to the chain name strings returned by the Kroger API
const CHAIN_NAMES = {
  kroger: 'KROGER',
  fred_meyer: 'FRED MEYER',
  king_soopers: 'KING SOOPERS',
  city_market: 'CITY MARKET',
  smiths: "SMITH'S",
  harris_teeter: 'HARRIS TEETER',
  jewel_osco: 'JEWEL-OSCO',
};

async function getToken() {
  const id = Deno.env.get('KROGER_CLIENT_ID');
  const secret = Deno.env.get('KROGER_CLIENT_SECRET');
  const creds = btoa(`${id}:${secret}`);
  const r = await fetch(`${BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!r.ok) throw new Error(`Auth failed: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function getLocationId(token, zip, storeKey) {
  // Fetch nearby stores and filter by chain name
  const chainName = CHAIN_NAMES[storeKey];
  const q = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.limit': '20' });
  const r = await fetch(`${BASE}/locations?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    console.log('location error', r.status, await r.text());
    return null;
  }
  const d = await r.json();
  const match = d.data?.find(loc => loc.chain?.toUpperCase() === chainName);
  console.log(`Looking for "${chainName}" near ${zip}: found ${match?.locationId ?? 'none'}`);
  return match?.locationId ?? null;
}

async function getPrice(token, locationId, term) {
  const q = new URLSearchParams({
    'filter.term': term,
    'filter.locationId': locationId,
    'filter.limit': '1',
    'filter.fulfillment': 'ais',
  });
  const r = await fetch(`${BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    console.log('Product error for', term, r.status);
    return { item_name: term, product_name: term, price: null, unit_price: '', in_stock: false };
  }
  const d = await r.json();
  const p = d.data?.[0];
  if (!p) return { item_name: term, product_name: term, price: null, unit_price: '', in_stock: false };
  const priceInfo = p.items?.[0]?.price;
  const price = priceInfo?.regular ?? priceInfo?.promo ?? null;
  return { item_name: term, product_name: p.description || term, price, unit_price: p.items?.[0]?.size || '', in_stock: price != null };
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { items, store_keys, zip_code } = body;

    if (!items?.length || !store_keys?.length || !zip_code) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const targets = store_keys.filter(k => KROGER_FAMILY.includes(k));
    if (!targets.length) return Response.json({ results: {}, reason: 'no kroger stores in list' });

    const token = await getToken();

    const results = {};
    await Promise.all(targets.map(async (key) => {
      const locationId = await getLocationId(token, zip_code, key);
      if (!locationId) { results[key] = null; return; }

      const priceItems = await Promise.all(items.map(i => getPrice(token, locationId, i.name)));
      const instore_total = priceItems.reduce((s, i) => s + (i.price || 0), 0);
      results[key] = { items: priceItems, instore_total, source: 'kroger_api' };
    }));

    return Response.json({ results });
  } catch (e) {
    console.error('krogerPrices error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
});