/**
 * thrftFoodLibrary — v1
 * The THRFT Food Library unified backend.
 *
 * Modes:
 *   browse        — fetch aisle products from Kroger + Walmart, save to library
 *   search        — search library first, supplement with APIs
 *   save_product  — save a single product to library
 *   log_behavior  — log a user action (view/add/search)
 *   get_profiles  — get AI-ranked brand/product profiles for an aisle
 *   rebuild_profiles — rebuild BrandProfiles from behavior data
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KROGER_BASE = 'https://api.kroger.com/v1';

// ─── Kroger Auth ──────────────────────────────────────────────────────────────

async function getKrogerToken() {
  const id = Deno.env.get('KROGER_CLIENT_ID');
  const secret = Deno.env.get('KROGER_CLIENT_SECRET');
  if (!id || !secret) return null;
  const r = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${btoa(`${id}:${secret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!r.ok) return null;
  return (await r.json()).access_token;
}

async function getKrogerLocationId(token, zip) {
  const q = new URLSearchParams({ 'filter.zipCode.near': zip, 'filter.limit': '1' });
  const r = await fetch(`${KROGER_BASE}/locations?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return (await r.json()).data?.[0]?.locationId ?? null;
}

function titleCase(s = '') {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getKrogerImage(p) {
  if (!p.images?.length) return null;
  const front = p.images.find(i => i.perspective === 'front') || p.images[0];
  return front?.sizes?.find(s => s.size === 'medium')?.url || front?.sizes?.[0]?.url || null;
}

// ─── Kroger fetch with pagination ─────────────────────────────────────────────

async function fetchKrogerProducts(token, locationId, term, maxPages = 4) {
  const all = [];
  for (let page = 0; page < maxPages; page++) {
    try {
      const q = new URLSearchParams({
        'filter.term': term,
        'filter.locationId': locationId,
        'filter.limit': '50',
        'filter.start': String(page * 50),
        'filter.fulfillment': 'ais',
      });
      const r = await fetch(`${KROGER_BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) break;
      const d = await r.json();
      const products = d.data || [];
      all.push(...products.map(p => {
        const item = p.items?.[0];
        return {
          name: titleCase(p.description || ''),
          brand: titleCase(p.brand || ''),
          size: item?.size || '',
          price_kroger: item?.price?.promo ?? item?.price?.regular ?? null,
          image_url: getKrogerImage(p),
          kroger_id: p.productId || '',
          upc: p.upc || '',
          source: 'kroger',
        };
      }).filter(p => p.name && p.name.length > 1));
      if (products.length < 50) break;
    } catch { break; }
  }
  return all;
}

// ─── Walmart fetch ────────────────────────────────────────────────────────────

async function fetchWalmartProducts(term, limit = 40) {
  try {
    const url = `https://api.walmart.com/v1/search?query=${encodeURIComponent(term)}&numItems=${limit}&format=json&apiKey=t4w6hj6r-c6fc-483c-b58e-dc8e3b0090f1`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (r.ok) {
      const d = await r.json();
      const items = d.items || [];
      if (items.length > 0) {
        return items.map(item => ({
          name: titleCase(item.name || ''),
          brand: titleCase(item.brandName || ''),
          size: item.size || '',
          price_walmart: item.salePrice || item.msrp || null,
          image_url: item.largeImage || item.mediumImage || item.thumbnailImage || null,
          walmart_id: String(item.itemId || ''),
          upc: item.upc || '',
          source: 'walmart',
        })).filter(p => p.name && p.name.length > 1);
      }
    }
  } catch {}

  // Fallback — Walmart open search
  try {
    const url2 = `https://www.walmart.com/search/api/preso?query=${encodeURIComponent(term)}&cat_id=0&_be=1`;
    const r2 = await fetch(url2, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
    if (!r2.ok) return [];
    const d2 = await r2.json();
    const items2 = d2.items || d2.searchResult?.item || [];
    return items2.slice(0, limit).map(item => ({
      name: titleCase(item.name || item.title || ''),
      brand: titleCase(item.brand || ''),
      size: item.size || '',
      price_walmart: item.price?.price ?? item.priceInfo?.currentPrice?.price ?? null,
      image_url: item.imageInfo?.thumbnailUrl || item.image || null,
      walmart_id: String(item.usItemId || item.productId || ''),
      upc: item.upc || '',
      source: 'walmart',
    })).filter(p => p.name && p.name.length > 1);
  } catch { return []; }
}

// ─── Subcategory matching by product name ─────────────────────────────────────

const SUBCATEGORY_RULES = {
  beverages: {
    colas:     ['cola', 'soda', 'pepsi', 'sprite', 'dr pepper', 'mountain dew', '7up', 'fanta', 'ginger ale', 'root beer', 'diet coke', 'caffeine free', 'starry'],
    water:     ['water', 'dasani', 'aquafina', 'smartwater', 'spring water', 'purified'],
    sparkling: ['sparkling', 'seltzer', 'lacroix', 'bubly', 'perrier', 'pellegrino', 'carbonated water', 'topo chico'],
    juice:     ['juice', 'lemonade', 'fruit punch', 'hi-c', 'capri sun', 'kool-aid', 'hawaiian punch', 'cider', 'cranberry cocktail', 'v8'],
    sports:    ['gatorade', 'powerade', 'energy drink', 'red bull', 'monster energy', 'celsius', 'bang energy', 'prime hydration', 'body armor', 'electrolyte'],
    coffee:    ['coffee', ' tea ', 'frappuccino', 'cold brew', 'iced coffee', 'snapple', 'arizona', 'lipton', 'pure leaf', 'gold peak', 'dunkin'],
    milk_alt:  ['almond milk', 'oat milk', 'soy milk', 'coconut milk', 'silk ', 'oatly', 'califia', 'planet oat'],
  },
  meat: {
    chicken:        ['chicken breast', 'chicken thigh', 'chicken drumstick', 'chicken wing', 'whole chicken', 'rotisserie chicken', 'chicken tender', 'chicken fillet'],
    beef:           ['ground beef', 'beef steak', 'ribeye', 'sirloin', 'chuck roast', 'beef brisket', 'beef short rib', 'beef tenderloin', 'flank steak', 'skirt steak', 'london broil'],
    hotdogs:        ['hot dog', 'beef frank', 'pork frank', 'bratwurst', 'brat', 'kielbasa', 'andouille', 'breakfast sausage', 'italian sausage', 'smoked sausage'],
    bacon:          ['bacon'],
    pork:           ['pork chop', 'pork tenderloin', 'pork loin', 'baby back rib', 'spare rib', 'pork shoulder', 'pork butt'],
    lunch:          ['deli fresh', 'lunch meat', 'oven roasted turkey', 'honey ham', 'black forest ham', 'honey turkey', 'smoked turkey', 'roast beef sliced', 'bologna', 'genoa salami', 'hard salami', 'pepperoni sliced', 'pastrami', 'corned beef', 'prosciutto', 'mortadella'],
    plant:          ['beyond burger', 'impossible burger', 'veggie burger', 'plant based burger', 'meatless', 'morningstar', 'gardein'],
    frozen_burgers: ['beef patty', 'burger patty', 'frozen burger', 'bubba burger', 'angus patty'],
  },
  frozen: {
    pizza:     ['pizza'],
    meals:     ['lasagna', 'pot pie', 'mac cheese', 'entree', 'stouffer', 'lean cuisine', 'healthy choice', 'banquet meal', 'swanson', 'marie callender', 'frozen dinner', 'power bowl', 'protein bowl'],
    breakfast: ['eggo waffle', 'frozen waffle', 'french toast stick', 'breakfast sandwich', 'breakfast burrito', 'breakfast bowl', 'pancake frozen', 'jimmy dean frozen'],
    veggies:   ['frozen vegetable', 'frozen broccoli', 'frozen peas', 'frozen corn', 'frozen spinach', 'frozen green bean', 'edamame', 'riced cauliflower', 'birds eye', 'green giant'],
    fries:     ['french fries', 'fries ', 'tater tot', 'hash brown', 'potato wedge', 'ore-ida', 'alexia fry', 'mccain fry', 'onion ring frozen', 'potato skin', 'waffle fry', 'steak fry', 'shoestring fry'],
    chicken:   ['chicken nugget', 'chicken strip', 'chicken tender frozen', 'popcorn chicken', 'chicken finger', 'tyson any tizer'],
    seafood_f: ['fish stick', 'gorton', 'seapak', 'frozen shrimp', 'frozen fish fillet', 'crab cake frozen'],
    ice_cream: ['ice cream', 'frozen yogurt', 'gelato', 'sorbet', 'popsicle', 'fudgsicle', 'klondike', 'drumstick cone', 'creamsicle', 'ice cream bar', 'ice cream sandwich'],
    hot_pockets: ['hot pocket', 'pizza roll', 'taquito frozen', 'egg roll frozen'],
  },
  snacks: {
    potato_chips: ['potato chip', 'lays chip', 'ruffles', 'pringles', 'kettle chip', 'cape cod chip', 'utz chip', 'wavy chip'],
    tortilla:     ['tortilla chip', 'doritos', 'tostitos', 'nacho chip', 'corn chip'],
    crackers:     ['cracker', 'ritz ', 'wheat thin', 'triscuit', 'goldfish', 'cheez-it', 'club cracker', 'saltine', 'graham cracker', 'nabisco', 'keebler'],
    popcorn:      ['popcorn'],
    pretzels:     ['pretzel'],
    nuts:         ['mixed nuts', 'peanut', 'almond', 'cashew', 'walnut', 'pecan', 'trail mix', 'pistachio'],
    bars:         ['granola bar', 'protein bar', 'nature valley', 'kind bar', 'clif bar', 'rxbar', 'larabar', 'fiber one bar', 'nutri grain'],
    cheese_snacks:['cheetos', 'cheese puff', 'cheese curl', 'pirates booty'],
  },
  alcohol: {
    light_beer:  ['bud light', 'coors light', 'miller lite', 'michelob ultra', 'natural light', 'busch light', 'keystone light'],
    regular_beer:['budweiser ', 'coors banquet', 'miller high life', 'pabst', 'hamms', 'rolling rock'],
    import_beer: ['corona', 'heineken', 'modelo', 'dos equis', 'stella artois', 'guinness', 'peroni', 'newcastle', 'pacifico'],
    craft_beer:  ['samuel adams', 'blue moon', 'sierra nevada', 'lagunitas', 'goose island', 'dogfish head', 'new belgium', 'fat tire', 'craft beer', 'ipa ', 'pale ale', 'amber ale', 'wheat beer', 'stout'],
    seltzer:     ['hard seltzer', 'white claw', 'truly hard', 'bud light seltzer', 'high noon', 'vizzy'],
    wine:        ['wine', 'cabernet', 'merlot', 'pinot noir', 'chardonnay', 'pinot grigio', 'sauvignon blanc', 'prosecco', 'champagne', 'rose wine', 'riesling'],
  },
};

function getSubcategoryKey(productName, brandName, aisleKey) {
  const rules = SUBCATEGORY_RULES[aisleKey];
  if (!rules) return null;
  const text = `${productName} ${brandName}`.toLowerCase();
  for (const [subkey, keywords] of Object.entries(rules)) {
    if (keywords.some(k => text.includes(k.toLowerCase()))) return subkey;
  }
  return null;
}

// ─── Aisle search terms ───────────────────────────────────────────────────────

const AISLE_TERMS = {
  beverages:     ['Coca-Cola Pepsi soda', 'Sprite Dr Pepper Mountain Dew', 'Gatorade Powerade sports drink', 'water sparkling LaCroix seltzer', 'juice orange apple cranberry', 'Red Bull Monster energy drink', 'coffee tea iced Starbucks', 'almond oat milk Silk'],
  meat:          ['chicken breast boneless', 'chicken thighs drumsticks wings', 'ground beef hamburger steak', 'Oscar Mayer hot dogs franks', 'Johnsonville sausage bratwurst', 'bacon smoked', 'turkey ham deli lunch meat', 'pepperoni salami bologna', 'Beyond Impossible veggie burger', 'frozen beef patties burgers', 'pork chops tenderloin ribs'],
  seafood:       ['salmon fillet fresh', 'shrimp frozen', 'tilapia cod fish fillet', 'canned tuna Bumble Bee StarKist', 'Gortons fish sticks SeaPak'],
  eggs_dairy:    ['whole milk gallon', 'eggs large dozen', 'butter Land O Lakes salted', 'cream cheese sour cream', 'heavy whipping cream', 'coffee creamer', 'almond milk oat milk'],
  cheese:        ['cheddar cheese sliced', 'mozzarella shredded', 'Kraft American Swiss sliced', 'Sargento Tillamook', 'parmesan feta', 'cottage cheese ricotta cream cheese'],
  frozen:        ['DiGiorno Red Baron frozen pizza', 'Tombstone Totinos pizza', 'Stouffers Healthy Choice frozen meals', 'Jimmy Dean breakfast sandwich', 'Eggo waffles frozen', 'Birds Eye frozen vegetables', 'Ore-Ida french fries', 'tater tots hash browns', 'Ben Jerrys Breyers ice cream', 'chicken nuggets frozen', 'Hot Pockets frozen'],
  bread:         ['white wheat sandwich bread', 'Natures Own Dave Killer Bread', 'Sara Lee Pepperidge Farm', 'hamburger hot dog buns Kings Hawaiian', 'bagels Thomas English muffins', 'flour tortillas Mission', 'sourdough artisan bread'],
  snacks:        ['Lays Ruffles potato chips', 'Doritos Cheetos Fritos', 'Pringles chips', 'Ritz Wheat Thins crackers', 'Goldfish Cheez-It', 'SkinnyPop popcorn Orville', 'pretzels nuts almonds', 'Nature Valley Kind granola bars'],
  breakfast:     ['Cheerios Frosted Flakes cereal', 'Raisin Bran Special K', 'Lucky Charms Cocoa Puffs', 'Quaker oatmeal instant', 'Bisquick Aunt Jemima pancake', 'Pop Tarts Nutri Grain', 'Jimmy Dean breakfast sausage', 'syrup Log Cabin maple'],
  cereal:        ['Cheerios Honey Nut cereal', 'Frosted Flakes Corn Flakes Kelloggs', 'Raisin Bran Special K fiber', 'Lucky Charms Cinnamon Toast Crunch', 'Cap N Crunch Froot Loops'],
  canned:        ['Campbells soup chicken noodle tomato', 'Progresso soup', 'Hunts Del Monte diced tomatoes', 'Bush beans baked black kidney', 'tuna Bumble Bee StarKist', 'Prego Ragu marinara pasta sauce', 'chicken broth stock Swanson'],
  cookies:       ['Oreo cookies double stuf', 'Chips Ahoy chocolate chip', 'Pepperidge Farm Milano', 'Keebler Nutter Butter', 'Famous Amos graham crackers'],
  candy:         ['Reeses peanut butter cups', 'Hersheys chocolate kisses', 'Snickers Twix Kit Kat', 'M&Ms Skittles Starburst', 'Sour Patch Kids gummy bears Haribo', 'Jolly Rancher hard candy lollipop'],
  deli:          ['Oscar Mayer deli fresh turkey', 'Oscar Mayer honey ham', 'Hillshire Farm turkey breast', 'Boars Head deli', 'Applegate turkey ham', 'salami pepperoni sliced', 'roast beef pastrami'],
  yogurt:        ['Chobani Greek yogurt', 'Fage plain Greek', 'Oikos Dannon Yoplait yogurt', 'Siggi Stonyfield', 'dairy free coconut yogurt Kite Hill'],
  personal_care: ['Pantene shampoo conditioner', 'Head Shoulders dandruff', 'Dove body wash', 'Old Spice deodorant', 'Gillette razor', 'Colgate Crest toothpaste', 'Listerine mouthwash'],
  cleaning:      ['Tide laundry detergent pods', 'Gain detergent', 'Dawn dish soap', 'Cascade dishwasher pods', 'Lysol disinfecting spray', 'Clorox wipes', 'Bounty paper towels', 'Charmin toilet paper', 'Glad trash bags'],
  health:        ['Tylenol acetaminophen', 'Advil Aleve ibuprofen', 'Nyquil Dayquil cold flu', 'Claritin Zyrtec allergy', 'Centrum One A Day vitamins', 'vitamin C D supplements', 'Pepto Bismol Tums antacid', 'Band Aid first aid'],
  baby:          ['Pampers Huggies diapers', 'baby wipes sensitive', 'Similac Enfamil formula', 'Gerber baby food', 'Johnson baby wash', 'Desitin diaper rash cream'],
  pet:           ['Purina Pro Plan dog food', 'Pedigree Blue Buffalo dog', 'Fancy Feast Friskies cat food', 'Meow Mix cat', 'Milk Bone dog treats', 'Greenies dental', 'Tidy Cats litter'],
  alcohol:       ['Bud Light beer cans 12 pack', 'Coors Light Miller Lite', 'Corona Heineken Modelo imported beer', 'Samuel Adams Blue Moon craft IPA', 'White Claw Truly hard seltzer', 'Barefoot wine Cabernet Chardonnay'],
  packaged_meals:['Kraft mac cheese', 'Annies macaroni', 'Barilla pasta spaghetti', 'Uncle Bens rice instant', 'Maruchan ramen noodles', 'Hamburger Helper'],
  condiments:    ['Heinz ketchup mustard', 'Hellmanns mayonnaise', 'Hidden Valley ranch', 'Sweet Baby Rays BBQ sauce', 'Tabasco Franks hot sauce', 'Kikkoman soy sauce teriyaki', 'Vlasic pickles', 'Italian dressing Newman'],
};

// ─── Merge Kroger + Walmart products ─────────────────────────────────────────

function mergeProducts(krogerList, walmartList) {
  const seen = new Set();
  const all = [];

  for (const p of krogerList) {
    const key = (p.upc || p.kroger_id || p.name.toLowerCase().trim());
    if (key && !seen.has(key)) { seen.add(key); all.push(p); }
  }

  for (const p of walmartList) {
    const key = (p.upc || p.walmart_id || p.name.toLowerCase().trim());
    if (key && !seen.has(key)) { seen.add(key); all.push(p); }
  }
  return all;
}

// ─── Build brand hierarchy ────────────────────────────────────────────────────

const BRAND_PRIORITY = {
  beverages:   ['Coca-Cola','Pepsi','Diet Coke','Sprite','Mountain Dew','Dr Pepper','Gatorade','Powerade','Dasani','Aquafina','Red Bull','Monster','Tropicana','Minute Maid','Simply','Lipton','Snapple','Capri Sun','Celsius'],
  meat:        ['Tyson','Perdue','Oscar Mayer','Hillshire Farm','Ball Park','Nathans','Hebrew National','Johnsonville','Smithfield','Hormel','Jimmy Dean','Applegate','Boars Head'],
  frozen:      ['DiGiorno','Red Baron','Tombstone','Stouffers','Healthy Choice','Lean Cuisine','Eggo','Ore-Ida','Birds Eye','Green Giant','Ben Jerrys','Breyers','Dreyers','Klondike'],
  snacks:      ["Lay's",'Doritos','Cheetos','Pringles','Ritz','Goldfish','SkinnyPop','Fritos','Tostitos','Wheat Thins','Triscuit','Nature Valley','Kind'],
  breakfast:   ["Kellogg's",'General Mills','Quaker','Post','Jimmy Dean','Eggo','Bisquick'],
  alcohol:     ['Bud Light','Coors Light','Miller Lite','Michelob Ultra','Corona','Heineken','Modelo','White Claw','Truly','Budweiser','Blue Moon','Samuel Adams'],
};

function getBrandPriority(brand, aisleKey) {
  const list = BRAND_PRIORITY[aisleKey] || [];
  const b = brand.toLowerCase();
  const idx = list.findIndex(p => b.includes(p.toLowerCase().split(' ')[0]) || p.toLowerCase().includes(b.split(' ')[0]));
  return idx >= 0 ? idx : 999;
}

function buildHierarchy(products, aisleKey) {
  const brandMap = {};
  for (const p of products) {
    const brand = p.brand || 'Store Brand';
    if (!brandMap[brand]) brandMap[brand] = [];
    brandMap[brand].push(p);
  }

  const brands = Object.entries(brandMap).map(([brand, prods]) => {
    const familyMap = {};
    for (const p of prods) {
      const base = p.name
        .replace(/\s+\d+[\s.]?\d*\s*(oz|fl oz|lb|lbs|ct|pk|pack|count|g|ml|l|gal|gallon|liters?)\s*$/i, '')
        .replace(/\s+(family size|large|mega|king size|mini|snack size|value pack|twin pack)\s*$/i, '')
        .trim();
      if (!familyMap[base]) familyMap[base] = { name: base, brand, imageUrl: null, price: null, variants: [] };
      const fam = familyMap[base];
      if ((p.image_url || p.imageUrl) && !fam.imageUrl) fam.imageUrl = p.image_url || p.imageUrl;
      const price = p.price_kroger || p.price_walmart || p.price || null;
      if (price !== null && (fam.price === null || price < fam.price)) fam.price = price;
      fam.variants.push({
        id: p.kroger_id || p.walmart_id || p.id || '',
        name: p.name,
        size: p.size,
        price: price,
        imageUrl: p.image_url || p.imageUrl,
        inStock: price !== null,
        source: p.source,
        subcategoryKey: p.subcategoryKey,
      });
    }

    const families = Object.values(familyMap).map(f => ({
      ...f,
      variants: f.variants.sort((a, b) => (a.price ?? 999) - (b.price ?? 999)),
    }));
    families.sort((a, b) => a.name.localeCompare(b.name));

    return {
      brand,
      imageUrl: prods.find(p => p.image_url || p.imageUrl)?.image_url || prods.find(p => p.imageUrl)?.imageUrl || null,
      productCount: prods.length,
      products: families,
    };
  });

  brands.sort((a, b) => {
    const pa = getBrandPriority(a.brand, aisleKey);
    const pb = getBrandPriority(b.brand, aisleKey);
    if (pa !== pb) return pa - pb;
    return a.brand.localeCompare(b.brand);
  });

  return brands;
}

// ─── Auto-save products to ProductLibrary ────────────────────────────────────

async function saveProductsToLibrary(base44, products, aisleKey) {
  const toSave = products.filter(p => p.name && p.name.length > 1);
  const batches = [];
  for (let i = 0; i < toSave.length; i += 10) batches.push(toSave.slice(i, i + 10));

  let saved = 0;
  for (const batch of batches) {
    await Promise.all(batch.map(async p => {
      try {
        const existing = await base44.entities.ProductLibrary.filter({ name: p.name }).catch(() => []);
        if (existing.length === 0) {
          await base44.entities.ProductLibrary.create({
            name:          p.name,
            brand:         p.brand || '',
            aisle_key:     aisleKey,
            category_key:  p.subcategoryKey || '',
            size:          p.size || '',
            image_url:     p.image_url || p.imageUrl || '',
            price_kroger:  p.price_kroger || null,
            price_walmart: p.price_walmart || null,
            kroger_id:     p.kroger_id || '',
            walmart_id:    p.walmart_id || '',
            upc:           p.upc || '',
            times_added:   0,
            times_viewed:  0,
            last_seen:     new Date().toISOString(),
            source:        p.source || 'api',
          });
          saved++;
        } else {
          const updates = { last_seen: new Date().toISOString() };
          if (p.price_kroger) updates.price_kroger = p.price_kroger;
          if (p.price_walmart) updates.price_walmart = p.price_walmart;
          if ((p.image_url || p.imageUrl) && !existing[0].image_url) {
            updates.image_url = p.image_url || p.imageUrl;
          }
          await base44.entities.ProductLibrary.update(existing[0].id, updates).catch(() => {});
        }
      } catch {}
    }));
  }
  return saved;
}

// ─── Log user behavior ────────────────────────────────────────────────────────

async function logBehavior(base44, userId, action, data) {
  try {
    await base44.entities.UserBehaviorLog.create({
      user_id:      userId,
      action,
      aisle_key:    data.aisle_key || '',
      category_key: data.category_key || '',
      brand:        data.brand || '',
      product_name: data.product_name || '',
      session_id:   data.session_id || '',
      created_at:   new Date().toISOString(),
    });
  } catch {}
}

// ─── AI Profile rebuilder ─────────────────────────────────────────────────────

async function rebuildProfiles(base44, aisleKey) {
  try {
    const logs = await base44.entities.UserBehaviorLog.filter({ aisle_key: aisleKey }).catch(() => []);
    const products = await base44.entities.ProductLibrary.filter({ aisle_key: aisleKey }).catch(() => []);

    if (products.length === 0) return { profiles: 0 };

    const brandScores = {};
    for (const log of logs) {
      if (!log.brand) continue;
      if (!brandScores[log.brand]) brandScores[log.brand] = 0;
      if (log.action === 'add') brandScores[log.brand] += 3;
      if (log.action === 'view') brandScores[log.brand] += 1;
      if (log.action === 'search') brandScores[log.brand] += 2;
    }

    const brandProducts = {};
    for (const p of products) {
      const brand = p.brand || 'Store Brand';
      if (!brandProducts[brand]) brandProducts[brand] = [];
      brandProducts[brand].push(p);
    }

    let profileCount = 0;
    for (const [brand, prods] of Object.entries(brandProducts)) {
      const topProducts = prods
        .sort((a, b) => (b.times_added || 0) - (a.times_added || 0))
        .slice(0, 5)
        .map(p => p.name);

      const existing = await base44.entities.BrandProfile.filter({ brand_name: brand, aisle_key: aisleKey }).catch(() => []);
      const profileData = {
        brand_name:       brand,
        aisle_key:        aisleKey,
        popularity_score: brandScores[brand] || 0,
        product_count:    prods.length,
        image_url:        prods.find(p => p.image_url)?.image_url || '',
        top_products:     topProducts,
      };

      if (existing.length === 0) {
        await base44.entities.BrandProfile.create(profileData).catch(() => {});
      } else {
        await base44.entities.BrandProfile.update(existing[0].id, profileData).catch(() => {});
      }
      profileCount++;
    }

    return { profiles: profileCount, aisleKey };
  } catch (err) {
    return { error: err.message };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { mode, term, aisle_key, zip_code, product, action, log_data, limit } = body;

  // ── MODE: browse aisle ──────────────────────────────────────────────────────
  if (mode === 'browse') {
    if (!aisle_key || !zip_code) return Response.json({ error: 'aisle_key and zip_code required' }, { status: 400 });

    try {
      const libraryProducts = await base44.entities.ProductLibrary.filter({ aisle_key }).catch(() => []);
      const terms = AISLE_TERMS[aisle_key] || [aisle_key];
      let apiProducts = [];

      const krogerToken = await getKrogerToken();
      const krogerLocId = krogerToken ? await getKrogerLocationId(krogerToken, zip_code) : null;

      const [krogerResults, walmartResults] = await Promise.all([
        krogerLocId ? Promise.all(
          terms.slice(0, 4).map(t => fetchKrogerProducts(krogerToken, krogerLocId, t, 3).catch(() => []))
        ).then(r => r.flat()) : Promise.resolve([]),
        Promise.all(
          terms.slice(0, 3).map(t => fetchWalmartProducts(t, 30).catch(() => []))
        ).then(r => r.flat()),
      ]);

      apiProducts = mergeProducts(krogerResults, walmartResults);

      const enriched = apiProducts.map(p => ({
        ...p,
        subcategoryKey: getSubcategoryKey(p.name, p.brand, aisle_key),
      }));

      const libraryNames = new Set(libraryProducts.map(p => p.name.toLowerCase()));
      const newFromApi = enriched.filter(p => !libraryNames.has(p.name.toLowerCase()));
      const allProducts = [
        ...libraryProducts.map(p => ({ ...p, imageUrl: p.image_url })),
        ...newFromApi,
      ];

      if (newFromApi.length > 0) {
        saveProductsToLibrary(base44, newFromApi, aisle_key).catch(() => {});
      }

      logBehavior(base44, user.id, 'browse', { aisle_key }).catch(() => {});

      const brands = buildHierarchy(allProducts, aisle_key);

      return Response.json({
        products:    allProducts,
        brands,
        count:       allProducts.length,
        brandCount:  brands.length,
        fromLibrary: libraryProducts.length,
        fromApi:     newFromApi.length,
        aisle_key,
      });

    } catch (err) {
      return Response.json({ error: err.message, products: [], brands: [] }, { status: 500 });
    }
  }

  // ── MODE: search ────────────────────────────────────────────────────────────
  if (mode === 'search') {
    if (!term) return Response.json({ error: 'term required' }, { status: 400 });

    try {
      const libraryResults = await base44.entities.ProductLibrary.filter({ name__icontains: term }).catch(() => []);

      if (libraryResults.length >= 15) {
        logBehavior(base44, user.id, 'search', { product_name: term }).catch(() => {});
        return Response.json({
          products: libraryResults.map(p => ({ ...p, imageUrl: p.image_url })),
          source: 'library',
          count: libraryResults.length,
        });
      }

      const krogerToken = await getKrogerToken();
      const krogerLocId = krogerToken ? await getKrogerLocationId(krogerToken, zip_code || '10001') : null;

      const [kroger, walmart] = await Promise.all([
        krogerLocId ? fetchKrogerProducts(krogerToken, krogerLocId, term, 1).catch(() => []) : Promise.resolve([]),
        fetchWalmartProducts(term, 20).catch(() => []),
      ]);

      const merged = mergeProducts(kroger, walmart).map(p => ({
        ...p,
        imageUrl: p.image_url || p.imageUrl,
      }));

      const libNames = new Set(libraryResults.map(p => p.name.toLowerCase()));
      const newProds = merged.filter(p => !libNames.has(p.name.toLowerCase()));
      if (newProds.length > 0) saveProductsToLibrary(base44, newProds, '').catch(() => {});

      logBehavior(base44, user.id, 'search', { product_name: term }).catch(() => {});

      return Response.json({
        products: [...libraryResults.map(p => ({ ...p, imageUrl: p.image_url })), ...merged].slice(0, 30),
        source: 'mixed',
        count: libraryResults.length + merged.length,
      });

    } catch (err) {
      return Response.json({ error: err.message, products: [] }, { status: 500 });
    }
  }

  // ── MODE: save_product ──────────────────────────────────────────────────────
  if (mode === 'save_product') {
    if (!product?.name) return Response.json({ error: 'product.name required' }, { status: 400 });
    try {
      const existing = await base44.entities.ProductLibrary.filter({ name: product.name }).catch(() => []);
      if (existing.length === 0) {
        await base44.entities.ProductLibrary.create({
          name:          product.name,
          brand:         product.brand || '',
          aisle_key:     product.aisle_key || aisle_key || '',
          category_key:  product.category_key || '',
          size:          product.size || '',
          image_url:     product.image_url || product.imageUrl || '',
          price_kroger:  product.price_kroger || product.price || null,
          price_walmart: product.price_walmart || null,
          kroger_id:     product.kroger_id || '',
          walmart_id:    product.walmart_id || '',
          upc:           product.upc || '',
          times_added:   1,
          times_viewed:  0,
          last_seen:     new Date().toISOString(),
          source:        'user',
        });
      } else {
        await base44.entities.ProductLibrary.update(existing[0].id, {
          times_added: (existing[0].times_added || 0) + 1,
          last_seen:   new Date().toISOString(),
        }).catch(() => {});
      }
      logBehavior(base44, user.id, 'add', { product_name: product.name, brand: product.brand, aisle_key: product.aisle_key || aisle_key }).catch(() => {});
      return Response.json({ success: true });
    } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
  }

  // ── MODE: log_behavior ──────────────────────────────────────────────────────
  if (mode === 'log_behavior') {
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });
    await logBehavior(base44, user.id, action, log_data || {});
    return Response.json({ success: true });
  }

  // ── MODE: rebuild_profiles ──────────────────────────────────────────────────
  if (mode === 'rebuild_profiles') {
    if (!aisle_key) return Response.json({ error: 'aisle_key required' }, { status: 400 });
    const result = await rebuildProfiles(base44, aisle_key);
    return Response.json(result);
  }

  // ── MODE: get_profiles ──────────────────────────────────────────────────────
  if (mode === 'get_profiles') {
    if (!aisle_key) return Response.json({ error: 'aisle_key required' }, { status: 400 });
    try {
      const profiles = await base44.entities.BrandProfile.filter({ aisle_key }).catch(() => []);
      profiles.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
      return Response.json({ profiles, count: profiles.length });
    } catch (err) { return Response.json({ error: err.message, profiles: [] }, { status: 500 }); }
  }

  return Response.json({ error: 'Invalid mode' }, { status: 400 });
});