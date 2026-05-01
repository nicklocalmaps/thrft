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
  cereal: [
    'Cheerios Original', 'Honey Nut Cheerios', 'Multi Grain Cheerios', 'Cheerios Oat Crunch',
    'Frosted Flakes', 'Corn Flakes', 'Kelloggs Raisin Bran', 'Raisin Bran Crunch',
    'Special K Original', 'Special K Red Berries', 'Special K Protein',
    'Cocoa Puffs', 'Lucky Charms', 'Trix', 'Froot Loops', 'Apple Jacks',
    'Cap N Crunch Original', 'Cap N Crunch Crunch Berries',
    'Cinnamon Toast Crunch', 'Life Cereal', 'Grape Nuts', 'Grape Nuts Flakes',
    'Kashi GoLean', 'Kashi GoLean Crunch', 'Fiber One Original',
    'Total Whole Grain', 'Wheaties', 'Post Honey Bunches of Oats',
    'Post Grape Nuts', 'Post Raisin Bran', 'Malt O Meal Frosted Mini Wheats',
    'Kelloggs Frosted Mini Wheats', 'Kelloggs Corn Pops', 'Kelloggs Eggo Cereal',
    'General Mills Reeses Puffs', 'General Mills Cookie Crisp',
    'Quaker Life Cinnamon', 'Quaker Cap N Crunch',
    'Nature Valley Granola', 'Quaker Oatmeal Squares',
    'Barbara Peanut Butter Puffins', 'Nature Path Organic Flax Plus',
  ],
  canned: [
    'Campbells Tomato Soup', 'Campbells Chicken Noodle Soup', 'Campbells Cream of Mushroom',
    'Campbells Chunky Beef Stew', 'Campbells Chunky Chicken', 'Campbells Bean with Bacon',
    'Progresso Traditional Chicken Noodle', 'Progresso Vegetable Classics', 'Progresso Rich Hearty',
    'Amy Organic Lentil Soup', 'Pacific Foods Organic Soup',
    'Bush Baked Beans Original', 'Bush Black Beans', 'Bush Kidney Beans',
    'Goya Black Beans', 'Goya Chickpeas', 'Goya Kidney Beans',
    'Del Monte Canned Corn', 'Del Monte Green Beans', 'Del Monte Sliced Carrots',
    'Green Giant Sweet Corn', 'Green Giant Cut Green Beans',
    'Hunts Diced Tomatoes', 'Hunts Crushed Tomatoes', 'Hunts Tomato Paste',
    'Muir Glen Organic Diced Tomatoes', 'San Marzano Whole Tomatoes',
    'StarKist Albacore Tuna', 'Bumble Bee Tuna', 'Wild Planet Albacore Tuna',
    'Swanson Chicken Broth', 'Pacific Foods Chicken Broth', 'Kitchen Basics Stock',
    'Prego Traditional Pasta Sauce', 'Ragu Old World Style', 'Classico Tomato Basil',
    'Del Monte Fruit Cocktail', 'Dole Pineapple Chunks', 'Del Monte Peaches',
    'Hormel Chili No Beans', 'Wolf Brand Chili', 'Amy Organic Chili',
    'Libby Pumpkin', 'Eagle Brand Sweetened Condensed Milk',
    'Coconut Milk Thai Kitchen', 'Roland Artichoke Hearts',
  ],
  cookies: [
    'Oreo Original', 'Oreo Double Stuf', 'Oreo Golden', 'Oreo Mint', 'Oreo Thins',
    'Chips Ahoy Original', 'Chips Ahoy Chewy', 'Chips Ahoy Chunky',
    'Nutter Butter Peanut Butter', 'Nilla Wafers', 'Nilla Wafers Mini',
    'Keebler Fudge Stripes', 'Keebler E.L. Fudge', 'Keebler Sandies',
    'Pepperidge Farm Milano', 'Pepperidge Farm Chessmen', 'Pepperidge Farm Mint Milano',
    'Pepperidge Farm Brussels', 'Pepperidge Farm Goldfish Grahams',
    'Nabisco Ginger Snaps', 'Nabisco Fig Newtons', 'Nabisco Lorna Doone',
    'Famous Amos Chocolate Chip', 'Archway Oatmeal Raisin',
    'Mother Taffy Cookies', 'Biscoff Lotus Cookies',
    'Annie Homegrown Bunny Grahams', 'Back to Nature Classic Creme',
    'Enjoy Life Chocolate Chip', 'Simple Mills Almond Flour Cookies',
    'Murray Sugar Free Cookies', 'Voortman Sugar Wafers',
    'Stella Doro Anise Biscotti', 'Nonni Biscotti Original',
    'Pirouette Rolled Wafers', 'Pepperidge Farm Bordeaux',
    'Social Tea Biscuits', 'Animal Crackers Stauffer',
  ],
  candy: [
    'Reeses Peanut Butter Cups', 'Reeses Pieces', 'Reeses Miniatures',
    'Snickers Original', 'Snickers Almond', 'Snickers Fun Size',
    'M&Ms Milk Chocolate', 'M&Ms Peanut', 'M&Ms Peanut Butter', 'M&Ms Crispy',
    'Hersheys Milk Chocolate Bar', 'Hersheys Kisses', 'Hersheys Special Dark',
    'Kit Kat Original', 'Kit Kat Dark', 'Kit Kat Mint',
    'Twix Original', 'Twix White', 'Twix Peanut Butter',
    'Milky Way Original', 'Milky Way Midnight', 'Milky Way Fun Size',
    '3 Musketeers', 'Butterfinger', 'Baby Ruth', 'Whoppers', 'Mr Goodbar',
    'Skittles Original', 'Skittles Wild Berry', 'Skittles Tropical',
    'Starburst Original', 'Starburst FaveREDs', 'Starburst Sour',
    'Sour Patch Kids Original', 'Sour Patch Kids Watermelon',
    'Haribo Gold Bears Gummy', 'Haribo Sour Gold Bears',
    'Jolly Rancher Hard Candy', 'Jolly Rancher Gummies',
    'Werther Original Caramel', 'Tootsie Rolls', 'Tootsie Pops',
    'Airheads Variety Pack', 'Laffy Taffy', 'Starbursts Jelly Beans',
    'Cadbury Mini Eggs', 'Ferrero Rocher', 'Lindt Excellence Dark',
    'Ghirardelli Chocolate Squares', 'Dove Silky Smooth Chocolate',
  ],
  deli: [
    'Oscar Mayer Oven Roasted Turkey', 'Oscar Mayer Honey Ham', 'Oscar Mayer Bologna',
    'Hillshire Farm Ultra Thin Turkey', 'Hillshire Farm Honey Ham',
    'Boars Head Ovengold Turkey', 'Boars Head Deluxe Ham', 'Boars Head Roast Beef',
    'Applegate Natural Turkey', 'Applegate Natural Ham',
    'Land O Frost Premium Turkey', 'Land O Frost Premium Ham',
    'Sara Lee Honey Roasted Turkey', 'Sara Lee Honey Ham',
    'Hormel Natural Choice Turkey', 'Hormel Natural Choice Ham',
    'Columbus Sliced Salami', 'Dietz Watson Salami',
    'Oscar Mayer Hard Salami', 'Hormel Pepperoni Slices',
    'Bridgford Beef Jerky', 'Jack Links Beef Jerky Original',
    'Slim Jim Original', 'Old Wisconsin Sausage Snack Sticks',
    'Kraft Singles American Cheese', 'Kraft Singles Swiss',
    'Sargento Deli Style Sliced Provolone', 'Sargento Ultra Thin Cheddar',
    'Boars Head American Cheese', 'Boars Head Swiss Cheese',
    'Tillamook Medium Cheddar Slices', 'Cabot Sharp Cheddar Slices',
  ],
  yogurt: [
    'Chobani Plain Greek Yogurt', 'Chobani Vanilla Greek', 'Chobani Strawberry Greek',
    'Chobani Blueberry Greek', 'Chobani Peach Greek', 'Chobani Flip',
    'Chobani Less Sugar Greek', 'Chobani Zero Sugar',
    'Fage Total 0% Plain', 'Fage Total 2% Plain', 'Fage Total 5% Plain',
    'Oikos Triple Zero Vanilla', 'Oikos Pro', 'Oikos Plain Greek',
    'Dannon Activia Strawberry', 'Dannon Activia Vanilla', 'Dannon Light Fit',
    'Yoplait Original Strawberry', 'Yoplait Original Blueberry', 'Yoplait Greek 100',
    'Siggi Vanilla', 'Siggi Strawberry', 'Siggi Plain',
    'Stonyfield Organic Plain', 'Stonyfield Organic Strawberry',
    'Nancy Organic Plain Whole Milk', 'Wallaby Organic Greek',
    'Kite Hill Almond Milk Yogurt', 'Silk Almond Milk Yogurt',
    'So Delicious Coconut Milk Yogurt', 'Coconut Collaborative Yogurt',
    'Ratio Protein Yogurt', 'Two Good Greek Yogurt',
    'YQ by Yoplait Plain', 'Noosa Honey Yoghurt', 'Noosa Strawberry Rhubarb',
    'Icelandic Provisions Skyr', 'Smari Organic Iceland Skyr',
  ],
  bread: [
    'Wonder Classic White Bread', 'Wonder Whole Wheat Bread',
    "Nature's Own Honey Wheat", "Nature's Own White Bread", "Nature's Own 100% Whole Wheat",
    'Daves Killer Bread 21 Whole Grains', 'Daves Killer Bread White Done Right',
    'Daves Killer Bread Thin Sliced', 'Daves Killer Bread Powerseed',
    'Sara Lee Classic White', 'Sara Lee Honey Wheat', 'Sara Lee Delightful Wheat',
    'Pepperidge Farm Farmhouse White', 'Pepperidge Farm Whole Grain',
    'Arnold Country White', 'Arnold Whole Grains 12 Grain',
    'Oroweat Whole Grains', 'Brownberry Whole Grains',
    'Thomas English Muffins Original', 'Thomas English Muffins Whole Wheat',
    'Thomas Bagels Plain', 'Thomas Bagels Everything', 'Thomas Bagels Cinnamon Raisin',
    'Lenders Bagels Plain', 'Lenders Bagels Blueberry',
    'Kings Hawaiian Rolls', 'Pepperidge Farm Dinner Rolls',
    'Mission Flour Tortillas', 'Mission Whole Wheat Tortillas', 'Old El Paso Tortillas',
    'La Tortilla Factory Tortillas', 'Siete Almond Flour Tortillas',
    'Udi Gluten Free Bread', 'Canyon Bakehouse Gluten Free',
    'Ezekiel 4:9 Sprouted Grain Bread', 'Alvarado Street Sprouted Wheat',
    'Pepperidge Farm Sourdough', 'La Brea Bakery Sourdough',
    'Naan Bread Stonefire', 'Flatout Flatbread', 'Josephs Pita Bread',
  ],
  eggs_dairy: [
    'Great Value Large White Eggs', 'Egglands Best Large Eggs', 'Happy Egg Free Range',
    'Vital Farms Pasture Raised Eggs', 'Pete Lisa Free Range Eggs',
    'Land O Lakes Whole Milk', 'Horizons Organic Whole Milk', 'Fairlife Whole Milk',
    'Lactaid Whole Milk', 'Organic Valley Whole Milk', 'Strauss Family Creamery',
    'Silk Oat Yeah Oatmilk', 'Oatly Oatmilk Full Fat', 'Planet Oat Oatmilk',
    'Silk Almond Original', 'Silk Cashew Milk', 'Ripple Pea Milk',
    'Land O Lakes Unsalted Butter', 'Land O Lakes Salted Butter',
    'Kerrygold Pure Irish Butter', 'Tillamook Unsalted Butter',
    'Organic Valley Butter', 'Challenge Butter',
    'Philadelphia Original Cream Cheese', 'Philadelphia Reduced Fat',
    'Daisy Sour Cream', 'Breakstone Sour Cream', 'Tillamook Sour Cream',
    'Hood Heavy Whipping Cream', 'Horizon Organic Heavy Cream',
    'International Delight Coffee Creamer', 'Coffee Mate Original',
    'Coffee Mate Natural Bliss', 'Califia Almond Creamer',
    'Tropicana Original Orange Juice', 'Simply Orange', 'Floridas Natural OJ',
    'Minute Maid Orange Juice', 'Bolthouse Farms Orange Juice',
  ],
  cheese: [
    'Kraft Sharp Cheddar Block', 'Kraft Mild Cheddar Block', 'Kraft Colby Jack',
    'Kraft Mexican Four Cheese Shredded', 'Kraft Mozzarella Shredded',
    'Sargento Sharp Cheddar Sliced', 'Sargento Mozzarella Shredded',
    'Sargento Balanced Breaks', 'Sargento Cheese Snacks',
    'Tillamook Sharp Cheddar', 'Tillamook Medium Cheddar', 'Tillamook Colby Jack',
    'Cabot Vermont Cheddar', 'Cabot Seriously Sharp',
    'Boars Head American', 'Boars Head Provolone', 'Boars Head Swiss',
    'Kraft Singles American', 'Kraft Singles Swiss', 'Land O Lakes Deli American',
    'Velveeta Original', 'Velveeta Slices',
    'Philadelphia Cream Cheese Original', 'Alouette Spreadable Cheese',
    'Babybel Original', 'Babybel Light', 'Laughing Cow Spreadable',
    'Cracker Barrel Extra Sharp', 'Cracker Barrel White Cheddar',
    'President Brie', 'Alouette Brie', 'Ile de France Camembert',
    'Belgioioso Fresh Mozzarella', 'Polly O Mozzarella', 'Galbani Ricotta',
    'Polly O Ricotta', 'Breakstone Cottage Cheese', 'Daisy Cottage Cheese',
    'Good Culture Cottage Cheese', 'Friendship Cottage Cheese',
    'Parmesan Reggiano Kraft', 'Sargento Artisan Parmesan',
    'Pecorino Romano Locatelli', 'Manchego Cheese',
  ],
  seafood: [
    'Gortons Fish Sticks', 'Gortons Crunchy Fillets', 'Gortons Grilled Salmon',
    'SeaPak Shrimp Scampi', 'SeaPak Coconut Shrimp', 'SeaPak Popcorn Shrimp',
    'Van de Kamp Fish Sticks', 'Mrs Pauls Fish Fillets',
    'Bumble Bee Solid White Albacore Tuna', 'StarKist Chunk Light Tuna',
    'Wild Planet Skipjack Tuna', 'Safe Catch Elite Tuna',
    'Bumble Bee Pink Salmon', 'Wild Planet Sockeye Salmon',
    'Crown Prince Natural Oysters', 'Bar Harbor Clam Chowder',
    'Cento Clams Chopped', 'Snow Crab Legs Frozen',
    'Kirkland Shrimp Frozen', 'Great Value Shrimp Ring',
    'Tilapia Fillets Frozen', 'Salmon Fillets Frozen Atlantic',
    'Swai Fillets Frozen', 'Cod Fillets Frozen',
    'Mahi Mahi Fillets Frozen', 'Halibut Fillets Frozen',
    'Maine Lobster Tails Frozen', 'King Crab Legs Frozen',
    'Crab Cakes Phillips', 'Salmon Burgers Dr Praeger',
  ],
  personal_care: [
    'Pantene Pro V Shampoo', 'Pantene Daily Moisture Renewal', 'Pantene Repair Protect',
    'Head Shoulders Classic Clean', 'Head Shoulders Smooth Silky',
    'TRESemme Moisture Rich Shampoo', 'Herbal Essences Bio Renew',
    'Dove Shampoo Intense Repair', 'OGX Argan Oil Shampoo',
    'Dove Beauty Bar', 'Irish Spring Original', 'Dial Complete Antibacterial',
    'Dove Body Wash Deep Moisture', 'Olay Ultra Moisture Body Wash',
    'Old Spice Original Body Wash', 'Axe Phoenix Body Wash',
    'Degree Original Antiperspirant', 'Degree Men Dry Protection',
    'Old Spice Original Deodorant', 'Dove Advanced Care Deodorant',
    'Secret Powder Fresh Deodorant', 'Secret Clinical Strength',
    'Speed Stick Regular', 'Mitchum Smart Solid',
    'Gillette Fusion5 Razor', 'Gillette Mach3 Cartridges',
    'Venus Original Razor', 'Schick Hydro 5 Razor',
    'Colgate Cavity Protection Toothpaste', 'Crest 3D White', 'Sensodyne Repair Protect',
    'Listerine Cool Mint Mouthwash', 'Crest Pro Health Mouthwash',
    'Neutrogena Facial Cleanser', 'Cetaphil Gentle Cleanser', 'CeraVe Hydrating Cleanser',
    'Olay Total Effects Moisturizer', 'Lubriderm Daily Moisture',
    'Vaseline Original Petroleum Jelly', 'Aquaphor Healing Ointment',
  ],
  cleaning: [
    'Tide Original Liquid Detergent', 'Tide Pods 3 in 1', 'Tide Free Gentle',
    'Gain Original Liquid', 'Gain Flings Laundry Pacs',
    'All Free Clear Liquid', 'Seventh Generation Free Clear',
    'Arm Hammer Clean Burst', 'Purex Original Fresh',
    'Downy Ultra April Fresh', 'Bounce Outdoor Fresh Sheets',
    'Snuggle Plus Super Fresh', 'Gain Original Softener',
    'Dawn Original Dish Soap', 'Dawn Ultra Platinum',
    'Palmolive Original Dish Soap', 'Ajax Ultra Dish Soap',
    'Seventh Generation Dish Soap', 'Method Dish Soap',
    'Cascade Complete Dishwasher Pods', 'Finish Quantum Dishwasher Tabs',
    'Finish All in 1 Dishwasher Pods', 'Cascade Platinum ActionPacs',
    'Lysol Disinfectant Spray', 'Lysol All Purpose Cleaner',
    'Clorox Clean Up Cleaner', 'Clorox Disinfecting Wipes',
    'Mr Clean Multi Purpose Liquid', 'Formula 409 All Purpose',
    'Windex Original Glass Cleaner', 'Pledge Multi Surface',
    'Bounty Select A Size Paper Towels', 'Bounty Essentials',
    'Charmin Ultra Strong Toilet Paper', 'Charmin Ultra Soft', 'Cottonelle Ultra',
    'Scott 1000 Toilet Paper', 'Angel Soft Toilet Paper',
    'Puffs Plus Lotion Facial Tissue', 'Kleenex Soft Facial Tissue',
    'Glad Tall Kitchen Bags', 'Hefty Strong Trash Bags', 'Ziploc Quart Storage Bags',
  ],
  health: [
    'Tylenol Extra Strength Acetaminophen', 'Tylenol Regular Strength',
    'Advil Ibuprofen Tablets', 'Advil Liquid Gels', 'Motrin IB Ibuprofen',
    'Aleve Naproxen Sodium', 'Bayer Aspirin 81mg', 'Excedrin Migraine',
    'Centrum Silver Adults 50 Plus', 'Centrum Adults Complete',
    'One A Day Mens Health Formula', 'One A Day Womens Formula',
    'Vitafusion Gummy Adult Multivitamin', 'Nature Made Multi Adult',
    'Nature Made Vitamin D3 1000 IU', 'Nature Made Vitamin C 500mg',
    'Natrol Melatonin 5mg', 'ZzzQuil Nighttime Sleep Aid',
    'Nyquil Severe Cold Flu', 'Dayquil Severe Cold Flu',
    'Mucinex DM Maximum Strength', 'Mucinex Fast Max',
    'Claritin 24 Hour Allergy', 'Zyrtec Allergy 10mg', 'Allegra Allergy 180mg',
    'Flonase Allergy Relief Nasal Spray', 'Nasacort Allergy Nasal Spray',
    'Pepto Bismol Liquid', 'Tums Extra Strength', 'Rolaids Extra Strength',
    'Imodium AD Diarrhea Relief', 'MiraLAX Laxative Powder',
    'Neosporin Original First Aid', 'Band Aid Flexible Fabric',
    'Bengay Ultra Strength', 'Icy Hot Original Cream',
    'Biofreeze Pain Relief Gel', 'Salonpas Pain Relief Patch',
  ],
  baby: [
    'Pampers Swaddlers Newborn', 'Pampers Baby Dry Size 1', 'Pampers Baby Dry Size 2',
    'Pampers Baby Dry Size 3', 'Pampers Baby Dry Size 4', 'Pampers Cruisers 360',
    'Huggies Little Snugglers Newborn', 'Huggies Little Movers Size 3',
    'Huggies Little Movers Size 4', 'Huggies Snug Dry',
    'Pampers Sensitive Baby Wipes', 'Huggies Natural Care Wipes',
    'WaterWipes Sensitive Baby Wipes', 'Seventh Generation Baby Wipes',
    'Similac Advance Infant Formula', 'Enfamil NeuroPro Infant Formula',
    'Gerber Good Start Soothe', 'Earth Best Organic Formula',
    'Gerber 1st Foods Sweet Potatoes', 'Gerber 1st Foods Peas',
    'Gerber 1st Foods Applesauce', 'Gerber 2nd Foods Banana Apple',
    'Beech Nut Stage 1 Banana', 'Happy Baby Organic Stage 1',
    'Johnsons Baby Shampoo', 'Johnsons Baby Wash', 'Johnsons Baby Lotion',
    'Aveeno Baby Daily Moisture Lotion', 'Cetaphil Baby Wash Shampoo',
    'Burt Bees Baby Shampoo', 'Desitin Rapid Relief Diaper Rash Cream',
    'Aquaphor Baby Healing Ointment', 'Earth Mama Diaper Balm',
  ],
  pet: [
    'Purina One Smartblend Dog Food', 'Purina Pro Plan Adult Dog', 'Purina Beneful Original',
    'Pedigree Adult Complete Nutrition', 'Pedigree Wet Dog Food',
    'Iams Proactive Health Adult Dog', 'Science Diet Adult Dog Food',
    'Blue Buffalo Life Protection Dog', 'Blue Buffalo Wilderness Dog',
    'Royal Canin Medium Adult Dog', 'Nutro Wholesome Essentials Dog',
    'Wellness Complete Health Dog', 'Natural Balance Limited Ingredient',
    'Purina Fancy Feast Grilled Salmon', 'Purina Fancy Feast Chicken',
    'Friskies Pate Seafood Cat', 'Friskies Wet Cat Food Variety',
    'Meow Mix Original Cat Food', 'Purina Cat Chow Complete',
    'Iams Perfect Portions Cat Food', 'Blue Buffalo Indoor Cat',
    'Royal Canin Indoor Adult Cat', 'Science Diet Indoor Cat Food',
    'Tidy Cats Clumping Litter', 'Fresh Step Clumping Litter',
    'Arm Hammer Clump Seal Cat Litter', 'World Best Cat Litter',
    'Milk Bone Original Dog Treats', 'Beggin Strips Bacon Flavor',
    'Greenies Dog Dental Treats', 'Zuke Mini Naturals Dog Treats',
    'Temptations Classic Cat Treats', 'Churu Cat Treats Purina',
    'Kong Classic Dog Toy', 'Nylabone Power Chew',
  ],
  alcohol: [
    'Bud Light Beer 12pk Cans', 'Budweiser Beer 12pk', 'Bud Light Lime',
    'Coors Light Beer 12pk', 'Coors Banquet Original', 'Miller Lite 12pk',
    'Miller High Life', 'Michelob Ultra 12pk', 'Michelob Ultra Pure Gold',
    'Corona Extra 12pk Bottles', 'Corona Light', 'Modelo Especial 12pk',
    'Dos Equis Lager 12pk', 'Heineken Original 12pk', 'Stella Artois 12pk',
    'Guinness Draught Stout', 'Blue Moon Belgian White', 'Samuel Adams Boston Lager',
    'Dogfish Head 60 Minute IPA', 'Sierra Nevada Pale Ale',
    'White Claw Hard Seltzer Variety', 'White Claw Black Cherry',
    'Truly Hard Seltzer Variety', 'Vizzy Hard Seltzer Variety',
    'Angry Orchard Crisp Apple Cider', 'Woodchuck Amber Hard Cider',
    'Smirnoff Ice Original', 'Mike Hard Lemonade',
    'Barefoot Chardonnay', 'Barefoot Cabernet Sauvignon', 'Barefoot Pinot Grigio',
    'Kim Crawford Sauvignon Blanc', 'Meiomi Pinot Noir', 'Josh Cellars Cabernet',
    'Apothic Red Wine', 'Chateau Ste Michelle Riesling',
    'Yellow Tail Shiraz', 'Woodbridge Chardonnay',
  ],
  packaged_meals: [
    'Kraft Mac Cheese Original', 'Kraft Mac Cheese Spirals', 'Kraft Deluxe Mac Cheese',
    'Annie Organic Shells White Cheddar', 'Annie Organic Mac Cheese',
    'Velveeta Shells Cheese Original', 'Velveeta Shells Cheese 2%',
    'Barilla Spaghetti Pasta', 'Barilla Penne Pasta', 'Barilla Rotini Pasta',
    'Mueller Elbow Macaroni', 'Ronzoni Rigatoni', 'De Cecco Linguine',
    'Uncle Bens Ready Rice', 'Ben Original Long Grain Rice',
    'Minute Brown Rice', 'Seeds of Change Brown Rice Quinoa',
    'Maruchan Chicken Ramen', 'Maruchan Beef Ramen', 'Nissin Cup Noodles',
    'Top Ramen Chicken', 'Thai Kitchen Instant Rice Noodles',
    'Hamburger Helper Cheeseburger Macaroni', 'Chicken Helper Fettuccine Alfredo',
    'Zatarains Dirty Rice', 'Rice A Roni Chicken Flavor',
    'Near East Rice Pilaf', 'Knorr Rice Sides Chicken',
    'Idahoan Instant Mashed Potatoes', 'Betty Crocker Mashed Potatoes',
    'Bob Red Mill Quinoa', 'Goya Yellow Rice', 'Goya Black Beans Rice',
    'Green Giant Riced Cauliflower', 'Cauli Rice Frozen',
  ],
  condiments: [
    'Heinz Tomato Ketchup', 'Heinz Organic Ketchup', 'Hunts Ketchup',
    'French Yellow Mustard', 'French Honey Mustard', 'Grey Poupon Dijon',
    'Gulden Spicy Brown Mustard', 'Inglehoffer Stone Ground',
    'Hellmanns Real Mayonnaise', 'Hellmanns Light Mayonnaise',
    'Best Foods Real Mayonnaise', 'Duke Mayonnaise',
    'Miracle Whip Original', 'Kraft Mayo with Olive Oil',
    'Hidden Valley Ranch Original', 'Hidden Valley Ranch Squeeze',
    'Ken Thousand Island Dressing', 'Ken Italian Dressing',
    'Kraft Caesar Dressing', 'Newman Own Caesar',
    'Wishbone Italian Dressing', 'Bolthouse Farms Yogurt Dressing',
    'Tabasco Original Hot Sauce', 'Franks RedHot Original',
    'Sriracha Huy Fong Foods', 'Cholula Hot Sauce Original',
    'Sweet Baby Ray Original BBQ Sauce', 'KC Masterpiece BBQ',
    'Stubb Original BBQ Sauce', 'Bulls Eye Original BBQ',
    'Kikkoman Soy Sauce', 'Lee Kum Kee Oyster Sauce',
    'Worcestershire Sauce Lea Perrins', 'A1 Original Steak Sauce',
    'Classico Alfredo Sauce', 'Bertolli Alfredo Sauce', 'Ragu Cheese Sauce',
    'Vlasic Dill Pickles', 'Claussen Kosher Dill', 'Mt Olive Pickles',
    'Vlasic Banana Peppers', 'Mezzetta Giardiniera', 'Lindsay Olives',
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