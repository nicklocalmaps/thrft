/**
 * Affiliate link configuration per store.
 * Replace the placeholder affiliate IDs with your real ones once approved.
 * 
 * URL builders return a tracking URL for each store.
 * If a store has no affiliate program yet, set it to null.
 */

// Your affiliate IDs - update these once you have approvals
const AFFILIATE_IDS = {
  amazon:       'thrft-20',           // Amazon Associates tag
  walmart:      'YOUR_WALMART_ID',    // CJ / Impact affiliate ID
  target:       'YOUR_TARGET_ID',     // Impact affiliate ID
  instacart:    'YOUR_INSTACART_ID',  // Instacart affiliate ID
  shipt:        'YOUR_SHIPT_ID',      // Shipt affiliate ID
};

/**
 * Returns an affiliate shopping URL for a given store.
 * @param {string} storeKey - The store key from storeConfig.js
 * @param {string[]} itemNames - List of item names to pre-fill search (optional)
 * @returns {string|null} - Affiliate URL or null if not supported
 */
export function getAffiliateUrl(storeKey, itemNames = []) {
  const searchQuery = itemNames.length > 0 ? encodeURIComponent(itemNames[0]) : '';

  switch (storeKey) {
    // --- Kroger family ---
    case 'kroger':
      return `https://www.kroger.com/search?query=${searchQuery}&fulfillment=ais`;
    case 'fred_meyer':
      return `https://www.fredmeyer.com/search?query=${searchQuery}`;
    case 'king_soopers':
      return `https://www.kingsoopers.com/search?query=${searchQuery}`;
    case 'city_market':
      return `https://www.citymarket.com/search?query=${searchQuery}`;
    case 'smiths':
      return `https://www.smithsfoodanddrug.com/search?query=${searchQuery}`;
    case 'harris_teeter':
      return `https://www.harristeeter.com/search?query=${searchQuery}`;
    case 'jewel_osco':
      return `https://www.jewelosco.com/search?query=${searchQuery}`;

    // --- Amazon Fresh (Associates) ---
    case 'amazon':
      return `https://www.amazon.com/s?k=${searchQuery}&i=amazonfresh&tag=${AFFILIATE_IDS.amazon}`;

    // --- Walmart ---
    case 'walmart':
      return AFFILIATE_IDS.walmart !== 'YOUR_WALMART_ID'
        ? `https://goto.walmart.com/c/${AFFILIATE_IDS.walmart}/walmart?u=https://www.walmart.com/search?q=${searchQuery}`
        : `https://www.walmart.com/search?q=${searchQuery}`;

    // --- Target ---
    case 'target':
      return AFFILIATE_IDS.target !== 'YOUR_TARGET_ID'
        ? `https://goto.target.com/c/${AFFILIATE_IDS.target}?u=https://www.target.com/s?searchTerm=${searchQuery}`
        : `https://www.target.com/s?searchTerm=${searchQuery}`;

    // --- Instacart (covers many stores) ---
    case 'publix':
      return `https://www.instacart.com/store/publix/search_page/${searchQuery}`;
    case 'aldi':
      return `https://www.instacart.com/store/aldi/search_page/${searchQuery}`;
    case 'costco':
      return `https://www.instacart.com/store/costco/search_page/${searchQuery}`;
    case 'safeway':
      return `https://www.instacart.com/store/safeway/search_page/${searchQuery}`;
    case 'albertsons':
      return `https://www.instacart.com/store/albertsons/search_page/${searchQuery}`;
    case 'whole_foods':
      return `https://www.amazon.com/s?k=${searchQuery}&i=wholefoods&tag=${AFFILIATE_IDS.amazon}`;
    case 'trader_joes':
      return `https://www.traderjoes.com/home/search?q=${searchQuery}`;
    case 'heb':
      return `https://www.heb.com/search/?q=${searchQuery}`;
    case 'meijer':
      return `https://www.meijer.com/shopping/search.html?search=${searchQuery}`;
    case 'wegmans':
      return `https://www.wegmans.com/search/#q=${searchQuery}`;
    case 'hyvee':
      return `https://www.hy-vee.com/search?search=${searchQuery}`;
    case 'giant_eagle':
      return `https://www.gianteagle.com/shop/search?searchQuery=${searchQuery}`;
    case 'stop_shop':
      return `https://stopandshop.com/pages/search-results?q=${searchQuery}`;
    case 'hannaford':
      return `https://www.hannaford.com/search.jsp?searchText=${searchQuery}`;
    case 'food_lion':
      return `https://www.foodlion.com/search?searchQuery=${searchQuery}`;
    case 'cvs':
      return `https://www.cvs.com/search?searchTerm=${searchQuery}`;
    case 'walgreens':
      return `https://www.walgreens.com/search/results.jsp?Ntt=${searchQuery}`;
    case 'vons':
      return `https://www.vons.com/shop/search-results.html?q=${searchQuery}`;
    case 'pavilions':
      return `https://www.pavilions.com/shop/search-results.html?q=${searchQuery}`;
    case 'stater_bros':
      return `https://www.staterbros.com/search?q=${searchQuery}`;
    case 'bristol_farms':
      return `https://www.bristolfarms.com/search?q=${searchQuery}`;
    case 'gelsons':
      return `https://www.gelsons.com/search?q=${searchQuery}`;
    case 'smart_final':
      return `https://www.smartandfinal.com/search?query=${searchQuery}`;
    case 'frys':
      return `https://www.frysfood.com/search?query=${searchQuery}`;
    case 'raleys':
      return `https://www.raleys.com/search?q=${searchQuery}`;
    case 'savemart':
      return `https://www.savemart.com/search?q=${searchQuery}`;
    case 'randalls':
      return `https://www.randalls.com/shop/search-results.html?q=${searchQuery}`;
    case 'tom_thumb':
      return `https://www.tomthumb.com/shop/search-results.html?q=${searchQuery}`;
    case 'schnucks':
      return `https://www.schnucks.com/product/search?q=${searchQuery}`;
    case 'shoprite':
      return `https://www.shoprite.com/sm/planning/rsid/3000/results?q=${searchQuery}`;
    case 'giant_food':
      return `https://giantfood.com/search?searchQuery=${searchQuery}`;
    case 'giant_martin':
      return `https://www.martinsfoods.com/search?searchQuery=${searchQuery}`;
    case 'winn_dixie':
      return `https://www.winndixie.com/search?q=${searchQuery}`;
    case 'lowes_foods':
      return `https://www.lowesfoods.com/search?q=${searchQuery}`;
    case 'fresh_market':
      return `https://www.thefreshmarket.com/search?q=${searchQuery}`;
    case 'market_basket':
      return `https://www.marketbasket.com`;
    case 'rouses':
      return `https://www.rouses.com/search?q=${searchQuery}`;
    case 'piggly_wiggly':
      return `https://www.pigglywiggly.com`;
    case 'acme':
      return `https://www.acmemarkets.com/shop/search-results.html?q=${searchQuery}`;
    case 'shoppers':
      return `https://www.shoppersfood.com/search?searchQuery=${searchQuery}`;
    case 'meijer':
      return `https://www.meijer.com/shopping/search.html?search=${searchQuery}`;

    default:
      return null;
  }
}

/**
 * Track an affiliate click event
 */
export function trackAffiliateClick(storeKey, storeName) {
  // Analytics tracking - logs the click for reporting
  if (typeof window !== 'undefined' && window.base44?.analytics) {
    window.base44.analytics.track({
      eventName: 'affiliate_link_clicked',
      properties: { store_key: storeKey, store_name: storeName },
    });
  }
}