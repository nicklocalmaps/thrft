/**
 * THRFT Aisle Profiles
 * Complete sub-category taxonomy for all 18 aisles.
 * Mirrors Kroger.com / Walmart.com organization.
 *
 * Structure:
 * {
 *   key: aisle key,
 *   label: display name,
 *   emoji: aisle emoji,
 *   subcategories: [
 *     {
 *       key: subcategory key,
 *       label: display name,
 *       emoji: icon,
 *       brands: [ 'Brand1', 'Brand2' ],  // featured brands in order
 *       keywords: [ 'keyword1' ],         // used to auto-slot products
 *     }
 *   ]
 * }
 */

export const AISLE_PROFILES = [

  // ── BEVERAGES ──────────────────────────────────────────────────────────────
  {
    key: 'beverages',
    label: 'Beverages',
    emoji: '🥤',
    subcategories: [
      {
        key: 'cola_soda',
        label: 'Colas & Soda',
        emoji: '🥤',
        brands: ['Coca-Cola', 'Pepsi', 'Sprite', 'Dr Pepper', 'Mountain Dew', '7UP', 'Fanta', 'RC Cola'],
        keywords: ['cola', 'soda', 'coke', 'pepsi', 'sprite', 'dr pepper', 'mountain dew', '7up', 'fanta', 'ginger ale', 'root beer', 'cream soda', 'lemon lime'],
      },
      {
        key: 'water',
        label: 'Water',
        emoji: '💧',
        brands: ['Dasani', 'Aquafina', 'Smartwater', 'Poland Spring', 'Evian', 'Fiji'],
        keywords: ['water', 'still water', 'drinking water', 'spring water', 'purified'],
      },
      {
        key: 'sparkling_water',
        label: 'Sparkling Water',
        emoji: '🫧',
        brands: ['LaCroix', 'Bubly', 'Perrier', 'San Pellegrino', 'Topo Chico', 'Waterloo'],
        keywords: ['sparkling', 'carbonated water', 'seltzer', 'lacroix', 'bubly', 'perrier'],
      },
      {
        key: 'juice',
        label: 'Juice',
        emoji: '🍊',
        brands: ['Tropicana', 'Simply', 'Minute Maid', 'Ocean Spray', 'Welchs', 'Motts', 'V8'],
        keywords: ['juice', 'orange juice', 'apple juice', 'grape juice', 'cranberry', 'lemonade', 'fruit punch', 'hi-c', 'kool-aid', 'hawaiian punch', 'capri sun'],
      },
      {
        key: 'sports_energy',
        label: 'Sports & Energy',
        emoji: '⚡',
        brands: ['Gatorade', 'Powerade', 'Red Bull', 'Monster', 'Celsius', 'Bang', 'Prime'],
        keywords: ['gatorade', 'powerade', 'sports drink', 'energy drink', 'red bull', 'monster', 'celsius', 'bang', 'prime', 'body armor', 'electrolyte'],
      },
      {
        key: 'coffee_tea_rtd',
        label: 'Coffee & Tea',
        emoji: '☕',
        brands: ['Starbucks', 'Dunkin', 'Lipton', 'Snapple', 'AriZona', 'Pure Leaf', 'Gold Peak'],
        keywords: ['coffee', 'tea', 'iced coffee', 'cold brew', 'frappuccino', 'snapple', 'arizona', 'lipton', 'pure leaf'],
      },
      {
        key: 'milk_alternatives',
        label: 'Milk Alternatives',
        emoji: '🌱',
        brands: ['Silk', 'Oatly', 'Califia', 'Planet Oat', 'Ripple', 'Almond Breeze'],
        keywords: ['almond milk', 'oat milk', 'soy milk', 'coconut milk', 'plant milk', 'silk', 'oatly', 'califia'],
      },
    ],
  },

  // ── MEAT ───────────────────────────────────────────────────────────────────
  {
    key: 'meat',
    label: 'Meat',
    emoji: '🥩',
    subcategories: [
      {
        key: 'chicken',
        label: 'Chicken',
        emoji: '🍗',
        brands: ['Tyson', 'Perdue', 'Bell & Evans', 'Foster Farms', 'Sanderson Farms'],
        keywords: ['chicken', 'breast', 'thigh', 'drumstick', 'wing', 'whole chicken', 'rotisserie'],
      },
      {
        key: 'beef',
        label: 'Beef & Steak',
        emoji: '🥩',
        brands: ['Angus', 'USDA Choice', 'Certified Angus'],
        keywords: ['beef', 'steak', 'ground beef', 'ribeye', 'sirloin', 'chuck', 'brisket', 'roast', 'tenderloin', 'hamburger'],
      },
      {
        key: 'hot_dogs_sausage',
        label: 'Hot Dogs & Sausage',
        emoji: '🌭',
        brands: ['Oscar Mayer', 'Ball Park', "Nathan's", 'Hebrew National', 'Johnsonville'],
        keywords: ['hot dog', 'frank', 'sausage', 'brat', 'bratwurst', 'kielbasa', 'andouille', 'chorizo'],
      },
      {
        key: 'bacon',
        label: 'Bacon',
        emoji: '🥓',
        brands: ['Oscar Mayer', 'Smithfield', 'Hormel', 'Wright', 'Applegate'],
        keywords: ['bacon', 'turkey bacon', 'canadian bacon', 'uncured bacon'],
      },
      {
        key: 'pork',
        label: 'Pork',
        emoji: '🐷',
        brands: ['Smithfield', 'Hatfield', 'Hormel'],
        keywords: ['pork', 'chop', 'tenderloin', 'loin', 'ribs', 'spare rib', 'baby back'],
      },
      {
        key: 'lunch_meat',
        label: 'Lunch Meat & Deli',
        emoji: '🥪',
        brands: ['Oscar Mayer', 'Hillshire Farm', "Boar's Head", 'Applegate', 'Land O Frost'],
        keywords: ['turkey', 'ham', 'roast beef', 'salami', 'pepperoni', 'bologna', 'lunch meat', 'deli meat', 'pastrami', 'corned beef'],
      },
      {
        key: 'plant_based',
        label: 'Plant-Based',
        emoji: '🌱',
        brands: ['Beyond Meat', 'Impossible', 'MorningStar', 'Gardein', "Dr. Praeger's"],
        keywords: ['beyond', 'impossible', 'plant based', 'veggie burger', 'meatless'],
      },
      {
        key: 'frozen_burgers',
        label: 'Frozen Burgers & Patties',
        emoji: '🍔',
        brands: ['Bubba Burger', 'Ball Park', 'Angus Beef Patties'],
        keywords: ['frozen burger', 'beef patty', 'frozen patty', 'bubba burger'],
      },
    ],
  },

  // ── SEAFOOD ────────────────────────────────────────────────────────────────
  {
    key: 'seafood',
    label: 'Seafood',
    emoji: '🦐',
    subcategories: [
      {
        key: 'fresh_fish',
        label: 'Fresh Fish',
        emoji: '🐟',
        brands: ['Wild Caught', 'Atlantic', 'Pacific'],
        keywords: ['salmon', 'tilapia', 'cod', 'catfish', 'trout', 'mahi', 'halibut', 'tuna steak', 'fish fillet'],
      },
      {
        key: 'shrimp',
        label: 'Shrimp',
        emoji: '🦐',
        brands: ['SeaPak', "Gorton's", 'Chicken of the Sea'],
        keywords: ['shrimp', 'prawn'],
      },
      {
        key: 'canned_fish',
        label: 'Canned Fish',
        emoji: '🥫',
        brands: ['Bumble Bee', 'StarKist', 'Wild Planet', 'Chicken of the Sea'],
        keywords: ['canned tuna', 'canned salmon', 'sardine', 'anchovy'],
      },
      {
        key: 'frozen_seafood',
        label: 'Frozen Seafood',
        emoji: '🧊',
        brands: ["Gorton's", 'SeaPak', "Van de Kamp's"],
        keywords: ['frozen fish', 'fish stick', 'fish fillet frozen', 'crab', 'lobster', 'scallop', 'clam'],
      },
    ],
  },

  // ── DAIRY & EGGS ───────────────────────────────────────────────────────────
  {
    key: 'eggs_dairy',
    label: 'Dairy & Eggs',
    emoji: '🥛',
    subcategories: [
      {
        key: 'milk',
        label: 'Milk',
        emoji: '🥛',
        brands: ['Kroger', 'Horizon', 'Organic Valley', 'Fairlife', 'Lactaid'],
        keywords: ['milk', 'whole milk', 'skim milk', '2% milk', 'reduced fat milk', 'chocolate milk'],
      },
      {
        key: 'eggs',
        label: 'Eggs',
        emoji: '🥚',
        brands: ['Kroger', 'Vital Farms', "Pete and Gerry's", 'Happy Egg', 'Organic Valley'],
        keywords: ['eggs', 'large eggs', 'dozen eggs', 'free range', 'organic eggs', 'pasture raised'],
      },
      {
        key: 'butter',
        label: 'Butter & Margarine',
        emoji: '🧈',
        brands: ["Land O'Lakes", 'Kerrygold', 'Challenge', 'Country Crock', "I Can't Believe It's Not Butter"],
        keywords: ['butter', 'margarine', 'spread', 'salted butter', 'unsalted butter'],
      },
      {
        key: 'cream',
        label: 'Cream & Half & Half',
        emoji: '🫙',
        brands: ["Land O'Lakes", 'Hood', 'Horizon', 'Organic Valley'],
        keywords: ['heavy cream', 'whipping cream', 'half and half', 'sour cream', 'cream cheese'],
      },
      {
        key: 'coffee_creamer',
        label: 'Coffee Creamer',
        emoji: '☕',
        brands: ['Coffee Mate', 'International Delight', 'Califia', 'Silk'],
        keywords: ['creamer', 'coffee creamer', 'liquid creamer', 'powder creamer'],
      },
    ],
  },

  // ── CHEESE ─────────────────────────────────────────────────────────────────
  {
    key: 'cheese',
    label: 'Cheese',
    emoji: '🧀',
    subcategories: [
      {
        key: 'sliced_cheese',
        label: 'Sliced Cheese',
        emoji: '🧀',
        brands: ['Kraft', 'Sargento', "Boar's Head", "Land O'Lakes"],
        keywords: ['sliced cheese', 'american cheese', 'swiss cheese', 'provolone', 'cheddar sliced'],
      },
      {
        key: 'shredded_cheese',
        label: 'Shredded Cheese',
        emoji: '🧀',
        brands: ['Kraft', 'Sargento', 'Tillamook', 'Cabot'],
        keywords: ['shredded', 'shredded cheddar', 'shredded mozzarella', 'mexican blend', 'italian blend'],
      },
      {
        key: 'block_cheese',
        label: 'Block & Deli Cheese',
        emoji: '🧀',
        brands: ['Tillamook', 'Cabot', 'Cracker Barrel', 'Kraft'],
        keywords: ['block', 'cheddar block', 'colby jack', 'pepper jack block', 'gouda block'],
      },
      {
        key: 'specialty_cheese',
        label: 'Specialty & Imported',
        emoji: '🧀',
        brands: ['Babybel', 'Boursin', 'Brie', 'BelGioioso', 'Alouette'],
        keywords: ['brie', 'parmesan', 'feta', 'mozzarella fresh', 'ricotta', 'cottage cheese', 'cream cheese', 'gouda', 'blue cheese'],
      },
    ],
  },

  // ── FROZEN ─────────────────────────────────────────────────────────────────
  {
    key: 'frozen',
    label: 'Frozen',
    emoji: '🧊',
    subcategories: [
      {
        key: 'frozen_pizza',
        label: 'Frozen Pizza',
        emoji: '🍕',
        brands: ['DiGiorno', 'Red Baron', 'Tombstone', "Totino's", "Amy's", 'California Pizza Kitchen'],
        keywords: ['pizza', 'frozen pizza', 'rising crust', 'thin crust', 'stuffed crust'],
      },
      {
        key: 'frozen_meals',
        label: 'Frozen Meals & Entrees',
        emoji: '🍱',
        brands: ["Stouffer's", "Marie Callender's", 'Healthy Choice', 'Lean Cuisine', 'Banquet'],
        keywords: ['frozen meal', 'frozen dinner', 'entree', 'lasagna', 'pot pie', 'mac cheese frozen', 'frozen bowl'],
      },
      {
        key: 'frozen_breakfast',
        label: 'Frozen Breakfast',
        emoji: '🍳',
        brands: ['Jimmy Dean', 'Eggo', 'Pillsbury', 'Bob Evans'],
        keywords: ['frozen breakfast', 'waffle', 'pancake', 'breakfast sandwich', 'french toast', 'breakfast burrito'],
      },
      {
        key: 'frozen_vegetables',
        label: 'Frozen Vegetables',
        emoji: '🥦',
        brands: ["Bird's Eye", 'Green Giant', 'Cascadian Farm'],
        keywords: ['frozen vegetable', 'frozen broccoli', 'frozen peas', 'frozen corn', 'frozen spinach', 'edamame', 'riced cauliflower'],
      },
      {
        key: 'frozen_potatoes',
        label: 'Frozen Potatoes & Fries',
        emoji: '🍟',
        brands: ['Ore-Ida', 'Alexia', 'McCain'],
        keywords: ['fries', 'tater tots', 'hash brown', 'frozen potato', 'potato skin'],
      },
      {
        key: 'frozen_chicken',
        label: 'Frozen Chicken & Meat',
        emoji: '🍗',
        brands: ['Tyson', 'Perdue', 'Banquet'],
        keywords: ['frozen chicken', 'nugget', 'chicken strip', 'chicken tender', 'popcorn chicken'],
      },
      {
        key: 'frozen_seafood',
        label: 'Frozen Seafood',
        emoji: '🦐',
        brands: ["Gorton's", 'SeaPak', "Van de Kamp's"],
        keywords: ['fish stick', 'frozen shrimp', 'frozen fish', 'fish fillet'],
      },
      {
        key: 'ice_cream',
        label: 'Ice Cream & Novelties',
        emoji: '🍦',
        brands: ["Ben & Jerry's", 'Häagen-Dazs', 'Breyers', "Dreyer's", 'Blue Bunny', 'Klondike'],
        keywords: ['ice cream', 'frozen yogurt', 'sorbet', 'gelato', 'klondike', 'drumstick', 'popsicle', 'fudgsicle', 'creamsicle'],
      },
      {
        key: 'hot_pockets',
        label: 'Snacks & Appetizers',
        emoji: '🫓',
        brands: ['Hot Pockets', "Totino's", 'José Olé'],
        keywords: ['hot pocket', 'pizza roll', 'taquito', 'egg roll', 'frozen appetizer'],
      },
    ],
  },

  // ── BREAD & BAKERY ─────────────────────────────────────────────────────────
  {
    key: 'bread',
    label: 'Bakery & Bread',
    emoji: '🍞',
    subcategories: [
      {
        key: 'sandwich_bread',
        label: 'Sandwich Bread',
        emoji: '🍞',
        brands: ['Wonder', "Nature's Own", "Dave's Killer Bread", 'Sara Lee', 'Pepperidge Farm', 'Arnold'],
        keywords: ['white bread', 'wheat bread', 'sandwich bread', 'whole grain bread', 'sourdough bread'],
      },
      {
        key: 'buns_rolls',
        label: 'Buns & Rolls',
        emoji: '🫓',
        brands: ["King's Hawaiian", 'Pepperidge Farm', "Martin's", 'Ball Park'],
        keywords: ['hot dog bun', 'hamburger bun', 'dinner roll', 'slider roll', 'brioche', 'potato roll'],
      },
      {
        key: 'tortillas_wraps',
        label: 'Tortillas & Wraps',
        emoji: '🌯',
        brands: ['Mission', 'Old El Paso', 'La Banderita', 'Flatout'],
        keywords: ['tortilla', 'flour tortilla', 'corn tortilla', 'wrap', 'flatbread', 'lavash'],
      },
      {
        key: 'bagels',
        label: 'Bagels',
        emoji: '🥯',
        brands: ["Thomas'", 'Sara Lee', 'Einstein Bros', 'Pepperidge Farm'],
        keywords: ['bagel', 'everything bagel', 'plain bagel', 'cinnamon raisin bagel'],
      },
      {
        key: 'english_muffins',
        label: 'English Muffins',
        emoji: '🫓',
        brands: ["Thomas'", 'Bays'],
        keywords: ['english muffin', 'thomas english', 'bays english'],
      },
      {
        key: 'gluten_free_bread',
        label: 'Gluten-Free Bread',
        emoji: '🌾',
        brands: ["Udi's", 'Canyon Bakehouse', 'Schär', 'Sola'],
        keywords: ['gluten free bread', 'gluten free', "udi's", 'canyon bakehouse'],
      },
    ],
  },

  // ── SNACKS ─────────────────────────────────────────────────────────────────
  {
    key: 'snacks',
    label: 'Snacks & Chips',
    emoji: '🍿',
    subcategories: [
      {
        key: 'potato_chips',
        label: 'Potato Chips',
        emoji: '🥔',
        brands: ["Lay's", 'Ruffles', 'Pringles', 'Kettle', 'Cape Cod', 'Utz'],
        keywords: ['potato chip', "lay's", 'ruffles', 'pringles', 'kettle chip', 'wavy chip'],
      },
      {
        key: 'tortilla_chips',
        label: 'Tortilla Chips & Salsa',
        emoji: '🌽',
        brands: ['Doritos', 'Tostitos', 'Santitas', 'On The Border'],
        keywords: ['tortilla chip', 'doritos', 'tostitos', 'nacho chip', 'salsa', 'guacamole'],
      },
      {
        key: 'crackers',
        label: 'Crackers',
        emoji: '🫙',
        brands: ['Ritz', 'Wheat Thins', 'Triscuit', 'Goldfish', 'Cheez-It', 'Club Crackers'],
        keywords: ['cracker', 'ritz', 'wheat thin', 'triscuit', 'goldfish', 'cheez-it', 'saltine', 'graham cracker'],
      },
      {
        key: 'popcorn',
        label: 'Popcorn',
        emoji: '🍿',
        brands: ['Orville Redenbacher', 'Act II', 'SkinnyPop', 'Smartfood', 'Boom Chicka Pop'],
        keywords: ['popcorn', 'microwave popcorn', 'skinny pop', 'smartfood'],
      },
      {
        key: 'pretzels',
        label: 'Pretzels',
        emoji: '🥨',
        brands: ["Snyder's of Hanover", 'Rold Gold', 'Utz', "Auntie Anne's"],
        keywords: ['pretzel', 'pretzel stick', 'pretzel nugget', 'pretzel rod'],
      },
      {
        key: 'nuts_trail_mix',
        label: 'Nuts & Trail Mix',
        emoji: '🥜',
        brands: ['Planters', 'Blue Diamond', 'Emerald', 'Wonderful', 'Fisher'],
        keywords: ['nut', 'almond', 'cashew', 'peanut', 'walnut', 'pecan', 'trail mix', 'pistachio', 'mixed nuts'],
      },
      {
        key: 'granola_bars',
        label: 'Granola & Protein Bars',
        emoji: '🍫',
        brands: ['Nature Valley', 'Quaker Chewy', 'Kind', 'Clif Bar', 'RXBar', 'Larabar'],
        keywords: ['granola bar', 'protein bar', 'nature valley', 'kind bar', 'clif bar', 'rx bar', 'larabar', 'fiber one', 'nutri grain'],
      },
      {
        key: 'cheese_snacks',
        label: 'Cheese Snacks',
        emoji: '🧀',
        brands: ['Cheetos', "Pirate's Booty", 'Smartfood'],
        keywords: ['cheetos', 'cheese puff', 'cheese curl', 'cheese doodle', 'pirate booty'],
      },
    ],
  },

  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  {
    key: 'breakfast',
    label: 'Breakfast',
    emoji: '🍳',
    subcategories: [
      {
        key: 'cereal',
        label: 'Cereal',
        emoji: '🥣',
        brands: ['General Mills', "Kellogg's", 'Post', 'Quaker'],
        keywords: ['cereal', 'cheerios', 'frosted flakes', 'corn flakes', 'raisin bran', 'lucky charms', 'cocoa puffs', 'froot loops', 'granola cereal'],
      },
      {
        key: 'oatmeal',
        label: 'Oatmeal & Hot Cereal',
        emoji: '🫙',
        brands: ['Quaker', "Bob's Red Mill", 'Better Oats'],
        keywords: ['oatmeal', 'oats', 'instant oatmeal', 'steel cut oats', 'grits', 'cream of wheat'],
      },
      {
        key: 'pancake_waffle',
        label: 'Pancake & Waffle Mix',
        emoji: '🧇',
        brands: ['Bisquick', 'Aunt Jemima', 'Hungry Jack', 'Krusteaz'],
        keywords: ['pancake mix', 'waffle mix', 'bisquick', 'aunt jemima', 'hungry jack', 'krusteaz'],
      },
      {
        key: 'syrup',
        label: 'Syrup & Spreads',
        emoji: '🍯',
        brands: ['Log Cabin', "Mrs. Butterworth's", 'Hungry Jack', 'Maple Grove'],
        keywords: ['syrup', 'maple syrup', 'pancake syrup', 'log cabin', 'mrs butterworth'],
      },
      {
        key: 'toaster_pastries',
        label: 'Toaster Pastries & Bars',
        emoji: '🍞',
        brands: ['Pop-Tarts', 'Nutri-Grain', "Kellogg's"],
        keywords: ['pop tart', 'toaster pastry', 'nutri grain', 'toaster strudel'],
      },
      {
        key: 'granola',
        label: 'Granola',
        emoji: '🌾',
        brands: ['Nature Valley', 'Kashi', 'Bear Naked', 'Cascadian Farm'],
        keywords: ['granola', 'muesli', 'granola cluster'],
      },
    ],
  },

  // ── CANNED GOODS ───────────────────────────────────────────────────────────
  {
    key: 'canned',
    label: 'Canned Goods',
    emoji: '🥫',
    subcategories: [
      {
        key: 'canned_soup',
        label: 'Soup',
        emoji: '🍲',
        brands: ["Campbell's", 'Progresso', 'Wolfgang Puck', "Amy's"],
        keywords: ['soup', 'chicken noodle soup', 'tomato soup', 'cream of mushroom', 'chili', 'clam chowder', 'broth', 'stock'],
      },
      {
        key: 'canned_tomatoes',
        label: 'Tomatoes & Sauce',
        emoji: '🍅',
        brands: ["Hunt's", 'Del Monte', 'Muir Glen', 'San Marzano', 'Ro-Tel'],
        keywords: ['canned tomato', 'diced tomato', 'crushed tomato', 'tomato paste', 'tomato sauce', 'marinara', 'pasta sauce', 'ro-tel'],
      },
      {
        key: 'canned_beans',
        label: 'Beans & Legumes',
        emoji: '🫘',
        brands: ["Bush's", 'Goya', 'Eden', "Amy's", 'Old El Paso'],
        keywords: ['baked beans', 'black beans', 'kidney beans', 'pinto beans', 'refried beans', 'chickpea', 'lentil', 'navy bean'],
      },
      {
        key: 'canned_vegetables',
        label: 'Canned Vegetables',
        emoji: '🥫',
        brands: ['Del Monte', 'Green Giant', 'Birds Eye'],
        keywords: ['canned corn', 'canned peas', 'canned green beans', 'canned artichoke', 'canned beet'],
      },
      {
        key: 'canned_tuna',
        label: 'Canned Fish & Meat',
        emoji: '🐟',
        brands: ['Bumble Bee', 'StarKist', 'Wild Planet', 'Swanson', 'Hormel'],
        keywords: ['canned tuna', 'canned salmon', 'canned chicken', 'sardine', 'spam'],
      },
      {
        key: 'canned_fruit',
        label: 'Canned Fruit',
        emoji: '🍑',
        brands: ['Del Monte', 'Dole', "Libby's"],
        keywords: ['canned peach', 'canned pear', 'fruit cocktail', 'mandarin orange', 'canned pineapple'],
      },
    ],
  },

  // ── YOGURT ─────────────────────────────────────────────────────────────────
  {
    key: 'yogurt',
    label: 'Yogurt',
    emoji: '🍦',
    subcategories: [
      {
        key: 'greek_yogurt',
        label: 'Greek Yogurt',
        emoji: '🇬🇷',
        brands: ['Chobani', 'Fage', 'Oikos', "Siggi's", 'Two Good'],
        keywords: ['greek yogurt', 'chobani', 'fage', 'oikos', 'skyr'],
      },
      {
        key: 'regular_yogurt',
        label: 'Regular Yogurt',
        emoji: '🍦',
        brands: ['Yoplait', 'Dannon', 'Activia', 'Stonyfield'],
        keywords: ['yogurt', 'yoplait', 'dannon', 'activia', 'go-gurt', 'drinkable yogurt'],
      },
      {
        key: 'dairy_free_yogurt',
        label: 'Dairy-Free Yogurt',
        emoji: '🌱',
        brands: ['Kite Hill', 'So Delicious', 'Silk', 'Forager'],
        keywords: ['dairy free yogurt', 'almond milk yogurt', 'coconut yogurt', 'oat milk yogurt'],
      },
    ],
  },

  // ── COOKIES ────────────────────────────────────────────────────────────────
  {
    key: 'cookies',
    label: 'Cookies',
    emoji: '🍪',
    subcategories: [
      {
        key: 'sandwich_cookies',
        label: 'Sandwich Cookies',
        emoji: '🍪',
        brands: ['Oreo', 'Nutter Butter', 'Keebler E.L. Fudge'],
        keywords: ['oreo', 'sandwich cookie', 'nutter butter', 'fudge stripe', 'golden oreo'],
      },
      {
        key: 'chocolate_chip',
        label: 'Chocolate Chip Cookies',
        emoji: '🍪',
        brands: ['Chips Ahoy', "Tate's", 'Famous Amos', 'Pepperidge Farm'],
        keywords: ['chocolate chip cookie', 'chips ahoy', 'chewy cookie', 'soft baked'],
      },
      {
        key: 'specialty_cookies',
        label: 'Specialty & Imported',
        emoji: '🍪',
        brands: ['Pepperidge Farm', 'Leibniz', 'Stroopwafel', "McVitie's"],
        keywords: ['milano', 'chessmen', 'pirouette', 'ginger snap', 'shortbread', 'biscotti', 'stroopwafel'],
      },
      {
        key: 'healthy_cookies',
        label: 'Better-For-You',
        emoji: '🌾',
        brands: ["Annie's", 'Simple Mills', 'Back to Nature', 'Enjoy Life'],
        keywords: ['gluten free cookie', 'organic cookie', 'vegan cookie', 'almond flour cookie'],
      },
    ],
  },

  // ── CANDY ──────────────────────────────────────────────────────────────────
  {
    key: 'candy',
    label: 'Candy',
    emoji: '🍬',
    subcategories: [
      {
        key: 'chocolate',
        label: 'Chocolate & Candy Bars',
        emoji: '🍫',
        brands: ["Hershey's", "Reese's", 'Snickers', 'Kit Kat', 'Twix', 'Dove', 'Lindt'],
        keywords: ['chocolate bar', 'reese', 'snickers', 'kit kat', 'twix', 'milky way', 'butterfinger', 'hershey', 'almond joy', 'mounds'],
      },
      {
        key: 'gummy_candy',
        label: 'Gummy & Chewy Candy',
        emoji: '🐻',
        brands: ['Haribo', 'Swedish Fish', 'Sour Patch Kids', 'Trolli', 'Starburst'],
        keywords: ['gummy bear', 'gummy worm', 'sour patch', 'swedish fish', 'starburst', 'skittles', 'airheads', 'nerds'],
      },
      {
        key: 'hard_candy',
        label: 'Hard Candy & Lollipops',
        emoji: '🍭',
        brands: ['Jolly Rancher', 'Life Savers', "Werther's", 'Dum Dums', 'Tootsie'],
        keywords: ['hard candy', 'jolly rancher', 'life saver', 'werther', 'lollipop', 'dum dum', 'tootsie pop'],
      },
      {
        key: 'mints_gum',
        label: 'Mints & Gum',
        emoji: '🌿',
        brands: ['Altoids', 'Tic Tac', 'Extra', 'Trident', 'Orbit', 'Ice Breakers'],
        keywords: ['mint', 'gum', 'altoids', 'tic tac', 'extra gum', 'trident gum', 'orbit', 'ice breaker'],
      },
    ],
  },

  // ── DELI ───────────────────────────────────────────────────────────────────
  {
    key: 'deli',
    label: 'Deli',
    emoji: '🥪',
    subcategories: [
      {
        key: 'deli_turkey',
        label: 'Turkey',
        emoji: '🦃',
        brands: ['Oscar Mayer', "Boar's Head", 'Hillshire Farm', 'Applegate'],
        keywords: ['turkey breast', 'oven roasted turkey', 'smoked turkey', 'honey turkey'],
      },
      {
        key: 'deli_ham',
        label: 'Ham',
        emoji: '🍖',
        brands: ['Oscar Mayer', "Boar's Head", 'Hillshire Farm', 'Land O Frost'],
        keywords: ['ham', 'honey ham', 'black forest ham', 'virginia ham'],
      },
      {
        key: 'deli_beef',
        label: 'Roast Beef & Specialty',
        emoji: '🥩',
        brands: ["Boar's Head", 'Dietz & Watson'],
        keywords: ['roast beef', 'pastrami', 'corned beef', 'salami', 'bologna', 'pepperoni sliced'],
      },
    ],
  },

  // ── PERSONAL CARE ──────────────────────────────────────────────────────────
  {
    key: 'personal_care',
    label: 'Personal Care',
    emoji: '🧴',
    subcategories: [
      {
        key: 'shampoo_conditioner',
        label: 'Shampoo & Conditioner',
        emoji: '🚿',
        brands: ['Pantene', 'Head & Shoulders', 'Dove', 'TRESemmé', 'Herbal Essences', 'OGX'],
        keywords: ['shampoo', 'conditioner', 'dry shampoo', 'dandruff shampoo'],
      },
      {
        key: 'body_wash_soap',
        label: 'Body Wash & Soap',
        emoji: '🧼',
        brands: ['Dove', 'Old Spice', 'Axe', 'Irish Spring', 'Dial', 'Softsoap'],
        keywords: ['body wash', 'soap', 'bar soap', 'hand soap', 'liquid soap'],
      },
      {
        key: 'toothpaste_oral',
        label: 'Oral Care',
        emoji: '🦷',
        brands: ['Colgate', 'Crest', 'Sensodyne', 'Arm & Hammer', 'Listerine'],
        keywords: ['toothpaste', 'mouthwash', 'dental floss', 'whitening strips', 'toothbrush'],
      },
      {
        key: 'deodorant',
        label: 'Deodorant',
        emoji: '🧴',
        brands: ['Old Spice', 'Degree', 'Dove', 'Secret', 'Axe', 'Speed Stick'],
        keywords: ['deodorant', 'antiperspirant', 'body spray'],
      },
      {
        key: 'shaving',
        label: 'Shaving',
        emoji: '🪒',
        brands: ['Gillette', 'Schick', 'Venus', 'BIC'],
        keywords: ['razor', 'shaving cream', 'shaving gel', 'aftershave', 'razor blade'],
      },
      {
        key: 'skin_care',
        label: 'Skin Care & Lotion',
        emoji: '🧴',
        brands: ['Neutrogena', 'Aveeno', 'CeraVe', 'Olay', 'Vaseline', 'Lubriderm'],
        keywords: ['lotion', 'moisturizer', 'face wash', 'sunscreen', 'chapstick', 'lip balm'],
      },
    ],
  },

  // ── CLEANING ───────────────────────────────────────────────────────────────
  {
    key: 'cleaning',
    label: 'Cleaning',
    emoji: '🧹',
    subcategories: [
      {
        key: 'laundry',
        label: 'Laundry',
        emoji: '👕',
        brands: ['Tide', 'Gain', 'Arm & Hammer', 'Downy', 'Bounce', 'All'],
        keywords: ['laundry detergent', 'tide', 'gain', 'fabric softener', 'dryer sheet', 'laundry pods', 'stain remover'],
      },
      {
        key: 'dish_soap',
        label: 'Dish Soap & Dishwasher',
        emoji: '🍽️',
        brands: ['Dawn', 'Palmolive', 'Cascade', 'Finish'],
        keywords: ['dish soap', 'dawn', 'dishwasher pod', 'cascade', 'finish', 'rinse aid'],
      },
      {
        key: 'surface_cleaners',
        label: 'Surface Cleaners',
        emoji: '🧴',
        brands: ['Lysol', 'Clorox', 'Mr. Clean', 'Fabuloso', 'Pine-Sol', '409'],
        keywords: ['disinfecting spray', 'cleaning spray', 'lysol', 'clorox', 'mr clean', 'windex', 'glass cleaner'],
      },
      {
        key: 'paper_products',
        label: 'Paper Products',
        emoji: '🧻',
        brands: ['Bounty', 'Charmin', 'Scott', 'Angel Soft', 'Kleenex', 'Puffs'],
        keywords: ['paper towel', 'toilet paper', 'facial tissue', 'kleenex', 'bounty', 'charmin'],
      },
      {
        key: 'trash_bags',
        label: 'Trash Bags & Wrap',
        emoji: '🗑️',
        brands: ['Glad', 'Hefty', 'Ziploc', 'Reynolds'],
        keywords: ['trash bag', 'garbage bag', 'ziploc', 'aluminum foil', 'plastic wrap', 'food storage bag'],
      },
    ],
  },

  // ── HEALTH ─────────────────────────────────────────────────────────────────
  {
    key: 'health',
    label: 'Health',
    emoji: '💊',
    subcategories: [
      {
        key: 'pain_relief',
        label: 'Pain Relief',
        emoji: '💊',
        brands: ['Tylenol', 'Advil', 'Aleve', 'Bayer', 'Excedrin', 'Motrin'],
        keywords: ['pain relief', 'tylenol', 'advil', 'ibuprofen', 'acetaminophen', 'aspirin', 'excedrin', 'aleve', 'naproxen'],
      },
      {
        key: 'cold_flu',
        label: 'Cold & Flu',
        emoji: '🤧',
        brands: ['NyQuil', 'DayQuil', 'Mucinex', 'Robitussin', 'Sudafed'],
        keywords: ['cold medicine', 'flu medicine', 'nyquil', 'dayquil', 'mucinex', 'robitussin', 'sudafed', 'cough syrup'],
      },
      {
        key: 'allergy',
        label: 'Allergy',
        emoji: '🤧',
        brands: ['Claritin', 'Zyrtec', 'Benadryl', 'Allegra', 'Flonase'],
        keywords: ['allergy', 'claritin', 'zyrtec', 'benadryl', 'allegra', 'antihistamine', 'flonase', 'nasal spray'],
      },
      {
        key: 'vitamins',
        label: 'Vitamins & Supplements',
        emoji: '💊',
        brands: ['Centrum', 'Nature Made', 'One A Day', 'Vitafusion', 'Emergen-C'],
        keywords: ['vitamin', 'supplement', 'multivitamin', 'vitamin c', 'vitamin d', 'fish oil', 'melatonin', 'emergen-c'],
      },
      {
        key: 'digestive',
        label: 'Digestive Health',
        emoji: '🫙',
        brands: ['Pepto-Bismol', 'Tums', 'Rolaids', 'Imodium', 'MiraLax', 'Dulcolax'],
        keywords: ['antacid', 'pepto', 'tums', 'rolaids', 'imodium', 'miralax', 'probiotic', 'digestive'],
      },
      {
        key: 'first_aid',
        label: 'First Aid',
        emoji: '🩹',
        brands: ['Band-Aid', 'Neosporin', 'ACE', 'Nexcare'],
        keywords: ['band aid', 'bandage', 'neosporin', 'antibiotic ointment', 'first aid'],
      },
    ],
  },

  // ── BABY ───────────────────────────────────────────────────────────────────
  {
    key: 'baby',
    label: 'Baby',
    emoji: '👶',
    subcategories: [
      {
        key: 'diapers',
        label: 'Diapers & Wipes',
        emoji: '🍼',
        brands: ['Pampers', 'Huggies', 'Luvs', 'WaterWipes', 'Seventh Generation'],
        keywords: ['diaper', 'wipe', 'pampers', 'huggies', 'luvs', 'baby wipes', 'training pants'],
      },
      {
        key: 'formula',
        label: 'Baby Formula',
        emoji: '🍼',
        brands: ['Similac', 'Enfamil', 'Gerber', "Earth's Best"],
        keywords: ['formula', 'infant formula', 'similac', 'enfamil', 'baby formula'],
      },
      {
        key: 'baby_food',
        label: 'Baby Food',
        emoji: '🥣',
        brands: ['Gerber', 'Beech-Nut', 'Happy Baby', 'Plum Organics'],
        keywords: ['baby food', 'gerber', 'baby puree', 'baby snack', 'puffs', 'mum mum'],
      },
      {
        key: 'baby_care',
        label: 'Baby Care',
        emoji: '🧴',
        brands: ["Johnson's", 'Aveeno Baby', 'Desitin', "Boudreaux's"],
        keywords: ['baby lotion', 'baby wash', 'baby shampoo', 'diaper cream', 'baby powder'],
      },
    ],
  },

  // ── PET ────────────────────────────────────────────────────────────────────
  {
    key: 'pet',
    label: 'Pet',
    emoji: '🐶',
    subcategories: [
      {
        key: 'dog_food_dry',
        label: 'Dog Food - Dry',
        emoji: '🐕',
        brands: ['Purina', 'Pedigree', 'Iams', 'Blue Buffalo', "Hill's Science Diet", 'Royal Canin'],
        keywords: ['dry dog food', 'dog kibble', 'purina one', 'pedigree dry', 'blue buffalo dog'],
      },
      {
        key: 'dog_food_wet',
        label: 'Dog Food - Wet',
        emoji: '🐕',
        brands: ['Purina', 'Pedigree', 'Royal Canin'],
        keywords: ['wet dog food', 'canned dog food', 'dog food can'],
      },
      {
        key: 'cat_food',
        label: 'Cat Food',
        emoji: '🐈',
        brands: ['Fancy Feast', 'Friskies', 'Meow Mix', 'Iams', 'Blue Buffalo', "Hill's"],
        keywords: ['cat food', 'fancy feast', 'friskies', 'meow mix', 'cat kibble', 'wet cat food'],
      },
      {
        key: 'pet_treats',
        label: 'Pet Treats',
        emoji: '🦴',
        brands: ['Milk-Bone', "Beggin'", 'Greenies', 'Temptations', "Zuke's"],
        keywords: ['dog treat', 'cat treat', 'milk bone', 'greenies', 'temptations', 'beggin strips'],
      },
      {
        key: 'cat_litter',
        label: 'Cat Litter',
        emoji: '🐱',
        brands: ['Tidy Cats', 'Fresh Step', "Dr. Elsey's", 'Arm & Hammer'],
        keywords: ['cat litter', 'clumping litter', 'tidy cats', 'fresh step'],
      },
    ],
  },

  // ── ALCOHOL ────────────────────────────────────────────────────────────────
  {
    key: 'alcohol',
    label: 'Beer & Wine',
    emoji: '🍺',
    subcategories: [
      {
        key: 'light_beer',
        label: 'Light Beer',
        emoji: '🍺',
        brands: ['Bud Light', 'Coors Light', 'Miller Lite', 'Michelob Ultra', 'Natural Light', 'Busch Light'],
        keywords: ['light beer', 'bud light', 'coors light', 'miller lite', 'michelob ultra', 'natural light', 'busch light'],
      },
      {
        key: 'regular_beer',
        label: 'Regular Beer',
        emoji: '🍺',
        brands: ['Budweiser', 'Coors Banquet', 'Miller High Life', 'PBR'],
        keywords: ['budweiser', 'coors banquet', 'miller high life', 'pabst blue ribbon'],
      },
      {
        key: 'import_beer',
        label: 'Import Beer',
        emoji: '🍺',
        brands: ['Corona', 'Heineken', 'Modelo', 'Dos Equis', 'Stella Artois', 'Guinness'],
        keywords: ['corona', 'heineken', 'modelo', 'dos equis', 'stella', 'guinness', 'peroni', 'newcastle'],
      },
      {
        key: 'craft_beer',
        label: 'Craft & IPA',
        emoji: '🍺',
        brands: ['Samuel Adams', 'Blue Moon', 'Sierra Nevada', 'Lagunitas', 'Goose Island'],
        keywords: ['craft beer', 'ipa', 'pale ale', 'wheat beer', 'blue moon', 'samuel adams', 'sierra nevada'],
      },
      {
        key: 'hard_seltzer',
        label: 'Hard Seltzer',
        emoji: '🫧',
        brands: ['White Claw', 'Truly', 'Bud Light Seltzer', 'High Noon', 'Vizzy'],
        keywords: ['hard seltzer', 'white claw', 'truly', 'bud light seltzer', 'high noon'],
      },
      {
        key: 'wine_red',
        label: 'Red Wine',
        emoji: '🍷',
        brands: ['Barefoot', 'Sutter Home', 'Josh Cellars', 'Woodbridge', 'Apothic'],
        keywords: ['red wine', 'cabernet', 'merlot', 'pinot noir', 'red blend', 'shiraz', 'malbec'],
      },
      {
        key: 'wine_white',
        label: 'White Wine & Rosé',
        emoji: '🥂',
        brands: ['Barefoot', 'Kim Crawford', 'La Marca', 'Meiomi'],
        keywords: ['white wine', 'chardonnay', 'pinot grigio', 'sauvignon blanc', 'riesling', 'rose wine', 'prosecco', 'champagne'],
      },
    ],
  },

  // ── PACKAGED MEALS ─────────────────────────────────────────────────────────
  {
    key: 'packaged_meals',
    label: 'Packaged Meals',
    emoji: '📦',
    subcategories: [
      {
        key: 'mac_cheese',
        label: 'Mac & Cheese',
        emoji: '🧀',
        brands: ['Kraft', "Annie's", 'Velveeta', 'Banza'],
        keywords: ['mac and cheese', 'macaroni cheese', 'kraft mac', 'velveeta shells'],
      },
      {
        key: 'pasta',
        label: 'Pasta & Noodles',
        emoji: '🍝',
        brands: ['Barilla', "Mueller's", 'Ronzoni', 'De Cecco', 'Banza'],
        keywords: ['pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'farfalle', 'rotini', 'ziti', 'elbow macaroni'],
      },
      {
        key: 'rice',
        label: 'Rice & Grains',
        emoji: '🍚',
        brands: ["Uncle Ben's", 'Success', 'Minute Rice', "Zatarain's", 'Near East'],
        keywords: ['rice', 'instant rice', 'brown rice', 'jasmine rice', 'basmati rice', 'rice pilaf', 'quinoa'],
      },
      {
        key: 'ramen',
        label: 'Ramen & Instant Noodles',
        emoji: '🍜',
        brands: ['Maruchan', 'Nissin', 'Cup Noodles'],
        keywords: ['ramen', 'maruchan', 'cup noodles', 'instant noodle', 'top ramen'],
      },
      {
        key: 'helper_meals',
        label: 'Meal Helpers',
        emoji: '🍳',
        brands: ['Hamburger Helper', 'Knorr', 'Rice-A-Roni'],
        keywords: ['hamburger helper', 'knorr', 'rice a roni', 'pasta sides', 'idahoan mashed potato'],
      },
    ],
  },

  // ── CONDIMENTS ─────────────────────────────────────────────────────────────
  {
    key: 'condiments',
    label: 'Condiments',
    emoji: '🧂',
    subcategories: [
      {
        key: 'ketchup_mustard',
        label: 'Ketchup & Mustard',
        emoji: '🍅',
        brands: ['Heinz', "Hunt's", "French's", 'Grey Poupon', "Gulden's"],
        keywords: ['ketchup', 'mustard', 'yellow mustard', 'dijon mustard', 'spicy brown mustard'],
      },
      {
        key: 'mayonnaise',
        label: 'Mayonnaise & Spreads',
        emoji: '🫙',
        brands: ["Hellmann's", 'Kraft', "Duke's", 'Miracle Whip'],
        keywords: ['mayonnaise', 'mayo', 'miracle whip', 'aioli', 'spread'],
      },
      {
        key: 'salad_dressing',
        label: 'Salad Dressing',
        emoji: '🥗',
        brands: ['Hidden Valley', 'Kraft', "Newman's Own", "Ken's", 'Wishbone'],
        keywords: ['ranch', 'italian dressing', 'caesar dressing', 'balsamic', 'thousand island', 'blue cheese dressing', 'honey mustard dressing'],
      },
      {
        key: 'bbq_hot_sauce',
        label: 'BBQ & Hot Sauce',
        emoji: '🌶️',
        brands: ["Sweet Baby Ray's", 'Tabasco', "Frank's RedHot", 'Cholula', 'Sriracha'],
        keywords: ['bbq sauce', 'hot sauce', 'tabasco', "frank's red hot", 'cholula', 'sriracha', 'wing sauce'],
      },
      {
        key: 'soy_sauce',
        label: 'Soy Sauce & Asian',
        emoji: '🥢',
        brands: ['Kikkoman', 'La Choy', 'San-J'],
        keywords: ['soy sauce', 'teriyaki', 'stir fry sauce', 'oyster sauce', 'fish sauce', 'hoisin'],
      },
      {
        key: 'pickles_relish',
        label: 'Pickles & Relish',
        emoji: '🥒',
        brands: ['Vlasic', 'Claussen', 'Mt. Olive'],
        keywords: ['pickle', 'dill pickle', 'relish', 'sweet pickle', 'pickle spear'],
      },
      {
        key: 'steak_sauce',
        label: 'Steak & Worcestershire',
        emoji: '🥩',
        brands: ['A.1.', 'Heinz 57', 'Lea & Perrins'],
        keywords: ['steak sauce', 'a1', 'heinz 57', 'worcestershire'],
      },
    ],
  },
];

/**
 * Get subcategory for a product based on its name/brand
 */
export function getSubcategoryForProduct(product, aisleKey) {
  const aisle = AISLE_PROFILES.find(a => a.key === aisleKey);
  if (!aisle) return null;

  const name  = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const text  = `${name} ${brand}`;

  for (const sub of aisle.subcategories) {
    // Check brand match first
    if (sub.brands.some(b => brand.includes(b.toLowerCase()) || b.toLowerCase().includes(brand.split(' ')[0]))) {
      return sub;
    }
    // Check keyword match
    if (sub.keywords.some(k => text.includes(k.toLowerCase()))) {
      return sub;
    }
  }

  return aisle.subcategories[0]; // default to first subcategory
}

/**
 * Group products into subcategories for an aisle
 */
export function groupProductsBySubcategory(products, aisleKey) {
  const aisle = AISLE_PROFILES.find(a => a.key === aisleKey);
  if (!aisle) return [{ key: 'all', label: 'All Products', emoji: '🛒', products }];

  const groups = {};
  aisle.subcategories.forEach(sub => {
    groups[sub.key] = { ...sub, products: [] };
  });

  products.forEach(product => {
    const sub = getSubcategoryForProduct(product, aisleKey);
    if (sub && groups[sub.key]) {
      groups[sub.key].products.push(product);
    } else {
      // Add to first subcategory as fallback
      const firstKey = aisle.subcategories[0]?.key;
      if (firstKey && groups[firstKey]) {
        groups[firstKey].products.push(product);
      }
    }
  });

  // Only return subcategories that have products
  return Object.values(groups).filter(g => g.products.length > 0);
}