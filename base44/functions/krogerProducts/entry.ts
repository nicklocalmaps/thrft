/**
 * krogerProducts — v2
 * Fetches Kroger products and organizes them into a brand hierarchy.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE = 'https://api.kroger.com/v1';

async function getToken() {
  const id     = Deno.env.get('KROGER_CLIENT_ID');
  const secret = Deno.env.get('KROGER_CLIENT_SECRET');
  if (!id || !secret) throw new Error('Missing Kroger credentials');
  const creds = btoa(`${id}:${secret}`);
  const r = await fetch(`${BASE}/connect/oauth2/token`, {
    method:  'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    'grant_type=client_credentials&scope=product.compact',
  });
  if (!r.ok) throw new Error(`Kroger auth failed: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function getLocationId(token, zip) {
  const q = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.chain': 'KROGER', 'filter.limit': '5' });
  const r = await fetch(`${BASE}/locations?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const d = await r.json();
  const loc = d.data?.find(l => l.chain?.toUpperCase().includes('KROGER')) || d.data?.[0];
  return loc?.locationId ?? null;
}

function titleCase(str = '') {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getImage(p) {
  if (!p.images?.length) return null;
  const front = p.images.find(i => i.perspective === 'front') || p.images[0];
  if (!front?.sizes?.length) return null;
  const preferred = front.sizes.find(s => s.size === 'medium')
    || front.sizes.find(s => s.size === 'large')
    || front.sizes.find(s => s.size === 'small')
    || front.sizes[0];
  return preferred?.url ?? null;
}

function mapProduct(p) {
  const item  = p.items?.[0];
  const price = item?.price?.promo ?? item?.price?.regular ?? null;
  return {
    id:       p.productId || p.upc || '',
    name:     titleCase(p.description || ''),
    brand:    titleCase(p.brand || ''),
    size:     item?.size || '',
    price,
    imageUrl: getImage(p),
    inStock:  price !== null,
  };
}

async function fetchProducts(token, locationId, term, limit = 50) {
  const q = new URLSearchParams({
    'filter.term':       term,
    'filter.locationId': locationId,
    'filter.limit':      String(Math.min(limit, 50)),
    'filter.fulfillment':'ais',
  });
  const r = await fetch(`${BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) { console.error('Kroger fetch error', r.status); return []; }
  const d = await r.json();
  return (d.data || []).map(mapProduct).filter(p => p.name && p.name.length > 1);
}

const AISLE_TERMS = {
  produce:        ['fresh produce vegetables', 'fresh fruit bananas apples', 'salad greens lettuce'],
  meat:           ['chicken breast thighs', 'ground beef steak', 'pork chops bacon'],
  seafood:        ['fresh fish salmon tilapia', 'shrimp crab seafood'],
  eggs_dairy:     ['milk eggs butter', 'cream cheese dairy'],
  cheese:         ['cheddar mozzarella cheese', 'sliced cheese parmesan'],
  frozen:         ['frozen meals entrees', 'frozen pizza', 'frozen vegetables', 'frozen breakfast'],
  bread:          ['bread loaf sandwich', 'bagels muffins rolls', 'tortillas wraps'],
  beverages:      ['soda cola pepsi coke', 'juice water sports drinks', 'coffee tea energy drinks'],
  snacks:         ['chips doritos lays', 'crackers cookies snacks', 'popcorn pretzels nuts'],
  breakfast:      ['cereal oatmeal granola', 'pancake syrup waffles', 'breakfast sausage eggs'],
  cereal:         ['cereal cheerios frosted flakes', 'granola oatmeal'],
  canned:         ['canned soup tomatoes beans', 'canned tuna chicken broth', 'pasta sauce'],
  cookies:        ['oreos chips ahoy cookies', 'graham crackers biscuits'],
  candy:          ['chocolate candy reeses', 'gummy bears skittles'],
  deli:           ['deli lunch meat ham turkey', 'deli cheese'],
  yogurt:         ['greek yogurt chobani', 'yogurt cups parfait'],
  personal_care:  ['shampoo conditioner hair', 'body wash soap deodorant'],
  cleaning:       ['laundry detergent tide', 'dish soap cleaning spray'],
  health:         ['vitamins supplements', 'pain relief medicine cold flu'],
  baby:           ['baby food gerber', 'diapers wipes baby formula'],
  pet:            ['dog food purina', 'cat food treats pet'],
  alcohol:        ['beer lager ale', 'wine red white'],
  packaged_meals: ['mac cheese pasta rice', 'ramen noodles instant meals'],
  condiments:     ['ketchup mustard mayo', 'salad dressing hot sauce'],
  international:  ['international foods mexican asian', 'salsa soy sauce'],
};

async function browseAisle(token, locationId, categoryKey, limit = 50) {
  const terms = AISLE_TERMS[categoryKey] || [categoryKey];
  const results = await Promise.all(
    terms.map(term => fetchProducts(token, locationId, term, Math.ceil(limit / terms.length) + 5))
  );
  const seen = new Set();
  const all  = [];
  for (const batch of results) {
    for (const p of batch) {
      if (!seen.has(p.id || p.name)) {
        seen.add(p.id || p.name);
        all.push(p);
      }
    }
  }
  return all.slice(0, limit);
}

function buildBrandHierarchy(products) {
  const brandMap = {};
  for (const p of products) {
    const brand = p.brand || 'Other';
    if (!brandMap[brand]) brandMap[brand] = [];
    brandMap[brand].push(p);
  }

  const brands = Object.entries(brandMap).map(([brand, prods]) => {
    const familyMap = {};
    for (const p of prods) {
      const baseName = p.name
        .replace(/\s+\d+[\s.]?\d*\s*(oz|fl oz|lb|lbs|ct|pk|pack|count|g|ml|l|gal|gallon|liters?)\s*$/i, '')
        .replace(/\s+(family size|large|mega|king size|mini|snack size|value pack)\s*$/i, '')
        .trim();

      if (!familyMap[baseName]) {
        familyMap[baseName] = { name: baseName, brand, imageUrl: null, price: null, variants: [] };
      }

      const fam = familyMap[baseName];
      if (p.imageUrl && !fam.imageUrl) fam.imageUrl = p.imageUrl;
      if (p.price !== null && (fam.price === null || p.price < fam.price)) fam.price = p.price;
      fam.variants.push({ id: p.id, name: p.name, size: p.size, price: p.price, imageUrl: p.imageUrl, inStock: p.inStock });
    }

    const families = Object.values(familyMap).map(fam => ({
      ...fam,
      variants: fam.variants.sort((a, b) => (a.price ?? 999) - (b.price ?? 999)),
    }));
    families.sort((a, b) => a.name.localeCompare(b.name));

    return { brand, imageUrl: prods.find(p => p.imageUrl)?.imageUrl || null, productCount: prods.length, products: families };
  });

  brands.sort((a, b) => {
    if (a.productCount > 2 && b.productCount <= 2) return -1;
    if (b.productCount > 2 && a.productCount <= 2) return 1;
    return a.brand.localeCompare(b.brand);
  });

  return brands;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { mode, term, category, zip_code, limit } = body;

  if (!zip_code) return Response.json({ error: 'zip_code required' }, { status: 400 });
  if (!mode || !['search', 'browse'].includes(mode)) {
    return Response.json({ error: 'mode must be search or browse' }, { status: 400 });
  }

  try {
    const token      = await getToken();
    const locationId = await getLocationId(token, zip_code);

    if (!locationId) {
      return Response.json({ products: [], brands: [], warning: `No Kroger near ${zip_code}` });
    }

    let products;
    if (mode === 'search') {
      if (!term) return Response.json({ error: 'term required for search' }, { status: 400 });
      products = await fetchProducts(token, locationId, term, limit || 30);
    } else {
      if (!category) return Response.json({ error: 'category required for browse' }, { status: 400 });
      products = await browseAisle(token, locationId, category, limit || 50);
    }

    const brands = mode === 'browse' ? buildBrandHierarchy(products) : [];

    return Response.json({ products, brands, locationId, zip_code, count: products.length, brandCount: brands.length });

  } catch (err) {
    console.error('krogerProducts error:', err);
    return Response.json({ error: 'Failed', message: err.message, products: [], brands: [] }, { status: 500 });
  }
});