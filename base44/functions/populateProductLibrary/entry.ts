/**
 * populateProductLibrary
 * AI-powered function that builds and grows the THRFT Food Library.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KROGER_BASE = 'https://api.kroger.com/v1';

async function getKrogerToken() {
  const id     = Deno.env.get('KROGER_CLIENT_ID');
  const secret = Deno.env.get('KROGER_CLIENT_SECRET');
  if (!id || !secret) return null;
  const r = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method:  'POST',
    headers: { 'Authorization': `Basic ${btoa(`${id}:${secret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    'grant_type=client_credentials&scope=product.compact',
  });
  if (!r.ok) return null;
  return (await r.json()).access_token;
}

async function getKrogerLocationId(token, zip) {
  const q = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.limit': '1' });
  const r = await fetch(`${KROGER_BASE}/locations?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const d = await r.json();
  return d.data?.[0]?.locationId ?? null;
}

function titleCase(str = '') {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getKrogerImage(p) {
  if (!p.images?.length) return null;
  const front = p.images.find(i => i.perspective === 'front') || p.images[0];
  const pref  = front?.sizes?.find(s => s.size === 'medium') || front?.sizes?.[0];
  return pref?.url ?? null;
}

async function krogerSearch(token, locationId, term, limit = 50) {
  try {
    const q = new URLSearchParams({ 'filter.term': term, 'filter.locationId': locationId, 'filter.limit': String(limit), 'filter.fulfillment': 'ais' });
    const r = await fetch(`${KROGER_BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map(p => {
      const item = p.items?.[0];
      return {
        kroger_id:  p.productId,
        name:       titleCase(p.description || ''),
        brand:      titleCase(p.brand || ''),
        size:       item?.size || '',
        price:      item?.price?.promo ?? item?.price?.regular ?? null,
        image_url:  getKrogerImage(p),
        upc:        p.upc,
      };
    }).filter(p => p.name);
  } catch { return []; }
}

const AISLE_PRODUCT_SEEDS = {
  beverages: [
    'Coca-Cola Classic 12pk cans', 'Coca-Cola Zero Sugar', 'Diet Coke', 'Coca-Cola Cherry',
    'Pepsi Cola 12pk', 'Pepsi Zero Sugar', 'Diet Pepsi', 'Pepsi Wild Cherry',
    'Sprite 12pk', 'Sprite Zero', '7UP', '7UP Zero Sugar',
    'Mountain Dew 12pk', 'Mountain Dew Zero', 'Mountain Dew Code Red',
    'Dr Pepper 12pk', 'Dr Pepper Zero', 'Dr Pepper Cherry',
    'Fanta Orange', 'Fanta Strawberry', 'Mello Yello', 'Barqs Root Beer',
    'A&W Root Beer', 'Canada Dry Ginger Ale', 'Schweppes Ginger Ale',
    'Dasani Water 24pk', 'Aquafina Water 24pk', 'Poland Spring Water',
    'Smartwater', 'LaCroix Sparkling Water', 'Bubly Sparkling Water', 'Perrier Sparkling Water',
    'Tropicana Orange Juice', 'Simply Orange Juice', 'Minute Maid OJ',
    'Tropicana Apple Juice', 'Motts Apple Juice', 'Welchs Grape Juice',
    'Ocean Spray Cranberry Juice', 'V8 Vegetable Juice', 'Naked Juice',
    'Capri Sun Variety Pack', 'Juicy Juice', 'Hawaiian Punch',
    'Gatorade Thirst Quencher', 'Powerade Mountain Berry Blast',
    'Red Bull Energy Drink', 'Monster Energy Original', 'Celsius Energy Drink',
    'Prime Hydration', 'Body Armor Sports Drink',
    'Folgers Classic Roast Coffee', 'Maxwell House Coffee',
    'Starbucks Cold Brew', 'Starbucks Frappuccino',
    'Lipton Iced Tea', 'Snapple Peach Tea', 'Pure Leaf Tea',
    'AriZona Green Tea', 'Gold Peak Tea',
    'Silk Almond Milk', 'Oatly Oat Milk', 'Califia Oat Milk',
  ],
  meat: [
    'Tyson Boneless Chicken Breast', 'Perdue Chicken Breast',
    'Tyson Chicken Thighs', 'Tyson Chicken Wings', 'Tyson Frozen Chicken Nuggets',
    'Ground Beef 80/20', 'Ground Beef 90/10', 'Ground Turkey',
    'Ribeye Steak', 'New York Strip', 'Sirloin Steak', 'Chuck Roast',
    'Beef Short Ribs', 'Beef Stew Meat',
    'Oscar Mayer Classic Beef Franks', 'Ball Park Beef Franks',
    'Nathan Famous Hot Dogs', 'Hebrew National Hot Dogs',
    'Johnsonville Brats', 'Johnsonville Italian Sausage',
    'Jimmy Dean Breakfast Sausage', 'Bob Evans Sausage',
    'Oscar Mayer Bacon', 'Smithfield Bacon', 'Hormel Black Label Bacon', 'Wright Brand Bacon',
    'Pork Chops Bone-In', 'Pork Tenderloin', 'Pork Ribs Baby Back',
    'Oscar Mayer Turkey Breast', 'Hillshire Farm Oven Roasted Turkey',
    'Oscar Mayer Ham', 'Boars Head Turkey', 'Boars Head Ham',
    'Land O Frost Lunch Meat', 'Applegate Naturals Turkey',
    'Oscar Mayer Pepperoni', 'Hormel Pepperoni',
    'Bubba Burger Original', 'Beyond Burger Plant Based', 'Impossible Burger',
  ],
  snacks: [
    "Lays Classic Potato Chips", "Lays Sour Cream Onion", "Lays BBQ",
    "Ruffles Original", "Ruffles Cheddar Sour Cream",
    'Doritos Nacho Cheese', 'Doritos Cool Ranch', 'Doritos Spicy Nacho',
    'Cheetos Crunchy', 'Cheetos Puffs', 'Cheetos Flamin Hot',
    'Fritos Original', 'Tostitos Tortilla Chips', 'Tostitos Hint of Lime',
    'Pringles Original', 'Pringles Sour Cream', 'Pringles BBQ',
    'Cape Cod Potato Chips', 'Kettle Brand Chips',
    'Ritz Original Crackers', 'Wheat Thins Original', 'Triscuit Original',
    'Goldfish Cheddar', 'Cheez-It Original', 'Cheez-It White Cheddar',
    'Club Crackers', 'Premium Saltine Crackers', 'Graham Crackers',
    'Orville Redenbacher Microwave Popcorn', 'Act II Butter Popcorn',
    'SkinnyPop Original Popcorn', 'Smartfood White Cheddar Popcorn',
    "Snyders Pretzels", "Rold Gold Pretzels",
    'Planters Mixed Nuts', 'Planters Peanuts', 'Blue Diamond Almonds',
    'Nature Valley Granola Bars', 'Kind Bars', 'Clif Bars', 'RXBar',
    'Tostitos Salsa', 'Pace Picante Sauce', 'Sabra Hummus',
  ],
  frozen: [
    'DiGiorno Original Rising Crust Pizza', 'Red Baron Classic Pizza',
    'Tombstone Original Pizza', 'Totinos Party Pizza', 'California Pizza Kitchen',
    "Stouffers Lasagna", "Stouffers Mac Cheese",
    'Marie Callenders Chicken Pot Pie', 'Healthy Choice Power Bowls',
    'Lean Cuisine Favorites', 'Banquet Frozen Dinner',
    'Jimmy Dean Breakfast Sandwiches', 'Eggo Homestyle Waffles',
    'Pillsbury Pancakes', 'Bob Evans Frozen Meals',
    'Birds Eye Steamfresh Vegetables', 'Green Giant Vegetables',
    'Alexia Sweet Potato Fries', 'Ore-Ida Golden Fries', 'Ore-Ida Tater Tots',
    "Ben Jerrys Ice Cream", 'Haagen-Dazs Ice Cream',
    'Breyers Ice Cream', 'Dreyers Grand Ice Cream',
    'Klondike Bar', 'Drumstick Ice Cream Cone',
    'Gordons Fish Sticks', 'SeaPak Shrimp',
    'Hot Pockets', 'Lean Pockets',
  ],
  breakfast: [
    'Cheerios Original', 'Honey Nut Cheerios', 'Multi Grain Cheerios',
    'Frosted Flakes', 'Corn Flakes', 'Special K Original',
    'Raisin Bran', 'Raisin Bran Crunch', 'Cocoa Puffs',
    'Lucky Charms', 'Cinnamon Toast Crunch', 'Trix',
    'Froot Loops', 'Apple Jacks', 'Cap N Crunch',
    'Life Cereal', 'Grape Nuts', 'Kashi GoLean', 'Fiber One',
    'Granola Nature Valley', 'Quaker Oatmeal Squares',
    'Quaker Old Fashioned Oats', 'Quaker Instant Oatmeal',
    'Bob Red Mill Rolled Oats', 'McCann Steel Cut Oats',
    'Bisquick Original', 'Aunt Jemima Pancake Mix', 'Krusteaz Pancake Mix',
    'Log Cabin Maple Syrup', 'Mrs Butterworth Syrup',
    'Eggo Homestyle Waffles', 'Eggo Buttermilk Waffles', 'Pillsbury Frozen Pancakes',
    'Pop Tarts Strawberry', 'Pop Tarts Brown Sugar', 'Pop Tarts Blueberry',
    'Jimmy Dean Original Sausage', 'Jimmy Dean Turkey Sausage',
    'Nutri Grain Strawberry Bars', 'Nutri Grain Blueberry', 'Fiber One Brownies',
  ],
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { mode, aisle_key, product, zip_code, search_term } = body;

  // ── Mode: save a single product ───────────────────────────────────────────
  if (mode === 'save_product') {
    if (!product?.name) return Response.json({ error: 'product.name required' }, { status: 400 });
    try {
      const existing = await base44.entities.ProductLibrary.filter({ name: product.name }).catch(() => []);
      if (existing.length === 0) {
        await base44.entities.ProductLibrary.create({
          name:        product.name,
          brand:       product.brand || '',
          aisle_key:   product.aisle_key || aisle_key || 'other',
          size:        product.size || '',
          image_url:   product.image_url || product.imageUrl || '',
          price:       product.price || null,
          kroger_id:   product.kroger_id || '',
          upc:         product.upc || '',
          added_by:    'user',
          times_added: 1,
          created_at:  new Date().toISOString(),
        });
      } else {
        await base44.entities.ProductLibrary.update(existing[0].id, {
          times_added: (existing[0].times_added || 1) + 1,
        });
      }
      return Response.json({ success: true, action: existing.length === 0 ? 'created' : 'updated' });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // ── Mode: search library then fall back to Kroger ─────────────────────────
  if (mode === 'search') {
    if (!search_term) return Response.json({ error: 'search_term required' }, { status: 400 });
    try {
      const libraryResults = await base44.entities.ProductLibrary.filter({
        name__icontains: search_term,
      }).catch(() => []);

      if (libraryResults.length >= 10) {
        return Response.json({ products: libraryResults, source: 'library' });
      }

      const token  = await getKrogerToken();
      const locId  = token ? await getKrogerLocationId(token, zip_code || '10001') : null;
      const kroger = token && locId ? await krogerSearch(token, locId, search_term, 20) : [];

      return Response.json({ products: [...libraryResults, ...kroger].slice(0, 30), source: 'mixed' });
    } catch (err) {
      return Response.json({ error: err.message, products: [] }, { status: 500 });
    }
  }

  // ── Mode: populate an entire aisle ────────────────────────────────────────
  if (mode === 'populate_aisle') {
    if (!aisle_key) return Response.json({ error: 'aisle_key required' }, { status: 400 });

    const seeds = AISLE_PRODUCT_SEEDS[aisle_key] || [];
    if (seeds.length === 0) {
      return Response.json({ message: `No seeds defined for ${aisle_key}`, count: 0 });
    }

    const token  = await getKrogerToken();
    const locId  = token ? await getKrogerLocationId(token, zip_code || '10001') : null;

    let saved = 0;
    const errors = [];

    for (let i = 0; i < seeds.length; i += 5) {
      const batch = seeds.slice(i, i + 5);
      await Promise.all(batch.map(async seedName => {
        try {
          const existing = await base44.entities.ProductLibrary.filter({ name: seedName }).catch(() => []);
          if (existing.length > 0) return;

          let enriched = null;
          if (token && locId) {
            const krogerResults = await krogerSearch(token, locId, seedName, 3);
            if (krogerResults.length > 0) enriched = krogerResults[0];
          }

          await base44.entities.ProductLibrary.create({
            name:        enriched?.name || seedName,
            brand:       enriched?.brand || '',
            aisle_key,
            size:        enriched?.size || '',
            image_url:   enriched?.image_url || '',
            price:       enriched?.price || null,
            kroger_id:   enriched?.kroger_id || '',
            upc:         enriched?.upc || '',
            added_by:    'system',
            times_added: 0,
            created_at:  new Date().toISOString(),
          });
          saved++;
        } catch (err) {
          errors.push(`${seedName}: ${err.message}`);
        }
      }));
    }

    return Response.json({
      aisle_key,
      seeds_processed: seeds.length,
      saved,
      errors: errors.slice(0, 5),
      message: `Populated ${saved} products for ${aisle_key}`,
    });
  }

  // ── Mode: get aisle from library ──────────────────────────────────────────
  if (mode === 'get_aisle') {
    if (!aisle_key) return Response.json({ error: 'aisle_key required' }, { status: 400 });
    try {
      const products = await base44.entities.ProductLibrary.filter({ aisle_key }).catch(() => []);
      return Response.json({ products, count: products.length, source: 'library' });
    } catch (err) {
      return Response.json({ error: err.message, products: [] }, { status: 500 });
    }
  }

  return Response.json({ error: 'mode must be save_product, search, populate_aisle, or get_aisle' }, { status: 400 });
});