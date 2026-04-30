/**
 * krogerProducts — v3
 * Fetches products from Kroger API (+ Walmart as fallback).
 * Results merged, deduped, organized into brand hierarchy.
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
  const d   = await r.json();
  const loc = d.data?.find(l => l.chain?.toUpperCase().includes('KROGER')) || d.data?.[0];
  return loc?.locationId ?? null;
}

function titleCase(str = '') {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getKrogerImage(p) {
  if (!p.images?.length) return null;
  const front = p.images.find(i => i.perspective === 'front') || p.images[0];
  if (!front?.sizes?.length) return null;
  const pref = front.sizes.find(s => s.size === 'medium') || front.sizes.find(s => s.size === 'large') || front.sizes[0];
  return pref?.url ?? null;
}

async function fetchKroger(token, locationId, term, limit = 50) {
  const q = new URLSearchParams({
    'filter.term':        term,
    'filter.locationId':  locationId,
    'filter.limit':       String(Math.min(limit, 50)),
    'filter.fulfillment': 'ais',
  });
  const r = await fetch(`${BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return [];
  const d = await r.json();
  return (d.data || [])
    .map(p => {
      const item  = p.items?.[0];
      const price = item?.price?.promo ?? item?.price?.regular ?? null;
      return {
        id:       p.productId || p.upc || '',
        name:     titleCase(p.description || ''),
        brand:    titleCase(p.brand || ''),
        size:     item?.size || '',
        price,
        imageUrl: getKrogerImage(p),
        inStock:  price !== null,
        source:   'kroger',
      };
    })
    .filter(p => p.name && p.name.length > 1 && !p.name.match(/^\d+$/));
}

async function fetchWalmart(term, limit = 25) {
  try {
    const url = `https://www.walmart.com/search/api/preso?query=${encodeURIComponent(term)}&cat_id=0&prg=desktop&_be=1`;
    const r   = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; THRFTBot/1.0)',
        'Accept':     'application/json',
      },
    });
    if (!r.ok) return [];
    const d     = await r.json();
    const items = d.items || d.searchResult?.item || [];
    return items.slice(0, limit).map(item => ({
      id:       `wmt_${item.usItemId || item.productId || Math.random()}`,
      name:     titleCase(item.name || item.title || ''),
      brand:    titleCase(item.brand || ''),
      size:     item.size || '',
      price:    item.price?.price ?? item.priceInfo?.currentPrice?.price ?? null,
      imageUrl: item.imageInfo?.thumbnailUrl || item.image || null,
      inStock:  true,
      source:   'walmart',
    })).filter(p => p.name && p.name.length > 1);
  } catch { return []; }
}

const AISLE_TERMS = {
  beverages: [
    'Coca-Cola soda cans', 'Pepsi cola cans', 'Sprite 7UP soda',
    'Mountain Dew Dr Pepper', 'Gatorade Powerade sports drink',
    'water sparkling flavored', 'juice orange apple grape',
    'coffee ground beans', 'tea bags iced', 'energy drink Red Bull Monster',
    'lemonade juice drink', 'milk chocolate almond oat',
  ],
  beer_wine: [
    'Bud Light beer', 'Coors Light beer', 'Miller Lite beer',
    'Corona Heineken imported beer', 'IPA craft beer ale',
    'hard seltzer White Claw', 'wine red Cabernet Merlot',
    'wine white Chardonnay Pinot', 'champagne sparkling wine',
    'hard cider Angry Orchard', 'Blue Moon wheat beer',
    'Modelo Dos Equis Mexican beer', 'Guinness dark beer stout',
  ],
  alcohol: [
    'Bud Light beer', 'Coors Light beer', 'Miller Lite beer',
    'Corona Heineken imported beer', 'IPA craft beer ale',
    'hard seltzer White Claw', 'wine red Cabernet Merlot',
    'wine white Chardonnay Pinot', 'champagne sparkling wine',
    'hard cider Angry Orchard', 'Blue Moon wheat beer',
    'Modelo Dos Equis Mexican beer',
  ],
  meat: [
    'chicken breast boneless', 'ground beef hamburger',
    'hot dogs beef franks', 'bacon strips smoked',
    'pork chops tenderloin', 'steak ribeye sirloin',
    'lunch meat deli turkey ham', 'sausage Italian bratwurst',
    'frozen burgers beef patties', 'chicken thighs drumsticks',
    'deli sliced pepperoni salami',
    'Tyson chicken', 'Oscar Mayer hot dogs lunch meat',
  ],
  seafood: [
    'salmon fillet fresh', 'shrimp cooked frozen',
    'tilapia cod fish fillet', 'crab legs shellfish',
    'tuna canned', 'lobster tail', 'scallops clams mussels',
  ],
  produce: [
    'bananas fresh fruit', 'apples gala fuji', 'strawberries blueberries',
    'tomatoes roma cherry', 'lettuce romaine spinach',
    'broccoli cauliflower vegetables', 'potatoes sweet potato',
    'onions garlic fresh', 'avocado lime citrus',
    'grapes oranges clementines', 'carrots celery cucumber',
    'peppers bell jalapeno', 'mushrooms zucchini squash',
  ],
  eggs_dairy: [
    'milk whole 2% gallon', 'eggs large dozen',
    'butter salted unsalted', 'cream heavy whipping',
    'sour cream half and half', 'almond milk oat milk',
    'orange juice', 'coffee creamer',
  ],
  cheese: [
    'cheddar cheese sliced block', 'mozzarella shredded',
    'parmesan romano', 'cream cheese Philadelphia',
    'Swiss provolone American sliced', 'pepper jack colby',
    'cottage cheese ricotta',
  ],
  frozen: [
    'frozen pizza DiGiorno', 'frozen meals Stouffers',
    'frozen vegetables broccoli peas', 'frozen chicken nuggets',
    'ice cream', 'frozen waffles Eggo',
    'frozen fish sticks', 'frozen burritos',
    'frozen french fries Ore-Ida', 'frozen breakfast sandwiches',
  ],
  bread: [
    'sandwich bread white wheat', 'bagels plain everything',
    'English muffins', 'tortillas flour corn',
    'hot dog hamburger buns', 'dinner rolls',
    'sourdough artisan bread', 'pita bread naan',
    'Daves Killer Bread',
  ],
  snacks: [
    'Doritos chips nacho', 'Lays potato chips',
    'Cheetos crunchy puffs', 'Pringles',
    'Ritz crackers', 'Goldfish crackers',
    'popcorn microwave SkinnyPop', 'pretzels',
    'trail mix nuts almonds', 'granola bars',
    'Fritos Tostitos', 'tortilla chips salsa',
  ],
  breakfast: [
    'Cheerios cereal', 'Frosted Flakes Kelloggs',
    'oatmeal Quaker instant', 'pancake mix Bisquick',
    'maple syrup', 'frozen waffles Eggo',
    'breakfast sausage Jimmy Dean', 'bacon strips',
    'granola Nature Valley', 'Pop-Tarts toaster',
    'Special K Raisin Bran', 'Lucky Charms Cocoa Puffs',
  ],
  cereal: [
    'Cheerios Honey Nut', 'Frosted Flakes Corn Flakes',
    'Cocoa Puffs Lucky Charms', 'Raisin Bran',
    'Special K granola', 'Fruit Loops Apple Jacks',
    'Grape Nuts Shredded Wheat', 'Cinnamon Toast Crunch',
  ],
  canned: [
    'Campbells soup tomato chicken', 'canned beans black kidney',
    'canned tomatoes diced crushed', 'tuna canned albacore',
    'canned corn peas green beans', 'chicken broth stock',
    'pasta sauce marinara', 'chili beef beans',
  ],
  cookies: [
    'Oreo cookies', 'Chips Ahoy chocolate chip',
    'Nutter Butter peanut butter', 'Keebler fudge stripes',
    'Pepperidge Farm Milano', 'ginger snaps',
    'Fig Newtons', 'animal crackers',
  ],
  candy: [
    'Reeses peanut butter cups', 'Snickers MMs',
    'Hershey chocolate bar', 'Kit Kat Twix',
    'Skittles Starburst gummy', 'Sour Patch Kids',
    'Haribo gummy bears', 'Jolly Rancher hard candy',
    'Milky Way 3 Musketeers',
  ],
  deli: [
    'Oscar Mayer turkey breast', 'ham lunch meat',
    'roast beef deli sliced', 'salami pepperoni',
    'bologna deli meat', 'chicken breast deli',
  ],
  yogurt: [
    'Chobani Greek yogurt', 'Fage plain Greek',
    'Oikos vanilla strawberry', 'Siggis Icelandic',
    'Yoplait original', 'Activia probiotic',
  ],
  personal_care: [
    'Pantene shampoo conditioner', 'Head Shoulders dandruff',
    'Dove body wash soap', 'Old Spice deodorant',
    'Gillette razor blades', 'Colgate toothpaste',
    'Listerine mouthwash', 'Neutrogena face wash',
  ],
  cleaning: [
    'Tide laundry detergent', 'Downy fabric softener',
    'Dawn dish soap', 'Lysol disinfectant spray',
    'Windex glass cleaner', 'Clorox bleach wipes',
    'paper towels Bounty', 'toilet paper Charmin',
  ],
  health: [
    'Tylenol acetaminophen', 'Advil ibuprofen',
    'vitamin C D zinc', 'multivitamin gummies',
    'Nyquil Dayquil cold flu', 'Pepto Bismol antacid',
    'allergy Claritin Zyrtec', 'melatonin sleep',
  ],
  baby: [
    'Pampers diapers', 'Huggies baby wipes',
    'Gerber baby food puree', 'Similac formula',
    'Enfamil baby formula', 'baby shampoo Johnsons',
  ],
  pet: [
    'Purina dog food', 'Pedigree kibble',
    'Fancy Feast cat food', 'Meow Mix cat',
    'dog treats Milk Bone', 'cat litter Tidy Cats',
    'Blue Buffalo pet food',
  ],
  packaged_meals: [
    'Kraft mac cheese', 'pasta Barilla spaghetti',
    'rice instant Uncle Bens', 'Hamburger Helper',
    'ramen noodles Maruchan', 'Annies mac cheese',
  ],
  condiments: [
    'Heinz ketchup', 'Frenchs mustard yellow',
    'Hellmanns mayonnaise', 'ranch Hidden Valley',
    'soy sauce teriyaki', 'hot sauce Tabasco Franks',
    'BBQ sauce Sweet Baby Rays', 'pickle relish',
  ],
  international: [
    'salsa Tostitos Pace', 'Mexican taco seasoning',
    'soy sauce Asian', 'coconut milk Thai curry',
    'hummus pita Mediterranean', 'kimchi Korean',
  ],
};

const BRAND_POPULARITY = {
  beverages:     ['Coca-Cola','Pepsi','Sprite','Mountain Dew','Dr Pepper','Gatorade','Powerade','Dasani','Aquafina','Red Bull','Monster','Tropicana','Minute Maid','Simply','Lipton','Snapple','Capri Sun','Celsius'],
  alcohol:       ['Bud Light','Coors Light','Miller Lite','Corona','Heineken','Budweiser','Modelo','White Claw','Michelob','Blue Moon','Dos Equis','Stella Artois','Angry Orchard','Guinness','Samuel Adams'],
  beer_wine:     ['Bud Light','Coors Light','Miller Lite','Corona','Heineken','Budweiser','Modelo','White Claw','Michelob Ultra'],
  meat:          ['Tyson','Perdue','Oscar Mayer','Hillshire Farm','Ball Park','Nathans','Johnsonville','Smithfield','Hebrew National','Applegate','Boars Head','Hormel','Jimmy Dean'],
  seafood:       ['Gordons','SeaPak','Bumble Bee','StarKist','Wild Planet'],
  produce:       ['Dole','Chiquita','Driscolls','Earthbound Farm','Taylor Farms','Green Giant','Birds Eye'],
  eggs_dairy:    ['Land O Lakes','Organic Valley','Horizon','Fairlife','Silk','Oatly','Simply Orange','Tropicana','Floridas Natural'],
  cheese:        ['Kraft','Sargento','Tillamook','Cabot','Philadelphia','Velveeta','Babybel','Cracker Barrel'],
  frozen:        ['DiGiorno','Stouffers','Lean Cuisine','Marie Callenders','Amys','Healthy Choice','Eggo','Ore-Ida','Birds Eye','Green Giant','Red Baron','Totinos'],
  bread:         ['Wonder','Natures Own','Daves Killer Bread','Sara Lee','Pepperidge Farm','Arnold','Thomas','Mission'],
  snacks:        ['Lays','Doritos','Cheetos','Pringles','Ritz','Goldfish','SkinnyPop','Fritos','Tostitos','Wheat Thins','Triscuit','Planters','Orville Redenbacher'],
  breakfast:     ['Kelloggs','General Mills','Quaker','Post','Cheerios','Jimmy Dean','Eggo','Nature Valley','Pillsbury','Bisquick'],
  cereal:        ['Kelloggs','General Mills','Quaker','Post','Cheerios','Cap n Crunch'],
  canned:        ['Campbells','Progresso','Del Monte','Hunts','Bushs','Goya','Libbys','Dole'],
  cookies:       ['Oreo','Chips Ahoy','Pepperidge Farm','Keebler','Nabisco','Famous Amos','Nutter Butter'],
  candy:         ['Hersheys','Reeses','MMs','Snickers','Skittles','Starburst','Haribo','Kit Kat','Twix','Milky Way'],
  deli:          ['Oscar Mayer','Boars Head','Hillshire Farm','Applegate','Land O Frost','Sara Lee'],
  yogurt:        ['Chobani','Fage','Oikos','Siggis','Yoplait','Dannon','Activia','Stonyfield'],
  personal_care: ['Dove','Pantene','Head Shoulders','Old Spice','Gillette','Colgate','Listerine','Neutrogena','Olay','LOreal'],
  cleaning:      ['Tide','Dawn','Lysol','Clorox','Downy','Swiffer','Bounty','Charmin','Gain','Mr Clean'],
  health:        ['Tylenol','Advil','Centrum','Nature Made','Bayer','Nyquil','Pepto-Bismol','Claritin','Zyrtec','Robitussin'],
  baby:          ['Pampers','Huggies','Gerber','Similac','Enfamil','Johnsons'],
  pet:           ['Purina','Pedigree','Blue Buffalo','Royal Canin','Hills Science','Meow Mix','Fancy Feast','Iams'],
  packaged_meals:['Kraft','Barilla','Uncle Bens','Hamburger Helper','Maruchan','Annies','Velveeta'],
  condiments:    ['Heinz','Frenchs','Hellmanns','Hidden Valley','Kraft','Tabasco','Franks RedHot','Sweet Baby Rays'],
};

function getBrandPriority(brand, categoryKey) {
  const list = BRAND_POPULARITY[categoryKey] || [];
  const idx  = list.findIndex(b =>
    brand.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(brand.toLowerCase().split(' ')[0])
  );
  return idx >= 0 ? idx : 999;
}

async function browseAisle(token, locationId, categoryKey, limit = 200) {
  const terms = AISLE_TERMS[categoryKey] || [categoryKey];

  const krogerResults = [];
  for (let i = 0; i < terms.length; i += 5) {
    const batch = terms.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(term => fetchKroger(token, locationId, term, 50).catch(() => []))
    );
    krogerResults.push(...results.flat());
  }

  const walmartResults = await Promise.all(
    terms.slice(0, 4).map(term => fetchWalmart(term, 25).catch(() => []))
  );

  const seen = new Set();
  const all  = [];
  for (const p of [...krogerResults, ...walmartResults.flat()]) {
    const key = p.name.toLowerCase().trim();
    if (key && !seen.has(key) && p.name.length > 1) {
      seen.add(key);
      all.push(p);
    }
  }
  return all.slice(0, limit);
}

async function searchProducts(token, locationId, term, limit = 30) {
  const [kroger, walmart] = await Promise.all([
    fetchKroger(token, locationId, term, limit).catch(() => []),
    fetchWalmart(term, 15).catch(() => []),
  ]);
  const seen = new Set();
  const all  = [];
  for (const p of [...kroger, ...walmart]) {
    const key = p.name.toLowerCase().trim();
    if (key && !seen.has(key)) { seen.add(key); all.push(p); }
  }
  return all.slice(0, limit);
}

function buildBrandHierarchy(products, categoryKey = '') {
  const brandMap = {};
  for (const p of products) {
    const brand = p.brand || 'Store Brand';
    if (!brandMap[brand]) brandMap[brand] = [];
    brandMap[brand].push(p);
  }

  const brands = Object.entries(brandMap).map(([brand, prods]) => {
    const familyMap = {};
    for (const p of prods) {
      const baseName = p.name
        .replace(/\s+\d+[\s.]?\d*\s*(oz|fl oz|lb|lbs|ct|pk|pack|count|g|ml|l|gal|gallon|liters?)\s*$/i, '')
        .replace(/\s+(family size|large|mega|king size|mini|snack size|value pack|twin pack)\s*$/i, '')
        .trim();

      if (!familyMap[baseName]) {
        familyMap[baseName] = { name: baseName, brand, imageUrl: null, price: null, variants: [] };
      }
      const fam = familyMap[baseName];
      if (p.imageUrl && !fam.imageUrl) fam.imageUrl = p.imageUrl;
      if (p.price !== null && (fam.price === null || p.price < fam.price)) fam.price = p.price;
      fam.variants.push({ id: p.id, name: p.name, size: p.size, price: p.price, imageUrl: p.imageUrl, inStock: p.inStock, source: p.source });
    }

    const families = Object.values(familyMap).map(fam => ({
      ...fam,
      variants: fam.variants.sort((a, b) => (a.price ?? 999) - (b.price ?? 999)),
    }));
    families.sort((a, b) => a.name.localeCompare(b.name));

    return { brand, imageUrl: prods.find(p => p.imageUrl)?.imageUrl || null, productCount: prods.length, products: families };
  });

  brands.sort((a, b) => {
    const pa = getBrandPriority(a.brand, categoryKey);
    const pb = getBrandPriority(b.brand, categoryKey);
    if (pa !== pb) return pa - pb;
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
      products = await searchProducts(token, locationId, term, limit || 30);
    } else {
      if (!category) return Response.json({ error: 'category required for browse' }, { status: 400 });
      products = await browseAisle(token, locationId, category, limit || 200);
    }

    const brands = mode === 'browse' ? buildBrandHierarchy(products, category || '') : [];

    return Response.json({ products, brands, locationId, zip_code, count: products.length, brandCount: brands.length });

  } catch (err) {
    console.error('krogerProducts error:', err);
    return Response.json({ error: 'Failed', message: err.message, products: [], brands: [] }, { status: 500 });
  }
});