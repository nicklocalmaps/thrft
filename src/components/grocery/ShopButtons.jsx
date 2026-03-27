import { ExternalLink, Store, Car, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Build a store's own online ordering / pickup URL for a specific item search
function getStoreOrderUrl(storeKey, searchQuery, mode) {
  const q = encodeURIComponent(searchQuery);

  // Stores with their own pickup/delivery ordering sites
  const ownOrderingUrl = {
    kroger:        `https://www.kroger.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    fred_meyer:    `https://www.fredmeyer.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    king_soopers:  `https://www.kingsoopers.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    city_market:   `https://www.citymarket.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    smiths:        `https://www.smithsfoodanddrug.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    harris_teeter: `https://www.harristeeter.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    jewel_osco:    `https://www.jewelosco.com/search?query=${q}&fulfillment=${mode === 'pickup' ? 'PICKUP' : 'DELIVERY'}`,
    walmart:       `https://www.walmart.com/search?q=${q}&affinityOverride=${mode === 'pickup' ? 'store_pickup' : 'delivery'}`,
    target:        `https://www.target.com/s?searchTerm=${q}&fulfillment=${mode === 'pickup' ? 'Store+Pickup' : 'Delivery'}`,
    amazon:        `https://www.amazon.com/s?k=${q}&i=amazonfresh`,
    whole_foods:   `https://www.amazon.com/s?k=${q}&i=wholefoods`,
    heb:           `https://www.heb.com/search/?q=${q}`,
    meijer:        `https://www.meijer.com/shopping/search.html?search=${q}`,
    hyvee:         `https://www.hy-vee.com/search?search=${q}`,
    wegmans:       `https://www.wegmans.com/search/#q=${q}`,
    giant_eagle:   `https://www.gianteagle.com/shop/search?searchQuery=${q}`,
    stop_shop:     `https://stopandshop.com/pages/search-results?q=${q}`,
    hannaford:     `https://www.hannaford.com/search.jsp?searchText=${q}`,
    food_lion:     `https://www.foodlion.com/search?searchQuery=${q}`,
    safeway:       `https://www.safeway.com/shop/search-results.html?q=${q}`,
    albertsons:    `https://www.albertsons.com/shop/search-results.html?q=${q}`,
    vons:          `https://www.vons.com/shop/search-results.html?q=${q}`,
    pavilions:     `https://www.pavilions.com/shop/search-results.html?q=${q}`,
    acme:          `https://www.acmemarkets.com/shop/search-results.html?q=${q}`,
    randalls:      `https://www.randalls.com/shop/search-results.html?q=${q}`,
    tom_thumb:     `https://www.tomthumb.com/shop/search-results.html?q=${q}`,
    giant_food:    `https://giantfood.com/search?searchQuery=${q}`,
    giant_martin:  `https://www.martinsfoods.com/search?searchQuery=${q}`,
    winn_dixie:    `https://www.winndixie.com/search?q=${q}`,
    lowes_foods:   `https://www.lowesfoods.com/search?q=${q}`,
    shoprite:      `https://www.shoprite.com/sm/planning/rsid/3000/results?q=${q}`,
    stater_bros:   `https://www.staterbros.com/search?q=${q}`,
    frys:          `https://www.frysfood.com/search?query=${q}`,
    raleys:        `https://www.raleys.com/search?q=${q}`,
    savemart:      `https://www.savemart.com/search?q=${q}`,
    schnucks:      `https://www.schnucks.com/product/search?q=${q}`,
    publix:        `https://www.publix.com/shop-online/search-results?searchText=${q}`,
    aldi:          `https://www.aldi.us/en/search/?q=${q}`,
    costco:        `https://www.costco.com/CatalogSearch?keyword=${q}`,
    trader_joes:   `https://www.traderjoes.com/home/search?q=${q}`,
    fresh_market:  `https://www.thefreshmarket.com/search?q=${q}`,
    rouses:        `https://www.rouses.com/search?q=${q}`,
    market_basket: `https://www.marketbasket.com`,
    piggly_wiggly: `https://www.pigglywiggly.com`,
    shoppers:      `https://www.shoppersfood.com/search?searchQuery=${q}`,
  };

  return ownOrderingUrl[storeKey] || null;
}

// Instacart URL for a store + item search
function getInstacartUrl(storeKey, searchQuery) {
  const q = encodeURIComponent(searchQuery);
  const instacartSlugs = {
    publix: 'publix', aldi: 'aldi', safeway: 'safeway', albertsons: 'albertsons',
    costco: 'costco', whole_foods: 'whole-foods', kroger: 'kroger', target: 'target',
    walmart: 'walmart', heb: 'h-e-b', meijer: 'meijer', giant_eagle: 'giant-eagle',
    food_lion: 'food-lion', harris_teeter: 'harris-teeter', giant_food: 'giant-food',
    shoprite: 'shoprite', winn_dixie: 'winn-dixie', fred_meyer: 'fred-meyer',
    king_soopers: 'king-soopers', stop_shop: 'stop-and-shop', jewel_osco: 'jewel-osco',
    wegmans: 'wegmans', hannaford: 'hannaford', vons: 'vons', pavilions: 'pavilions',
    acme: 'acme', safeway: 'safeway', raleys: 'raleys', fresh_market: 'the-fresh-market',
    trader_joes: 'trader-joes', lowes_foods: 'lowes-foods',
  };
  const slug = instacartSlugs[storeKey];
  if (!slug) return null;
  return `https://www.instacart.com/store/${slug}/search_page/${encodeURIComponent(searchQuery)}`;
}

// Shipt URL
function getShiptUrl(storeKey, searchQuery) {
  const q = encodeURIComponent(searchQuery);
  return `https://www.shipt.com/shop/search?query=${q}`;
}

export default function ShopButtons({ storeKey, storeName, items = [], shoppingMethod, storeData }) {
  const inStockItems = items.filter(i => i.in_stock !== false);
  // Build a combined search query from all item names
  const primaryQuery = inStockItems.map(i => i.product_name || i.item_name || i.name).filter(Boolean)[0] || '';
  const allItemsQuery = inStockItems.map(i => i.product_name || i.item_name || i.name).filter(Boolean).join(', ');

  const showPickup = shoppingMethod === 'pickup' || shoppingMethod === 'all' || !shoppingMethod;
  const showDelivery = shoppingMethod === 'delivery' || shoppingMethod === 'all' || !shoppingMethod;

  const pickupAvailable = storeData?.pickup_available ?? false;
  const instacartAvailable = storeData?.instacart_available ?? false;
  const shiptAvailable = storeData?.shipt_available ?? false;

  const handleOpen = (url, method) => {
    base44.analytics.track({
      eventName: 'shop_button_clicked',
      properties: { store_key: storeKey, store_name: storeName, method },
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const instoreUrl = getStoreOrderUrl(storeKey, primaryQuery, 'instore');
  const pickupUrl = getStoreOrderUrl(storeKey, primaryQuery, 'pickup');
  const instacartUrl = getInstacartUrl(storeKey, primaryQuery);
  const shiptUrl = getShiptUrl(storeKey, primaryQuery);

  // Always show in-store; show pickup/delivery based on method & availability
  const buttons = [];

  if (instoreUrl) {
    buttons.push({
      label: 'Shop In-Store',
      icon: Store,
      url: instoreUrl,
      method: 'instore',
      style: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    });
  }

  if (showPickup && pickupAvailable && pickupUrl) {
    buttons.push({
      label: 'Curbside Pickup',
      icon: Car,
      url: pickupUrl,
      method: 'pickup',
      style: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    });
  }

  if (showDelivery && instacartAvailable && instacartUrl) {
    buttons.push({
      label: 'Order on Instacart',
      icon: Truck,
      url: instacartUrl,
      method: 'instacart',
      style: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    });
  }

  if (showDelivery && shiptAvailable && shiptUrl) {
    buttons.push({
      label: 'Order on Shipt',
      icon: Truck,
      url: shiptUrl,
      method: 'shipt',
      style: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    });
  }

  if (buttons.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-3">
      <p className="text-xs text-slate-400 font-medium mb-1">Shop this list at {storeName}:</p>
      {buttons.map(({ label, icon: Icon, url, method, style }) => (
        <button
          key={method}
          onClick={() => handleOpen(url, method)}
          className={`w-full flex items-center justify-between gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${style}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>
      ))}
      <p className="text-xs text-slate-400 leading-tight pt-0.5">
        Opens {storeName}'s website — search for each item and add to your cart.
      </p>
    </div>
  );
}