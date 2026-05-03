/**
 * thrftFoodLibrary — v2
 *
 * 3-layer product placement system:
 *   Layer 1: Multi-subcategory — product appears in multiple subcategories within same aisle
 *   Layer 2: Cross-aisle — product surfaces in secondary aisles based on defined rules
 *   Layer 3: User behavior — nightly AI ranking + real-time counter increments
 *
 * Modes:
 *   browse          — fetch aisle, library + Kroger + Walmart in parallel
 *   search          — global search across entire library
 *   save_product    — save product, increment counters
 *   log_behavior    — log user action
 *   rebuild_profiles — nightly AI profile rebuild from behavior data
 *   get_profiles    — get ranked brand profiles for aisle
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KROGER_BASE = 'https://api.kroger.com/v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleCase(s = '') {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ─── Brand extraction — 80+ known national brands ────────────────────────────

const KNOWN_BRANDS = [
  "Tyson","Perdue","Oscar Mayer","Ball Park","Hebrew National","Nathan's","Johnsonville",
  "Jimmy Dean","Bob Evans","Hormel","Smithfield","Applegate","Hillshire Farm","Boar's Head",
  "Land O'Frost","Sara Lee","Dietz Watson",
  "Ore-Ida","Alexia","McCain","Bird's Eye","Green Giant","Cascadian Farm",
  "DiGiorno","Red Baron","Tombstone","Totino's","Freschetta","Amy's",
  "Stouffer's","Healthy Choice","Lean Cuisine","Marie Callender's","Banquet","Swanson",
  "Eggo","Pillsbury","Bisquick","Krusteaz",
  "Coca-Cola","Pepsi","Sprite","Dr Pepper","Mountain Dew","7UP","Fanta",
  "Gatorade","Powerade","Dasani","Aquafina","Smartwater","Evian","Fiji",
  "LaCroix","Bubly","Perrier","San Pellegrino","Topo Chico",
  "Tropicana","Minute Maid","Simply","Ocean Spray","Welch's","Mott's","V8",
  "Red Bull","Monster","Celsius","Bang","Prime","Body Armor","Liquid IV",
  "Starbucks","Dunkin","Lipton","Snapple","AriZona","Pure Leaf","Gold Peak",
  "Silk","Oatly","Califia","Planet Oat",
  "Lay's","Ruffles","Pringles","Doritos","Cheetos","Fritos","Tostitos","Santitas",
  "Ritz","Wheat Thins","Triscuit","Goldfish","Cheez-It","Club Crackers",
  "SkinnyPop","Orville Redenbacher","Act II","Boom Chicka Pop","Smartfood",
  "Snyder's","Rold Gold","Nature Valley","Kind","Clif","RxBar","Larabar",
  "Planters","Blue Diamond","Emerald","Wonderful",
  "Kellogg's","General Mills","Quaker","Post","Cap'n Crunch","Lucky Charms",
  "Cheerios","Frosted Flakes","Special K","Raisin Bran","Life","Grape Nuts",
  "Honey Bunches of Oats","Cinnamon Toast Crunch","Cocoa Puffs","Froot Loops",
  "Pop-Tarts","Nutri-Grain","Eggo",
  "Kraft","Sargento","Tillamook","Cabot","Cracker Barrel","Velveeta","Philadelphia",
  "Babybel","Boursin","BelGioioso",
  "Chobani","Fage","Oikos","Yoplait","Dannon","Siggi's","Stonyfield","Noosa",
  "Ben & Jerry's","Häagen-Dazs","Breyers","Dreyer's","Blue Bunny","Klondike",
  "Good Humor","Drumstick","Popsicle","Fudgsicle",
  "Dave's Killer Bread","Nature's Own","Sara Lee","Pepperidge Farm","Arnold",
  "Wonder","King's Hawaiian","Martin's","Thomas'","Udi's","Canyon Bakehouse",
  "Mission","Old El Paso","La Banderita","Flatout",
  "Tide","Gain","Arm & Hammer","Downy","Bounce","All","Persil",
  "Dawn","Palmolive","Cascade","Finish",
  "Lysol","Clorox","Mr. Clean","Fabuloso","Pine-Sol","Windex","409",
  "Bounty","Charmin","Scott","Angel Soft","Kleenex","Puffs",
  "Glad","Hefty","Ziploc","Reynolds",
  "Pampers","Huggies","Luvs","WaterWipes","Similac","Enfamil","Gerber",
  "Johnson's","Aveeno Baby","Desitin","Boudreaux's",
  "Purina","Pedigree","Blue Buffalo","Hill's Science Diet","Royal Canin","Iams",
  "Fancy Feast","Friskies","Meow Mix","Temptations","Milk-Bone","Greenies",
  "Tidy Cats","Fresh Step","Dr. Elsey's",
  "Tylenol","Advil","Aleve","Bayer","Excedrin","Motrin",
  "NyQuil","DayQuil","Mucinex","Robitussin","Sudafed",
  "Claritin","Zyrtec","Benadryl","Allegra","Flonase",
  "Centrum","One A Day","Nature Made","Vitafusion","Emergen-C",
  "Pepto-Bismol","Tums","Rolaids","MiraLax","Band-Aid","Neosporin",
  "Heinz","French's","Grey Poupon","Hellmann's","Duke's","Miracle Whip",
  "Hidden Valley","Newman's Own","Ken's","Wishbone",
  "Sweet Baby Ray's","Stubb's","KC Masterpiece",
  "Tabasco","Frank's RedHot","Cholula","Sriracha","Kikkoman","A.1.",
  "Vlasic","Claussen","Mt. Olive",
  "Campbell's","Progresso","Wolfgang Puck","Amy's",
  "Hunt's","Del Monte","Muir Glen","Ro-Tel","San Marzano",
  "Bush's","Goya","Eden","StarKist","Bumble Bee","Wild Planet","Swanson",
  "Prego","Ragu","Bertolli","Rao's","Victoria",
  "Barilla","Mueller's","Ronzoni","De Cecco","Banza",
  "Uncle Ben's","Minute Rice","Zatarain's","Near East","Rice-A-Roni",
  "Maruchan","Nissin","Hamburger Helper","Kraft","Annie's","Velveeta",
  "Bud Light","Coors Light","Miller Lite","Michelob Ultra","Natural Light","Busch Light",
  "Budweiser","Coors Banquet","Miller High Life","Pabst",
  "Corona","Heineken","Modelo","Dos Equis","Stella Artois","Guinness","Peroni",
  "Samuel Adams","Blue Moon","Sierra Nevada","Lagunitas","Goose Island","New Belgium",
  "White Claw","Truly","High Noon","Vizzy",
  "Barefoot","Sutter Home","Josh Cellars","Woodbridge","Apothic","Kim Crawford",
  "Oreo","Chips Ahoy","Nutter Butter","Keebler","Famous Amos","Pepperidge Farm",
  "Reese's","Hershey's","Snickers","Kit Kat","Twix","Milky Way","Butterfinger",
  "M&Ms","Skittles","Starburst","Sour Patch Kids","Haribo","Swedish Fish",
  "Jolly Rancher","Life Savers","Werther's","Altoids","Tic Tac",
];

function extractBrand(productName, apiBrand) {
  const GENERIC = ['kroger','private selection','simple truth','comforts',
    'heritage farm','store brand','p$$t','psst','check this out'];
  if (apiBrand && apiBrand.length > 2 &&
      !GENERIC.includes(apiBrand.toLowerCase())) {
    return titleCase(apiBrand);
  }
  const nameLower = productName.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    const bl = brand.toLowerCase();
    if (nameLower.startsWith(bl) ||
        nameLower.includes(' ' + bl + ' ') ||
        nameLower.includes(' ' + bl + "'") ||
        nameLower.includes(bl + ' ')) {
      return brand;
    }
  }
  return apiBrand ? titleCase(apiBrand) : 'Store Brand';
}

// ─── Layer 1: Multi-subcategory rules ────────────────────────────────────────

const SUBCATEGORY_RULES = {
  beverages: {
    colas:     ['cola','soda cans','soda bottle','pepsi','sprite','dr pepper','mountain dew','7up','fanta','ginger ale','root beer','diet coke','caffeine free soda','starry','mello yello','barq'],
    water:     ['water 24pk','water 12pk','spring water','purified water','drinking water','dasani','aquafina','smartwater','evian','fiji water','poland spring','deer park'],
    sparkling: ['sparkling water','seltzer water','carbonated water','lacroix','bubly','perrier','san pellegrino','topo chico','waterloo','polar sparkling'],
    juice:     ['juice','lemonade','fruit punch','hi-c','capri sun','kool-aid','hawaiian punch','apple cider','cranberry cocktail','v8 vegetable'],
    sports:    ['gatorade','powerade','sports drink','energy drink','red bull','monster energy','celsius','bang energy','prime hydration','body armor','liquid iv','electrolyte drink'],
    coffee:    ['iced coffee','cold brew coffee','coffee drink','frappuccino','dunkin','snapple tea','arizona tea','lipton tea','pure leaf','gold peak tea','honest tea'],
    milk_alt:  ['almond milk','oat milk','soy milk','coconut milk','silk milk','oatly','califia farms','planet oat','ripple milk'],
  },
  meat: {
    chicken:   ['chicken breast','chicken thigh','chicken drumstick','chicken wing','whole chicken','rotisserie','chicken tender','chicken fillet','boneless skinless chicken'],
    beef:      ['ground beef','beef steak','ribeye steak','sirloin steak','chuck roast','beef brisket','beef short rib','beef tenderloin','flank steak','skirt steak','london broil','beef patty','angus beef'],
    hotdogs:   ['hot dog','beef frank','pork frank','bratwurst','brat ','kielbasa','andouille','smoked sausage','italian sausage','summer sausage','cheddar brat'],
    bacon:     ['bacon strips','bacon slices','uncured bacon','turkey bacon','canadian bacon','center cut bacon','thick cut bacon','hardwood smoked bacon'],
    pork:      ['pork chop','pork tenderloin','pork loin','baby back rib','spare rib','pork shoulder','pork butt','pork steak','country style rib'],
    lunch:     ['deli fresh','lunch meat','oven roasted turkey','honey ham','black forest ham','honey turkey','smoked turkey breast','roast beef sliced','bologna','genoa salami','hard salami','pepperoni sliced','pastrami','corned beef','prosciutto','mortadella','virginia ham'],
    breakfast_sausage: ['breakfast sausage','sausage patty','sausage link','morning sausage','pork sausage roll','sage sausage'],
    plant:     ['beyond burger','impossible burger','veggie burger','plant based burger','meatless burger','morningstar farms','gardein'],
    frozen_burgers: ['frozen beef patty','frozen burger patty','bubba burger','angus patty frozen'],
  },
  frozen: {
    pizza:     ['frozen pizza','rising crust pizza','thin crust pizza','stuffed crust pizza','pepperoni pizza frozen','cheese pizza frozen'],
    meals:     ['frozen lasagna','chicken pot pie frozen','frozen mac cheese','frozen entree','frozen dinner','stouffer','lean cuisine','healthy choice frozen','banquet meal','swanson frozen','marie callender frozen','frozen bowl','power bowl frozen'],
    breakfast: ['frozen waffle','eggo waffle','french toast stick','frozen breakfast sandwich','frozen breakfast burrito','frozen breakfast bowl','frozen pancake'],
    veggies:   ['frozen broccoli','frozen peas','frozen corn','frozen spinach','frozen green bean','frozen mixed vegetable','edamame','riced cauliflower frozen','frozen vegetable steamers'],
    fries:     ['french fries','frozen fries','tater tot','hash brown frozen','potato wedge frozen','ore-ida','alexia fry','onion ring frozen','waffle fry','steak fry','shoestring fry','sweet potato fry'],
    chicken:   ['chicken nugget','chicken strip frozen','chicken tender frozen','popcorn chicken','chicken finger','frozen chicken bite'],
    seafood_f: ['fish stick','gorton','seapak','frozen shrimp','frozen fish fillet','crab cake frozen','frozen scallop'],
    ice_cream: ['ice cream','frozen yogurt','gelato','sorbet','popsicle','fudgsicle','klondike bar','drumstick cone','creamsicle','ice cream bar','ice cream sandwich','ice cream novelty'],
    hot_pockets: ['hot pocket','pizza roll','frozen taquito','frozen egg roll','frozen appetizer'],
  },
  snacks: {
    potato_chips: ['potato chip','lays chip','ruffles chip','pringles','kettle chip','cape cod chip','utz chip','wavy chip','ridged chip'],
    tortilla:  ['tortilla chip','doritos','tostitos','nacho chip','corn chip','scoops'],
    crackers:  ['ritz cracker','wheat thins','triscuit','goldfish crackers','cheez-it','saltine','graham cracker','club cracker','keebler cracker','animal cracker'],
    popcorn:   ['popcorn','microwave popcorn','kettle corn','popcorn bag','popcorn kernels'],
    pretzels:  ['pretzel','pretzel stick','pretzel nugget','pretzel rod','pretzel twist'],
    nuts:      ['mixed nuts','dry roasted peanut','honey roasted peanut','roasted almond','cashew','walnut','pecan','trail mix','pistachio','macadamia'],
    bars:      ['granola bar','protein bar','nature valley bar','kind bar','clif bar','rxbar','larabar','fiber one bar','nutri grain bar','chewy bar'],
    cheese_snacks: ['cheetos','cheese puff','cheese curl','pirate booty','cheese doodle'],
    dips:      ['salsa','guacamole','hummus','french onion dip','queso dip','spinach dip'],
  },
  breakfast: {
    cereal:    ['cereal','cheerios','frosted flakes','corn flakes','raisin bran','special k','lucky charms','cocoa puffs','froot loops','cap n crunch','cinnamon toast crunch','honey bunches','grape nuts','life cereal','wheaties'],
    oatmeal:   ['oatmeal','rolled oats','instant oatmeal','steel cut oats','quick oats','overnight oats','grits','cream of wheat'],
    pancakes:  ['pancake mix','waffle mix','bisquick','aunt jemima','hungry jack','krusteaz','pancake syrup','maple syrup','log cabin syrup'],
    pastries:  ['pop tart','toaster pastry','nutri grain bar','toaster strudel','breakfast bar'],
    granola:   ['granola cereal','muesli','granola cluster','kashi granola'],
    sausage:   ['breakfast sausage','sausage patty breakfast','jimmy dean sausage','bob evans sausage','banquet sausage'],
  },
  alcohol: {
    light_beer:  ['bud light','coors light','miller lite','michelob ultra','natural light','busch light','keystone light','pabst blue ribbon light'],
    regular_beer:['budweiser ','coors banquet','miller high life','pabst blue ribbon','hamm','rolling rock','genesee'],
    import_beer: ['corona','heineken','modelo','dos equis','stella artois','guinness','peroni','newcastle','pacifico','carlsberg'],
    craft_beer:  ['samuel adams','blue moon','sierra nevada','lagunitas','goose island','dogfish head','new belgium','fat tire','bell\'s','founders','craft ipa','pale ale','amber ale','wheat beer','hefeweizen','porter','stout'],
    seltzer:     ['hard seltzer','white claw','truly hard','bud light seltzer','high noon seltzer','vizzy seltzer','truly lemonade'],
    wine_red:    ['cabernet sauvignon','merlot wine','pinot noir','red blend wine','shiraz','malbec','zinfandel red','chianti'],
    wine_white:  ['chardonnay','pinot grigio','sauvignon blanc','riesling','prosecco','champagne','moscato','rose wine','white zinfandel'],
  },
};

function getSubcategoryKeys(productName, brandName, aisleKey) {
  const rules = SUBCATEGORY_RULES[aisleKey];
  if (!rules) return [];
  const text = `${productName} ${brandName}`.toLowerCase();
  const matches = [];
  for (const [subkey, keywords] of Object.entries(rules)) {
    if (keywords.some(k => text.includes(k.toLowerCase()))) matches.push(subkey);
  }
  return matches;
}

// ─── Layer 2: Cross-aisle placement rules ────────────────────────────────────

const CROSS_AISLE_RULES = [
  { keywords: ['breakfast sausage','sausage patty','sausage link','morning sausage','pork sausage roll','sage sausage'], primary: 'meat', also: ['breakfast'] },
  { keywords: ['bacon strips','bacon slices','turkey bacon','center cut bacon'], primary: 'meat', also: ['breakfast'] },
  { keywords: ['cream cheese'], primary: 'cheese', also: ['eggs_dairy'] },
  { keywords: ['coffee creamer','liquid creamer','powder creamer','half and half creamer'], primary: 'eggs_dairy', also: ['beverages'] },
  { keywords: ['granola bar','nature valley bar','kind bar','clif bar','chewy bar','nutri grain'], primary: 'snacks', also: ['breakfast'] },
  { keywords: ['lunchable'], primary: 'deli', also: ['snacks'] },
  { keywords: ['frozen waffle','eggo waffle','french toast stick','frozen breakfast sandwich','frozen breakfast burrito','frozen breakfast bowl'], primary: 'frozen', also: ['breakfast'] },
  { keywords: ['canned soup','chicken noodle soup','tomato soup','cream of mushroom'], primary: 'canned', also: ['packaged_meals'] },
  { keywords: ['protein bar','rxbar','quest bar','power bar'], primary: 'snacks', also: ['health'] },
  { keywords: ['baby formula','infant formula','similac','enfamil'], primary: 'baby', also: ['eggs_dairy'] },
  { keywords: ['instant oatmeal','quick oats packet'], primary: 'breakfast', also: ['packaged_meals'] },
  { keywords: ['hot dog','beef frank','pork frank'], primary: 'meat', also: ['deli'] },
  { keywords: ['deli sliced cheese','american cheese slices','swiss cheese slices','provolone slices'], primary: 'cheese', also: ['deli'] },
];

function getCrossAisleKeys(productName, brandName) {
  const text = `${productName} ${brandName}`.toLowerCase();
  const alsoIn = [];
  for (const rule of CROSS_AISLE_RULES) {
    if (rule.keywords.some(k => text.includes(k.toLowerCase()))) alsoIn.push(...rule.also);
  }
  return [...new Set(alsoIn)];
}

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

function getKrogerImage(p) {
  if (!p.images?.length) return null;
  const front = p.images.find(i => i.perspective === 'front') || p.images[0];
  return front?.sizes?.find(s => s.size === 'medium')?.url || front?.sizes?.[0]?.url || null;
}

async function fetchKrogerProducts(token, locationId, term, maxPages = 3) {
  const all = [];
  for (let page = 0; page < maxPages; page++) {
    try {
      const q = new URLSearchParams({
        'filter.term': term, 'filter.locationId': locationId,
        'filter.limit': '50', 'filter.start': String(page * 50),
        'filter.fulfillment': 'ais',
      });
      const r = await fetch(`${KROGER_BASE}/products?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) break;
      const d = await r.json();
      const products = d.data || [];
      all.push(...products.map(p => {
        const item = p.items?.[0];
        const rawName = titleCase(p.description || '');
        const brand = extractBrand(rawName, titleCase(p.brand || ''));
        return {
          name: rawName, brand,
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
  const endpoints = [
    `https://www.walmart.com/search/api/preso?query=${encodeURIComponent(term)}&cat_id=0`,
    `https://www.walmart.com/search?q=${encodeURIComponent(term)}&affinityOverride=default`,
  ];
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!r.ok) continue;
      const text = await r.text();
      let d;
      try { d = JSON.parse(text); } catch { continue; }
      const items = d.items || d.searchResult?.item || d.products || [];
      if (items.length > 0) {
        return items.slice(0, limit).map(item => {
          const rawName = titleCase(item.name || item.title || item.description || '');
          const brand = extractBrand(rawName, titleCase(item.brand || item.brandName || ''));
          return {
            name: rawName, brand,
            size: item.size || item.weight || '',
            price_walmart: item.price?.price ?? item.salePrice ?? item.priceInfo?.currentPrice?.price ?? null,
            image_url: item.imageInfo?.thumbnailUrl || item.largeImage || item.mediumImage || item.image || null,
            walmart_id: String(item.usItemId || item.itemId || item.productId || ''),
            upc: item.upc || '',
            source: 'walmart',
          };
        }).filter(p => p.name && p.name.length > 1);
      }
    } catch { continue; }
  }
  return [];
}

// ─── Aisle search terms ───────────────────────────────────────────────────────

const AISLE_TERMS = {
  beverages:     ['Coca-Cola Pepsi soda cans','Sprite Dr Pepper Mountain Dew 7UP','Gatorade Powerade sports drink','water sparkling LaCroix seltzer bubly','orange juice apple juice tropicana','cranberry juice welchs grape juice','Red Bull Monster energy drink celsius','iced coffee tea lipton snapple','almond milk oat milk silk oatly'],
  meat:          ['chicken breast boneless skinless','chicken thighs drumsticks wings','ground beef 80 20 hamburger','beef steak ribeye sirloin','Oscar Mayer hot dogs beef franks','Johnsonville sausage bratwurst brats','bacon smoked strips thick cut','oven roasted turkey breast deli','honey ham black forest ham deli','pepperoni salami bologna lunch meat','Beyond Meat Impossible veggie burger','frozen beef patties burgers','pork chops tenderloin ribs baby back','breakfast sausage Jimmy Dean Bob Evans'],
  seafood:       ['salmon fillet fresh Atlantic','shrimp frozen cooked raw','tilapia cod fish fillet','canned tuna Bumble Bee StarKist albacore','Gortons fish sticks frozen','SeaPak popcorn shrimp scampi'],
  eggs_dairy:    ['whole milk gallon 2%','eggs large dozen free range','butter Land O Lakes salted unsalted','kerrygold butter Irish','heavy whipping cream half half','sour cream Daisy Breakstones','coffee creamer International Delight','almond milk oat milk Silk Oatly Califia','Fairlife ultra filtered milk','chocolate milk','Lactaid lactose free milk'],
  cheese:        ['cheddar cheese sliced block','mozzarella shredded part skim','Kraft American Swiss sliced singles','Sargento cheddar sliced','Tillamook medium cheddar','parmesan shredded grated','feta cheese crumbles','cream cheese Philadelphia','brie gouda specialty cheese','pepper jack colby jack','cottage cheese ricotta'],
  frozen:        ['DiGiorno frozen pizza rising crust','Red Baron Tombstone frozen pizza','Stouffers lasagna frozen meals','Healthy Choice Lean Cuisine frozen','Jimmy Dean frozen breakfast sandwich','Eggo waffles frozen buttermilk','Birds Eye frozen broccoli vegetables','Ore-Ida french fries golden','Ore-Ida tater tots','frozen hash browns shredded','Ben Jerrys ice cream pints','Breyers Dreyers ice cream','Klondike bars ice cream novelty','frozen chicken nuggets Tyson','Hot Pockets pepperoni pizza','frozen fish sticks Gortons'],
  bread:         ['white sandwich bread Wonder','wheat bread Natures Own','Dave Killer Bread 21 grains','Sara Lee honey wheat bread','Pepperidge Farm Farmhouse bread','Arnold whole grain bread','hamburger buns potato rolls','hot dog buns ball park','Kings Hawaiian sweet rolls slider buns','dinner rolls sister schubert','bagels everything plain Thomas','Thomas English muffins original','flour tortillas Mission large','corn tortillas La Banderita','sourdough bread loaf','gluten free bread Udis Canyon','pita bread naan flatbread'],
  snacks:        ['Lays classic potato chips','Ruffles original chips','Pringles original sour cream','Doritos nacho cheese cool ranch','Cheetos crunchy puffs','Tostitos tortilla chips scoops','Ritz crackers original','Wheat Thins original cracker','Goldfish cheddar crackers','Cheez-It original white cheddar','SkinnyPop original popcorn','Orville Redenbacher microwave popcorn','Snyders pretzels honey mustard','Nature Valley oats honey granola bar','Kind dark chocolate nuts bar','Clif bar chocolate chip','Planters mixed nuts salted','Blue Diamond almonds roasted','trail mix nuts dried fruit'],
  breakfast:     ['Cheerios original honey nut','Frosted Flakes Kelloggs corn flakes','Cinnamon Toast Crunch Lucky Charms','Raisin Bran original Special K','Quaker old fashioned oats','instant oatmeal maple brown sugar','Bisquick pancake mix original','Aunt Jemima complete pancake mix','Pop Tarts strawberry frosted','Nutri Grain strawberry bar','Log Cabin original maple syrup','Jimmy Dean original sausage roll','Bob Evans original sausage','breakfast sausage links patties'],
  canned:        ['Campbells tomato soup','Campbells chicken noodle soup','Progresso traditional soup','Hunts diced tomatoes','Del Monte whole kernel corn','Bush baked beans original','Goya black beans','StarKist tuna albacore','Bumble Bee chunk light tuna','Prego marinara pasta sauce','Ragu old world sauce','Swanson chicken broth stock','Pacific organic chicken broth'],
  cookies:       ['Oreo original double stuf','Chips Ahoy chocolate chip','Pepperidge Farm Milano','Keebler chips deluxe','Nutter Butter peanut butter','Famous Amos chocolate chip'],
  candy:         ['Reeses peanut butter cups','Hersheys milk chocolate bar kisses','Snickers Twix Kit Kat bars','M&Ms milk chocolate peanut','Skittles original fruit','Starburst original fruit chews','Sour Patch Kids original','Haribo gold bears gummy'],
  deli:          ['Oscar Mayer deli fresh oven roasted turkey','Oscar Mayer deli fresh honey ham','Hillshire Farm oven roasted turkey','Boars Head ovengold turkey','Applegate natural turkey breast','salami pepperoni sliced deli','roast beef pastrami corned beef deli'],
  yogurt:        ['Chobani plain Greek yogurt','Chobani strawberry blueberry Greek','Fage total plain Greek','Oikos triple zero vanilla','Yoplait original strawberry','Dannon light fit vanilla','Siggi plain Icelandic skyr','Stonyfield organic whole milk'],
  personal_care: ['Pantene shampoo moisture renew','Head Shoulders classic clean shampoo','Dove moisturizing body wash','Old Spice swagger body wash','Gillette Mach3 fusion razor','Colgate total whitening toothpaste','Crest complete whitening toothpaste','Listerine original antiseptic mouthwash','Old Spice high endurance deodorant'],
  cleaning:      ['Tide original liquid laundry detergent','Tide pods original scent','Gain original liquid detergent','Downy April fresh fabric softener','Dawn original dish soap platinum','Cascade complete dishwasher pods','Lysol original disinfecting spray','Clorox disinfecting wipes fresh scent','Bounty select a size paper towels','Charmin ultra soft toilet paper','Glad forceflex trash bags'],
  health:        ['Tylenol extra strength acetaminophen','Advil ibuprofen 200mg','Aleve naproxen sodium','Nyquil cold flu nighttime','Mucinex expectorant','Claritin non drowsy allergy','Zyrtec allergy 24 hour','Centrum adults multivitamin','One A Day womens mens vitamins','Pepto Bismol original liquid','Tums extra strength antacid'],
  baby:          ['Pampers swaddlers diapers size 1 2 3','Huggies little snugglers diapers','baby wipes sensitive Pampers Huggies','Similac advance infant formula','Enfamil NeuroPro infant formula','Gerber 1st foods sweet potato','Johnson head to toe baby wash'],
  pet:           ['Purina One smartblend chicken dog food','Pedigree adult chicken rice dog food','Blue Buffalo life protection dog food','Fancy Feast classic pate cat food','Friskies shreds chicken cat food','Meow Mix original cat food','Milk Bone original dog biscuits','Greenies dental treats dog','Tidy Cats 24/7 clumping litter'],
  alcohol:       ['Bud Light beer cans 12 pack 18 pack','Coors Light 12pk cans','Miller Lite 12pk cans','Michelob Ultra 12pk','Corona Extra bottles 12pk','Heineken original 12pk','Modelo Especial 12pk','Samuel Adams Boston Lager','Blue Moon Belgian White','White Claw hard seltzer variety','Truly hard seltzer lemonade','Barefoot Cabernet Sauvignon wine','Kim Crawford Sauvignon Blanc','Woodbridge Chardonnay'],
  packaged_meals:['Kraft macaroni cheese original','Annie\'s white cheddar mac cheese','Barilla spaghetti penne pasta','Uncle Bens original long grain rice','Minute Rice white instant','Maruchan ramen chicken beef shrimp','Hamburger Helper cheeseburger macaroni','Rice A Roni chicken flavor'],
  condiments:    ['Heinz tomato ketchup 32oz','French\'s classic yellow mustard','Hellmanns real mayonnaise','Hidden Valley original ranch dressing','Sweet Baby Rays original BBQ sauce','Tabasco original red sauce','Frank\'s RedHot original sauce','Kikkoman soy sauce teriyaki','Vlasic kosher dill pickles'],
};

// ─── Merge Kroger + Walmart ───────────────────────────────────────────────────

function mergeProducts(krogerList, walmartList) {
  const seen = new Set();
  const all = [];
  for (const p of [...krogerList, ...walmartList]) {
    const key = p.upc || p.kroger_id || p.walmart_id || p.name.toLowerCase().trim();
    if (key && !seen.has(key) && p.name.length > 1) { seen.add(key); all.push(p); }
  }
  return all;
}

// ─── Brand hierarchy builder ──────────────────────────────────────────────────

const BRAND_PRIORITY = {
  beverages:   ['Coca-Cola','Pepsi','Diet Coke','Sprite','Mountain Dew','Dr Pepper','7UP','Gatorade','Powerade','Dasani','Aquafina','Smartwater','Red Bull','Monster','Celsius','Tropicana','Minute Maid','Simply','Lipton','Snapple','AriZona','Capri Sun','LaCroix','Bubly'],
  meat:        ['Tyson','Perdue','Oscar Mayer','Hillshire Farm','Ball Park',"Nathan's","Hebrew National",'Johnsonville','Smithfield','Hormel','Jimmy Dean','Bob Evans','Applegate',"Boar's Head","Land O'Frost"],
  frozen:      ['DiGiorno','Red Baron','Tombstone',"Totino's","Stouffer's",'Healthy Choice','Lean Cuisine','Eggo','Ore-Ida',"Bird's Eye",'Green Giant','Amy\'s',"Ben & Jerry's",'Breyers',"Dreyer's",'Klondike'],
  snacks:      ["Lay's",'Ruffles','Pringles','Doritos','Cheetos','Fritos','Tostitos','Ritz','Goldfish','SkinnyPop',"Orville Redenbacher",'Nature Valley','Kind','Clif','Planters'],
  breakfast:   ["Kellogg's",'General Mills','Quaker','Post','Cheerios',"Jimmy Dean",'Eggo','Bisquick',"Nature's Own"],
  alcohol:     ['Bud Light','Coors Light','Miller Lite','Michelob Ultra','Corona','Heineken','Modelo','White Claw','Truly','Budweiser','Blue Moon','Samuel Adams'],
  cheese:      ['Kraft','Sargento','Tillamook','Cabot','Cracker Barrel','Philadelphia','Velveeta','Babybel'],
  eggs_dairy:  ["Land O'Lakes",'Kerrygold','Horizon','Organic Valley','Fairlife','Daisy'],
  bread:       ["Dave's Killer Bread","Nature's Own","King's Hawaiian","Pepperidge Farm","Arnold","Sara Lee","Thomas'"],
};

function getBrandPriority(brand, aisleKey) {
  const list = BRAND_PRIORITY[aisleKey] || [];
  const b = brand.toLowerCase();
  const idx = list.findIndex(p =>
    b.includes(p.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,6)) ||
    p.toLowerCase().includes(b.split(' ')[0])
  );
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
        .replace(/\s+\d+[\s.]?\d*\s*(oz|fl oz|lb|lbs|ct|pk|pack|count|g|ml|l|gal|gallon|liter)\b.*/i, '')
        .replace(/\s+(family size|large|mega|king size|mini|snack size|value pack|twin pack|variety pack)\b.*/i, '')
        .trim();
      if (!familyMap[base]) familyMap[base] = { name: base, brand, imageUrl: null, price: null, variants: [] };
      const fam = familyMap[base];
      const imgUrl = p.image_url || p.imageUrl || null;
      if (imgUrl && !fam.imageUrl) fam.imageUrl = imgUrl;
      const price = p.price_kroger || p.price_walmart || p.price || null;
      if (price !== null && (fam.price === null || price < fam.price)) fam.price = price;
      fam.variants.push({
        id: p.kroger_id || p.walmart_id || '',
        name: p.name, size: p.size, price,
        imageUrl: imgUrl, inStock: price !== null,
        source: p.source,
        subcategoryKeys: p.subcategoryKeys || [],
        crossAisleKeys: p.crossAisleKeys || [],
      });
    }
    const families = Object.values(familyMap).map(f => ({
      ...f,
      variants: f.variants.sort((a, b) => (a.price ?? 999) - (b.price ?? 999)),
    }));
    families.sort((a, b) => a.name.localeCompare(b.name));
    return {
      brand, productCount: prods.length,
      imageUrl: prods.find(p => p.image_url || p.imageUrl)?.image_url
        || prods.find(p => p.imageUrl)?.imageUrl || null,
      products: families,
    };
  });
  brands.sort((a, b) => {
    const pa = getBrandPriority(a.brand, aisleKey);
    const pb = getBrandPriority(b.brand, aisleKey);
    return pa !== pb ? pa - pb : a.brand.localeCompare(b.brand);
  });
  return brands;
}

