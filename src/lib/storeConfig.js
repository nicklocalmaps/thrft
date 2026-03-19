// shipt: true = this store is a Shipt delivery partner
export const ALL_STORES = [
  // --- Kroger family (real API prices) ---
  { key: 'kroger',          name: 'Kroger',               region: 'National',      color: 'blue',    shipt: true  },
  { key: 'fred_meyer',      name: 'Fred Meyer',            region: 'Northwest',     color: 'lime',    shipt: true  },
  { key: 'king_soopers',    name: 'King Soopers',          region: 'Colorado',      color: 'blue',    shipt: true  },
  { key: 'city_market',     name: 'City Market',           region: 'Colorado',      color: 'green',   shipt: true  },
  { key: 'smiths',          name: "Smith's",               region: 'West',          color: 'emerald', shipt: true  },
  { key: 'harris_teeter',   name: 'Harris Teeter',         region: 'Southeast',     color: 'blue',    shipt: true  },
  { key: 'jewel_osco',      name: 'Jewel-Osco',            region: 'Midwest',       color: 'purple',  shipt: true  },

  // --- National ---
  { key: 'target',          name: 'Target',                region: 'National',      color: 'red',     shipt: true  },
  { key: 'walmart',         name: 'Walmart',               region: 'National',      color: 'yellow',  shipt: false },
  { key: 'amazon',          name: 'Amazon Fresh',          region: 'National',      color: 'orange',  shipt: false },
  { key: 'aldi',            name: 'Aldi',                  region: 'National',      color: 'teal',    shipt: false },
  { key: 'trader_joes',     name: "Trader Joe's",          region: 'National',      color: 'red',     shipt: false },
  { key: 'whole_foods',     name: 'Whole Foods',           region: 'National',      color: 'green',   shipt: false },
  { key: 'costco',          name: 'Costco',                region: 'National',      color: 'blue',    shipt: true  },
  { key: 'cvs',             name: 'CVS Pharmacy',          region: 'National',      color: 'red',     shipt: true  },
  { key: 'walgreens',       name: 'Walgreens',             region: 'National',      color: 'teal',    shipt: true  },

  // --- Southeast ---
  { key: 'publix',          name: 'Publix',                region: 'Southeast',     color: 'emerald', shipt: true  },
  { key: 'food_lion',       name: 'Food Lion',             region: 'Southeast',     color: 'red',     shipt: true  },
  { key: 'fresh_market',    name: 'The Fresh Market',      region: 'Southeast',     color: 'green',   shipt: true  },
  { key: 'winn_dixie',      name: 'Winn-Dixie',            region: 'Southeast',     color: 'indigo',  shipt: true  },
  { key: 'piggly_wiggly',   name: 'Piggly Wiggly',         region: 'Southeast',     color: 'pink',    shipt: true  },
  { key: 'rouses',          name: 'Rouses',                region: 'Gulf South',    color: 'amber',   shipt: true  },
  { key: 'lowes_foods',     name: "Lowes Foods",           region: 'Southeast',     color: 'red',     shipt: true  },

  // --- West / California ---
  { key: 'safeway',         name: 'Safeway',               region: 'West/Mid',      color: 'cyan',    shipt: true  },
  { key: 'albertsons',      name: 'Albertsons',            region: 'West',          color: 'purple',  shipt: true  },
  { key: 'vons',            name: 'Vons',                  region: 'So Cal',        color: 'blue',    shipt: true  },
  { key: 'pavilions',       name: 'Pavilions',             region: 'So Cal',        color: 'emerald', shipt: true  },
  { key: 'stater_bros',     name: 'Stater Bros',           region: 'So Cal',        color: 'orange',  shipt: true  },
  { key: 'bristol_farms',   name: 'Bristol Farms',         region: 'So Cal',        color: 'lime',    shipt: true  },
  { key: 'gelsons',         name: "Gelson's",              region: 'So Cal',        color: 'purple',  shipt: true  },
  { key: 'smart_final',     name: 'Smart & Final',         region: 'West',          color: 'amber',   shipt: true  },
  { key: 'frys',            name: "Fry's Food",            region: 'Arizona',       color: 'red',     shipt: true  },
  { key: 'raleys',          name: "Raley's",               region: 'No Cal/Nevada', color: 'cyan',    shipt: true  },
  { key: 'savemart',        name: 'Save Mart',             region: 'No Cal',        color: 'green',   shipt: true  },

  // --- Texas ---
  { key: 'heb',             name: 'H-E-B',                 region: 'Texas',         color: 'red',     shipt: true  },
  { key: 'randalls',        name: 'Randalls',              region: 'Texas',         color: 'rose',    shipt: true  },
  { key: 'tom_thumb',       name: 'Tom Thumb',             region: 'Texas',         color: 'blue',    shipt: true  },

  // --- Midwest ---
  { key: 'meijer',          name: 'Meijer',                region: 'Midwest',       color: 'indigo',  shipt: true  },
  { key: 'hyvee',           name: 'Hy-Vee',                region: 'Midwest',       color: 'rose',    shipt: true  },
  { key: 'giant_eagle',     name: 'Giant Eagle',           region: 'Midwest/NE',    color: 'amber',   shipt: true  },
  { key: 'schnucks',        name: 'Schnucks',              region: 'Midwest',       color: 'teal',    shipt: true  },
  { key: 'dierbergs',       name: "Dierbergs",             region: 'Midwest',       color: 'purple',  shipt: true  },
  { key: 'hornbachers',     name: "Hornbacher's",          region: 'Midwest',       color: 'cyan',    shipt: false },
  { key: 'hy_vee_aisles',   name: 'Hy-Vee Aisles Online', region: 'Midwest',       color: 'rose',    shipt: false },

  // --- Northeast ---
  { key: 'wegmans',         name: 'Wegmans',               region: 'Northeast',     color: 'orange',  shipt: true  },
  { key: 'stop_shop',       name: 'Stop & Shop',           region: 'Northeast',     color: 'cyan',    shipt: true  },
  { key: 'hannaford',       name: 'Hannaford',             region: 'Northeast',     color: 'teal',    shipt: true  },
  { key: 'market_basket',   name: 'Market Basket',         region: 'Northeast',     color: 'indigo',  shipt: false },
  { key: 'acme',            name: 'Acme Markets',          region: 'Northeast',     color: 'rose',    shipt: true  },
  { key: 'big_y',           name: 'Big Y',                 region: 'Northeast',     color: 'indigo',  shipt: false },
  { key: 'stew_leonards',   name: "Stew Leonard's",        region: 'Northeast',     color: 'emerald', shipt: false },
  { key: 'shoprite',        name: 'ShopRite',              region: 'Northeast',     color: 'orange',  shipt: true  },
  { key: 'giant_food',      name: 'Giant Food',            region: 'Mid-Atlantic',  color: 'red',     shipt: true  },
  { key: 'giant_martin',    name: 'Giant (Martin\'s)',     region: 'Mid-Atlantic',  color: 'blue',    shipt: true  },

  // --- Mid-Atlantic ---
  { key: 'shoppers',        name: 'Shoppers Food',         region: 'Mid-Atlantic',  color: 'teal',    shipt: true  },
  { key: 'detweilers',      name: "Detweiler's",           region: 'Mid-Atlantic',  color: 'teal',    shipt: false },

  // --- National/Misc ---
  { key: 'iga',             name: 'IGA',                   region: 'National',      color: 'red',     shipt: false },
  { key: 'foodland',        name: 'Foodland',              region: 'Hawaii',        color: 'amber',   shipt: false },
  { key: 'kta',             name: 'KTA Super Stores',      region: 'Hawaii',        color: 'orange',  shipt: false },
];

