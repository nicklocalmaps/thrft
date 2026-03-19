import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const KROGER_BASE = 'https://api.kroger.com/v1';
const KROGER_FAMILY = ['kroger', 'fred_meyer', 'king_soopers', 'city_market', 'smiths', 'harris_teeter', 'food_lion', 'jewel_osco'];

// Map store keys to Kroger chain IDs
const CHAIN_MAP = {
  kroger: '01100',
  fred_meyer: '00200',
  king_soopers: '00400',
  city_market: '00401',
  smiths: '00700',
  harris_teeter: '00600',
  jewel_osco: '00500',
  food_lion: null, // Not in Kroger family, skip
};

async function getAccessToken() {
  const clientId = Deno.env.get('KROGER_CLIENT_ID');
  const clientSecret = Deno.env.get('KROGER_CLIENT_SECRET');
  const creds = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact+profile.compact',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kroger auth failed: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function findNearestLocationId(token, zipCode, chainId) {
  // Try with chain filter first, then fall back to any nearby Kroger-family store
  const attempts = chainId
    ? [{ 'filter.chain': chainId }, {}]
    : [{}];

  for (const extra of attempts) {
    const params = new URLSearchParams({
      'filter.zipCode.near': zipCode,
      'filter.limit': '5',
      ...extra,
    });

    const url = `${KROGER_BASE}/locations?${params}`;
    console.log('[kroger] Fetching location URL:', url);

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const text = await res.text();
    console.log('[kroger] Location response status:', res.status, 'body:', text.slice(0, 300));

    if (!res.ok) continue;
    const data = JSON.parse(text);
    if (data.data?.length > 0) {
      return data.data[0].locationId;
    }
  }
  return null;
}

async function searchProduct(token, locationId, itemName) {
  const params = new URLSearchParams({
    'filter.term': itemName,
    'filter.locationId': locationId,
    'filter.limit': '1',
    'filter.fulfillment': 'ais', // available in store
  });

  const res = await fetch(`${KROGER_BASE}/products?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const product = data.data?.[0];
  if (!product) return null;

  const priceInfo = product.items?.[0]?.price;
  const price = priceInfo?.regular ?? priceInfo?.promo ?? null;

  return {
    item_name: itemName,
    product_name: product.description || itemName,
    price: price || null,
    unit_price: product.items?.[0]?.size || '',
    in_stock: price !== null,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse body first (test_backend_function sends payload directly)
    const body = await req.json();
    const { items, store_keys, zip_code } = body;

    console.log('[kroger] Request body:', JSON.stringify({ items: items?.length, store_keys, zip_code }));

    if (!items?.length || !store_keys?.length || !zip_code) {
      return Response.json({ error: 'Missing items, store_keys, or zip_code', got: { items: items?.length, store_keys, zip_code } }, { status: 400 });
    }

    // Only handle Kroger family stores
    const krogerStores = store_keys.filter(k => KROGER_FAMILY.includes(k) && CHAIN_MAP[k] !== undefined && CHAIN_MAP[k] !== null);
    console.log('[kroger] krogerStores to process:', krogerStores);

    if (krogerStores.length === 0) {
      return Response.json({ results: {} });
    }

    const token = await getAccessToken();
    console.log('[kroger] Got token, length:', token?.length);
    const results = {};

    // Process each Kroger-family store in parallel
    await Promise.all(krogerStores.map(async (storeKey) => {
      const chainId = CHAIN_MAP[storeKey];
      console.log(`[kroger] Finding location for ${storeKey}, chainId=${chainId}, zip=${zip_code}`);
      const locationId = await findNearestLocationId(token, zip_code, chainId);
      console.log(`[kroger] locationId for ${storeKey}:`, locationId);

      if (!locationId) {
        results[storeKey] = null; // store not found in area
        return;
      }

      // Fetch prices for all items in parallel
      const itemResults = await Promise.all(
        items.map(item => searchProduct(token, locationId, item.name))
      );

      const validItems = itemResults.filter(Boolean);
      const instoreTotal = validItems.reduce((s, i) => s + (i.price || 0), 0);

      results[storeKey] = {
        items: validItems,
        instore_total: instoreTotal,
        location_id: locationId,
        source: 'kroger_api',
      };
    }));

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});