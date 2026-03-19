// krogerPrices v2

const BASE = 'https://api.kroger.com/v1';

const KROGER_FAMILY = ['kroger', 'fred_meyer', 'king_soopers', 'city_market', 'smiths', 'harris_teeter', 'jewel_osco'];

const CHAIN_IDS = {
  kroger: '01100',
  fred_meyer: '00200',
  king_soopers: '00400',
  city_market: '00401',
  smiths: '00700',
  harris_teeter: '00600',
  jewel_osco: '00500',
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

async function getLocationId(token, zip, chainId) {
  // Try with chain filter first
  const q = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.limit': '5' });
  if (chainId) q.set('filter.chain', chainId);
  const r = await fetch(`${BASE}/locations?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    console.log('location error', r.status, await r.text());
    return null;
  }
  const d = await r.json();
  if (d.data?.length) return d.data[0].locationId;

  // Fallback: search all chains and pick first Kroger-family store
  const allChainIds = Object.values(CHAIN_IDS);
  const q2 = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.limit': '10' });
  const r2 = await fetch(`${BASE}/locations?${q2}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r2.ok) return null;
  const d2 = await r2.json();
  // Find a store whose chain matches any of our supported chains
  const match = d2.data?.find(loc => allChainIds.includes(loc.chain?.id?.toString()));
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
  if (!r.ok) return { item_name: term, product_name: term, price: null, unit_price: '', in_stock: false };
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
    console.log('RAW BODY:', JSON.stringify(body));
    const { items, store_keys, zip_code } = body;
    console.log('PARSED:', { itemCount: items?.length, store_keys, zip_code });

    if (!items?.length || !store_keys?.length || !zip_code) {
      return Response.json({ error: 'Missing required fields', body }, { status: 400 });
    }

    const targets = store_keys.filter(k => KROGER_FAMILY.includes(k));
    console.log('TARGETS:', targets);
    if (!targets.length) return Response.json({ results: {}, reason: 'no kroger stores in list' });

    const token = await getToken();
    console.log('Token OK length:', token?.length);

    const results = {};
    await Promise.all(targets.map(async (key) => {
      const locationId = await getLocationId(token, zip_code, CHAIN_IDS[key]);
      console.log(`locationId for ${key}:`, locationId);
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