// Color palette per tailwind color name
export const COLOR_MAP = {
  blue:    { badge: 'bg-blue-100 text-blue-700 border-blue-200',    bar: 'from-blue-500 to-blue-600',     light: 'bg-blue-50',    border: 'border-blue-200',   shadow: 'shadow-blue-100'  },
  yellow:  { badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'from-amber-400 to-yellow-500',  light: 'bg-amber-50',   border: 'border-amber-200',  shadow: 'shadow-amber-100' },
  orange:  { badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'from-orange-500 to-orange-600', light: 'bg-orange-50', border: 'border-orange-200', shadow: 'shadow-orange-100' },
  teal:    { badge: 'bg-teal-100 text-teal-700 border-teal-200',    bar: 'from-teal-500 to-teal-600',     light: 'bg-teal-50',    border: 'border-teal-200',   shadow: 'shadow-teal-100'  },
  red:     { badge: 'bg-red-100 text-red-700 border-red-200',       bar: 'from-red-500 to-red-600',       light: 'bg-red-50',     border: 'border-red-200',    shadow: 'shadow-red-100'   },
  green:   { badge: 'bg-green-100 text-green-700 border-green-200', bar: 'from-green-500 to-green-600',   light: 'bg-green-50',   border: 'border-green-200',  shadow: 'shadow-green-100' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', shadow: 'shadow-emerald-100' },
  cyan:    { badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',    bar: 'from-cyan-500 to-cyan-600',     light: 'bg-cyan-50',    border: 'border-cyan-200',   shadow: 'shadow-cyan-100'  },
  purple:  { badge: 'bg-purple-100 text-purple-700 border-purple-200', bar: 'from-purple-500 to-purple-600', light: 'bg-purple-50', border: 'border-purple-200', shadow: 'shadow-purple-100' },
  indigo:  { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', bar: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200', shadow: 'shadow-indigo-100' },
  rose:    { badge: 'bg-rose-100 text-rose-700 border-rose-200',    bar: 'from-rose-500 to-rose-600',     light: 'bg-rose-50',    border: 'border-rose-200',   shadow: 'shadow-rose-100'  },
  lime:    { badge: 'bg-lime-100 text-lime-700 border-lime-200',    bar: 'from-lime-500 to-lime-600',     light: 'bg-lime-50',    border: 'border-lime-200',   shadow: 'shadow-lime-100'  },
  amber:   { badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'from-amber-500 to-amber-600',   light: 'bg-amber-50',   border: 'border-amber-200',  shadow: 'shadow-amber-100' },
  pink:    { badge: 'bg-pink-100 text-pink-700 border-pink-200',    bar: 'from-pink-500 to-pink-600',     light: 'bg-pink-50',    border: 'border-pink-200',   shadow: 'shadow-pink-100'  },
};

export function getStoreByKey(key) {
  return ALL_STORES.find(s => s.key === key);
}