/**
 * krogerProducts
 * Search and browse Kroger products with real photos, names, sizes and prices.
 *
 * Request body:
 *   { mode: 'search', term: 'pepsi', zip_code: '45202', limit?: 20 }
 *   { mode: 'browse', category: 'Beverages', zip_code: '45202', limit?: 30 }
 *
 * Response:
 *   { products: [ { id, name, brand, description, size, price, imageUrl, inStock } ] }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE = 'https://api.kroger.com/v1';

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getToken() {
  const id     = Deno.env.get('KROGER_CLIENT_ID');
  const secret = Deno.env.get('KROGER_CLIENT_SECRET');
  if (!id || !secret) throw new Error('Missing Kroger credentials');

  const creds = btoa(`${id}:${secret}`);
  const r = await fetch(`${BASE}/connect/oauth2/token`, {
    method:  'POST',
    headers: {
      'Authorization':  `Basic ${creds}`,
      'Content-Type':   'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!r.ok) throw new Error(`Kroger auth failed: ${await r.text()}`);
  return (await r.json()).access_token;
}

// ─── Location ─────────────────────────────────────────────────────────────────

async function getNearestKrogerLocationId(token, zip) {
  const q = new URLSearchParams({
    'filter.zipCode.near': zip,
    'filter.chain':        'KROGER',
    'filter.limit':        '5',
  });
  const r = await fetch(`${BASE}/locations?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const d = await r.json();
  const kroger = d.data?.find(loc =>
    loc.chain?.toUpperCase().includes('KROGER')
  ) || d.data?.[0];
  return kroger?.locationId ?? null;
}

// ─── Product mapper ───────────────────────────────────────────────────────────

function mapProduct(p) {
  const item       = p.items?.[0];
  const priceInfo  = item?.price;
  const price      = priceInfo?.promo ?? priceInfo?.regular ?? null;
  const size       = item?.size ?? '';

  let imageUrl = null;
  if (p.images?.length) {
    const front = p.images.find(img => img.perspective === 'front') || p.images[0];
    if (front?.sizes?.length) {
      const preferred = front.sizes.find(s => s.size === 'medium')
        || front.sizes.find(s => s.size === 'large')
        || front.sizes.find(s => s.size === 'small')
        || front.sizes[0];
      imageUrl = preferred?.url ?? null;
    }
  }

  const name = p.description
    ? p.description.split(' ').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ')
    : '';

  const brand = p.brand
    ? p.brand.split(' ').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ')
    : '';

  return {
    id:          p.productId || p.upc || '',
    name,
    brand,
    description: name,
    size,
    price,
    imageUrl,
    inStock:     price !== null,
    categories:  p.categories || [],
  };
}

// ─── Search products ──────────────────────────────────────────────────────────

async function searchProducts(token, locationId, term, limit = 20) {
  const q = new URLSearchParams({
    'filter.term':        term,
    'filter.locationId':  locationId,
    'filter.limit':       String(Math.min(limit, 50)),
    'filter.fulfillment': 'ais',
  });

  const r = await fetch(`${BASE}/products?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) {
    console.error('Kroger search error:', r.status, await r.text());
    return [];
  }
  const d = await r.json();
  return (d.data || []).map(mapProduct).filter(p => p.name);
}

// ─── Browse by category ───────────────────────────────────────────────────────

const AISLE_TERMS = {
  produce:        'fresh produce',
  meat:           'fresh meat chicken beef',
  seafood:        'fresh seafood fish',
  eggs_dairy:     'milk eggs dairy',
  cheese:         'cheese',
  frozen:         'frozen meals',
  bread:          'bread bakery',
  beverages:      'soda water juice drinks',
  snacks:         'chips snacks crackers',
  breakfast:      'breakfast cereal pancakes',
  cereal:         'cereal',
  canned:         'canned goods soup',
  cookies:        'cookies',
  candy:          'candy chocolate',
  deli:           'deli lunch meat',
  yogurt:         'yogurt',
  personal_care:  'shampoo soap body wash',
  cleaning:       'cleaning supplies detergent',
  health:         'vitamins medicine',
  baby:           'baby food diapers',
  pet:            'dog food cat food',
  alcohol:        'beer wine',
  packaged_meals: 'pasta rice mac cheese',
  condiments:     'ketchup mustard sauce',
  international:  'international foods',
};

async function browseCategory(token, locationId, categoryKey, limit = 30) {
  const term = AISLE_TERMS[categoryKey] || categoryKey;
  return searchProducts(token, locationId, term, limit);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me().catch(() => null);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { mode, term, category, zip_code, limit } = body;

  if (!zip_code) {
    return Response.json({ error: 'zip_code is required' }, { status: 400 });
  }

  if (!mode || !['search', 'browse'].includes(mode)) {
    return Response.json({ error: 'mode must be "search" or "browse"' }, { status: 400 });
  }

  if (mode === 'search' && !term) {
    return Response.json({ error: 'term is required for search mode' }, { status: 400 });
  }

  if (mode === 'browse' && !category) {
    return Response.json({ error: 'category is required for browse mode' }, { status: 400 });
  }

  try {
    const token = await getToken();
    const locationId = await getNearestKrogerLocationId(token, zip_code);

    if (!locationId) {
      return Response.json({
        products: [],
        warning: `No Kroger location found near ${zip_code}`,
      });
    }

    const products = mode === 'search'
      ? await searchProducts(token, locationId, term, limit || 20)
      : await browseCategory(token, locationId, category, limit || 30);

    const clean = products.filter(p =>
      p.name &&
      p.name.length > 1 &&
      !p.name.match(/^\d+$/)
    );

    return Response.json({
      products: clean,
      locationId,
      zip_code,
      count: clean.length,
    });

  } catch (err) {
    console.error('krogerProducts error:', err);
    return Response.json({
      error:    'Failed to fetch Kroger products',
      message:  err.message,
      products: [],
    }, { status: 500 });
  }
});