// ─── Save products to library ─────────────────────────────────────────────────

async function saveProductsToLibrary(base44, products, aisleKey) {
  const batches = [];
  for (let i = 0; i < products.length; i += 8) batches.push(products.slice(i, i + 8));
  let saved = 0;
  for (const batch of batches) {
    await Promise.all(batch.map(async p => {
      try {
        const existing = await base44.entities.ProductLibrary.filter({ name: p.name }).catch(() => []);
        const crossAisle = getCrossAisleKeys(p.name, p.brand || '');
        const subcatKeys = getSubcategoryKeys(p.name, p.brand || '', aisleKey);
        if (existing.length === 0) {
          await base44.entities.ProductLibrary.create({
            name: p.name, brand: p.brand || '',
            aisle_key: aisleKey,
            category_key: subcatKeys[0] || '',
            also_in_categories: subcatKeys.slice(1),
            also_in_aisles: crossAisle,
            size: p.size || '',
            image_url: p.image_url || p.imageUrl || '',
            price_kroger: p.price_kroger || null,
            price_walmart: p.price_walmart || null,
            kroger_id: p.kroger_id || '',
            walmart_id: p.walmart_id || '',
            upc: p.upc || '',
            times_added: 0, times_viewed: 0,
            last_seen: new Date().toISOString(),
            source: p.source || 'api',
          });
          saved++;
        } else {
          const updates = { last_seen: new Date().toISOString() };
          if (p.price_kroger) updates.price_kroger = p.price_kroger;
          if (p.price_walmart) updates.price_walmart = p.price_walmart;
          if ((p.image_url || p.imageUrl) && !existing[0].image_url)
            updates.image_url = p.image_url || p.imageUrl;
          if (crossAisle.length > 0 && !existing[0].also_in_aisles?.length)
            updates.also_in_aisles = crossAisle;
          await base44.entities.ProductLibrary.update(existing[0].id, updates).catch(() => {});
        }
      } catch {}
    }));
  }
  return saved;
}

// ─── Log behavior + real-time counter increment ───────────────────────────────

async function logBehavior(base44, userId, action, data) {
  try {
    await base44.entities.UserBehaviorLog.create({
      user_id: userId, action,
      aisle_key: data.aisle_key || '',
      category_key: data.category_key || '',
      brand: data.brand || '',
      product_name: data.product_name || '',
      session_id: data.session_id || '',
      created_at: new Date().toISOString(),
    });
    if (action === 'add' && data.product_name) {
      const existing = await base44.entities.ProductLibrary.filter({ name: data.product_name }).catch(() => []);
      if (existing.length > 0) {
        await base44.entities.ProductLibrary.update(existing[0].id, {
          times_added: (existing[0].times_added || 0) + 1,
          last_seen: new Date().toISOString(),
        }).catch(() => {});
      }
    }
    if (action === 'view' && data.product_name) {
      const existing = await base44.entities.ProductLibrary.filter({ name: data.product_name }).catch(() => []);
      if (existing.length > 0) {
        await base44.entities.ProductLibrary.update(existing[0].id, {
          times_viewed: (existing[0].times_viewed || 0) + 1,
        }).catch(() => {});
      }
    }
  } catch {}
}

// ─── Nightly profile rebuild ──────────────────────────────────────────────────

async function rebuildProfiles(base44, aisleKey) {
  try {
    const [logs, products] = await Promise.all([
      base44.entities.UserBehaviorLog.filter({ aisle_key: aisleKey }).catch(() => []),
      base44.entities.ProductLibrary.filter({ aisle_key: aisleKey }).catch(() => []),
    ]);
    const brandScores = {};
    for (const log of logs) {
      if (!log.brand) continue;
      if (!brandScores[log.brand]) brandScores[log.brand] = 0;
      if (log.action === 'add')    brandScores[log.brand] += 3;
      if (log.action === 'view')   brandScores[log.brand] += 1;
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
        .sort((a, b) => ((b.times_added || 0) * 3 + (b.times_viewed || 0)) -
                        ((a.times_added || 0) * 3 + (a.times_viewed || 0)))
        .slice(0, 5).map(p => p.name);
      const existing = await base44.entities.BrandProfile
        .filter({ brand_name: brand, aisle_key: aisleKey }).catch(() => []);
      const profileData = {
        brand_name: brand, aisle_key: aisleKey,
        popularity_score: brandScores[brand] || 0,
        product_count: prods.length,
        image_url: prods.find(p => p.image_url)?.image_url || '',
        top_products: topProducts,
        related_brands: [],
      };
      if (existing.length === 0) {
        await base44.entities.BrandProfile.create(profileData).catch(() => {});
      } else {
        await base44.entities.BrandProfile.update(existing[0].id, profileData).catch(() => {});
      }
      profileCount++;
    }
    await base44.entities.AisleProfile.filter({ aisle_key: aisleKey }).then(async existing => {
      const topBrands = Object.entries(brandScores)
        .sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);
      const data = {
        aisle_key: aisleKey, product_count: products.length,
        featured_brands: topBrands, last_updated: new Date().toISOString(),
      };
      if (existing.length === 0) {
        await base44.entities.AisleProfile.create(data).catch(() => {});
      } else {
        await base44.entities.AisleProfile.update(existing[0].id, data).catch(() => {});
      }
    }).catch(() => {});
    return { profiles: profileCount, aisleKey, products: products.length };
  } catch (err) { return { error: err.message }; }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user   = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { mode, term, aisle_key, zip_code, product, action, log_data } = body;

  // ── BROWSE ──────────────────────────────────────────────────────────────────
  if (mode === 'browse') {
    if (!aisle_key || !zip_code) return Response.json({ error: 'aisle_key and zip_code required' }, { status: 400 });
    try {
      const terms = AISLE_TERMS[aisle_key] || [aisle_key];
      const krogerToken = await getKrogerToken();
      const krogerLocId = krogerToken ? await getKrogerLocationId(krogerToken, zip_code) : null;

      const [libraryProducts, krogerResults, walmartResults] = await Promise.all([
        base44.entities.ProductLibrary.filter({ aisle_key }).catch(() => []),
        krogerLocId ? Promise.all(
          terms.slice(0, 5).map(t => fetchKrogerProducts(krogerToken, krogerLocId, t, 3).catch(() => []))
        ).then(r => r.flat()) : Promise.resolve([]),
        Promise.all(
          terms.slice(0, 4).map(t => fetchWalmartProducts(t, 30).catch(() => []))
        ).then(r => r.flat()),
      ]);

      const apiProducts = mergeProducts(krogerResults, walmartResults);
      const enriched = apiProducts.map(p => ({
        ...p,
        subcategoryKeys: getSubcategoryKeys(p.name, p.brand || '', aisle_key),
        crossAisleKeys:  getCrossAisleKeys(p.name, p.brand || ''),
      }));

      const crossAisleFromLibrary = await base44.entities.ProductLibrary
        .filter({ also_in_aisles__contains: aisle_key }).catch(() => []);

      const libraryNames = new Set(libraryProducts.map(p => p.name.toLowerCase()));
      const newFromApi = enriched.filter(p => !libraryNames.has(p.name.toLowerCase()));

      const allProducts = [
        ...libraryProducts.map(p => ({
          ...p, imageUrl: p.image_url,
          subcategoryKeys: [p.category_key, ...(p.also_in_categories || [])].filter(Boolean),
          crossAisleKeys:  p.also_in_aisles || [],
          price: p.price_kroger || p.price_walmart,
        })),
        ...crossAisleFromLibrary
          .filter(p => !libraryNames.has(p.name.toLowerCase()))
          .map(p => ({ ...p, imageUrl: p.image_url, price: p.price_kroger || p.price_walmart })),
        ...newFromApi,
      ];

      if (newFromApi.length > 0) saveProductsToLibrary(base44, newFromApi, aisle_key).catch(() => {});
      logBehavior(base44, user.id, 'browse', { aisle_key }).catch(() => {});

      const brands = buildHierarchy(allProducts, aisle_key);

      return Response.json({
        products: allProducts, brands,
        count: allProducts.length, brandCount: brands.length,
        fromLibrary: libraryProducts.length, fromApi: newFromApi.length,
        fromCrossAisle: crossAisleFromLibrary.length,
        aisle_key,
      });
    } catch (err) {
      return Response.json({ error: err.message, products: [], brands: [] }, { status: 500 });
    }
  }

  // ── SEARCH ──────────────────────────────────────────────────────────────────
  if (mode === 'search') {
    if (!term) return Response.json({ error: 'term required' }, { status: 400 });
    try {
      const libraryResults = await base44.entities.ProductLibrary
        .filter({ name__icontains: term }).catch(() => []);

      if (libraryResults.length >= 15) {
        logBehavior(base44, user.id, 'search', { product_name: term, aisle_key: aisle_key || '' }).catch(() => {});
        return Response.json({
          products: libraryResults.map(p => ({ ...p, imageUrl: p.image_url, price: p.price_kroger || p.price_walmart })),
          source: 'library', count: libraryResults.length,
        });
      }

      const krogerToken = await getKrogerToken();
      const krogerLocId = krogerToken ? await getKrogerLocationId(krogerToken, zip_code || '10001') : null;

      const [kroger, walmart] = await Promise.all([
        krogerLocId ? fetchKrogerProducts(krogerToken, krogerLocId, term, 2).catch(() => []) : Promise.resolve([]),
        fetchWalmartProducts(term, 20).catch(() => []),
      ]);

      const merged = mergeProducts(kroger, walmart).map(p => ({
        ...p, imageUrl: p.image_url || p.imageUrl,
        price: p.price_kroger || p.price_walmart,
      }));

      const libNames = new Set(libraryResults.map(p => p.name.toLowerCase()));
      const newProds = merged.filter(p => !libNames.has(p.name.toLowerCase()));
      if (newProds.length > 0) saveProductsToLibrary(base44, newProds, aisle_key || '').catch(() => {});

      logBehavior(base44, user.id, 'search', { product_name: term, aisle_key: aisle_key || '' }).catch(() => {});

      return Response.json({
        products: [...libraryResults.map(p => ({ ...p, imageUrl: p.image_url, price: p.price_kroger || p.price_walmart })), ...merged].slice(0, 30),
        source: 'mixed', count: libraryResults.length + merged.length,
      });
    } catch (err) {
      return Response.json({ error: err.message, products: [] }, { status: 500 });
    }
  }

  // ── SAVE PRODUCT ────────────────────────────────────────────────────────────
  if (mode === 'save_product') {
    if (!product?.name) return Response.json({ error: 'product.name required' }, { status: 400 });
    try {
      const crossAisle = getCrossAisleKeys(product.name, product.brand || '');
      const subcatKeys = getSubcategoryKeys(product.name, product.brand || '', product.aisle_key || aisle_key || '');
      const existing = await base44.entities.ProductLibrary.filter({ name: product.name }).catch(() => []);
      if (existing.length === 0) {
        await base44.entities.ProductLibrary.create({
          name: product.name, brand: product.brand || '',
          aisle_key: product.aisle_key || aisle_key || '',
          category_key: subcatKeys[0] || '',
          also_in_categories: subcatKeys.slice(1),
          also_in_aisles: crossAisle,
          size: product.size || '',
          image_url: product.image_url || product.imageUrl || '',
          price_kroger: product.price_kroger || product.price || null,
          price_walmart: product.price_walmart || null,
          kroger_id: product.kroger_id || '',
          walmart_id: product.walmart_id || '',
          upc: product.upc || '',
          times_added: 1, times_viewed: 0,
          last_seen: new Date().toISOString(), source: 'user',
        });
      } else {
        await base44.entities.ProductLibrary.update(existing[0].id, {
          times_added: (existing[0].times_added || 0) + 1,
          last_seen: new Date().toISOString(),
        }).catch(() => {});
      }
      logBehavior(base44, user.id, 'add', {
        product_name: product.name, brand: product.brand,
        aisle_key: product.aisle_key || aisle_key,
      }).catch(() => {});
      return Response.json({ success: true });
    } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
  }

  // ── LOG BEHAVIOR ────────────────────────────────────────────────────────────
  if (mode === 'log_behavior') {
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });
    await logBehavior(base44, user.id, action, log_data || {});
    return Response.json({ success: true });
  }

  // ── REBUILD PROFILES ────────────────────────────────────────────────────────
  if (mode === 'rebuild_profiles') {
    const aisles = aisle_key ? [aisle_key] :
      ['beverages','meat','seafood','eggs_dairy','cheese','frozen','bread','snacks',
       'breakfast','canned','cookies','candy','deli','yogurt','personal_care',
       'cleaning','health','baby','pet','alcohol','packaged_meals','condiments'];
    const results = [];
    for (const ak of aisles) results.push(await rebuildProfiles(base44, ak));
    return Response.json({ results, aislesProcessed: aisles.length });
  }

  // ── GET PROFILES ────────────────────────────────────────────────────────────
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