import { base44 } from '@/api/base44Client';
import { BRANDS } from '@/lib/productCatalog';

// Build a set of known popular brand names (normalized to lowercase) from our curated catalog
const POPULAR_BRAND_NAMES = new Set(
  BRANDS.flatMap(b => [
    b.label.toLowerCase(),
    b.search?.toLowerCase(),
    // also split multi-word brand labels to catch partial matches
    ...b.label.toLowerCase().split(/[\s,&]+/),
  ]).filter(Boolean)
);

/**
 * Returns true if the product's brand is in our popular brands catalog.
 * If `searchQuery` is provided and closely matches the brand, we allow it through
 * even if it's not in the catalog (user specifically searched for it).
 */
function isPopularBrand(product, searchQuery = '') {
  const rawBrands = (product.brands || '').split(',').map(b => b.trim().toLowerCase());
  const queryLower = searchQuery.toLowerCase();

  for (const brand of rawBrands) {
    if (!brand) continue;
    // Brand is in our popular catalog
    if (POPULAR_BRAND_NAMES.has(brand)) return true;
    // Brand words are all in our catalog (handles slight variations)
    const words = brand.split(/\s+/);
    if (words.some(w => w.length > 3 && POPULAR_BRAND_NAMES.has(w))) return true;
    // User specifically searched for this brand name
    if (queryLower.length >= 3 && brand.includes(queryLower)) return true;
    if (queryLower.length >= 3 && queryLower.includes(brand)) return true;
  }
  return false;
}

/**
 * Filter a list of OFF products to only include popular/known brands.
 * If no popular brands are found, returns top results as fallback (avoid empty state).
 */
export function filterByPopularity(products, searchQuery = '') {
  const popular = products.filter(p => isPopularBrand(p, searchQuery));
  // Fallback: if nothing passes the filter, return top 8 results so the UI isn't empty
  return popular.length > 0 ? popular : products.slice(0, 8);
}

// Map our category keys to OpenFoodFacts category tags + search terms
export const CATEGORY_SEARCH_CONFIG = {
  produce: { offCategory: 'fruits-and-vegetables', searchTerms: ['fresh produce vegetables fruits'] },
  bread: { offCategory: 'breads', searchTerms: ['bread loaf sandwich'] },
  eggs_dairy: { offCategory: 'dairy', searchTerms: ['milk eggs dairy'] },
  cheese: { offCategory: 'cheeses', searchTerms: ['cheese shredded sliced'] },
  meat: { offCategory: 'meats', searchTerms: ['chicken beef pork ground'] },
  seafood: { offCategory: 'seafood', searchTerms: ['fish salmon shrimp seafood'] },
  deli: { offCategory: 'deli', searchTerms: ['deli prepared foods hummus'] },
  frozen: { offCategory: 'frozen-foods', searchTerms: ['frozen pizza nuggets waffles'] },
  cereal: { offCategory: 'breakfast-cereals', searchTerms: ['cereal oatmeal breakfast'] },
  snacks: { offCategory: 'snacks', searchTerms: ['chips crackers snacks pretzels'] },
  cookies: { offCategory: 'biscuits-and-cakes', searchTerms: ['cookies brownies cake dessert'] },
  candy: { offCategory: 'candies', searchTerms: ['candy chocolate gummies'] },
  beverages: { offCategory: 'beverages', searchTerms: ['soda juice water drinks'] },
  canned: { offCategory: 'canned-foods', searchTerms: ['canned beans tomatoes soup broth'] },
  pasta_rice: { offCategory: 'pasta', searchTerms: ['pasta rice grains noodles'] },
  baking: { offCategory: 'baking', searchTerms: ['flour sugar baking mix'] },
  condiments: { offCategory: 'condiments', searchTerms: ['ketchup mustard sauce dressing'] },
  spices: { offCategory: 'spices-and-seasonings', searchTerms: ['spices seasoning salt pepper'] },
  oils: { offCategory: 'oils-and-fats', searchTerms: ['olive oil vegetable oil vinegar'] },
  international: { offCategory: 'ethnic-foods', searchTerms: ['Mexican Asian Indian international'] },
  packaged_meals: { offCategory: 'prepared-meals', searchTerms: ['boxed meals mac cheese helper'] },
  baby: { offCategory: 'baby-foods', searchTerms: ['baby food formula diapers wipes'] },
  pet: { offCategory: 'pet-food', searchTerms: ['dog food cat food pet'] },
  cleaning: { offCategory: 'cleaning-products', searchTerms: ['laundry dish soap cleaner trash bags'] },
  personal_care: { offCategory: 'beauty', searchTerms: ['shampoo soap deodorant toothpaste'] },
  health: { offCategory: 'dietary-supplements', searchTerms: ['vitamins supplements medicine'] },
  breakfast: { offCategory: 'breakfasts', searchTerms: ['breakfast sausage bacon hash browns'] },
  yogurt: { offCategory: 'yogurts', searchTerms: ['yogurt Greek Chobani Fage'] },
  alcohol: { offCategory: 'beers', searchTerms: ['beer wine seltzer'] },
};

// Fetch products from OpenFoodFacts for a given category
export async function fetchCategoryProducts(categoryKey, page = 1) {
  const config = CATEGORY_SEARCH_CONFIG[categoryKey];
  if (!config) return [];

  try {
    const url = `https://world.openfoodfacts.org/category/${config.offCategory}.json?page=${page}&page_size=48&fields=product_name,brands,image_front_small_url,quantity,categories_tags,_id`;
    const res = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name && p.brands);
    return filterByPopularity(products);
  } catch {
    return [];
  }
}

// Search OpenFoodFacts for specific term
export async function searchProducts(query, page = 1) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=48&fields=product_name,brands,image_front_small_url,quantity,_id`;
    const res = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name);
    return filterByPopularity(products, query);
  } catch {
    return [];
  }
}

// Fetch variants/sizes for a specific brand+product
export async function fetchProductVariants(brandName, productBaseName) {
  try {
    const query = `${brandName} ${productBaseName}`;
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=30&fields=product_name,brands,image_front_small_url,quantity,_id`;
    const res = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name && p.brands);
    // For variant fetches the user knows the brand, so pass brand name as query to allow it through
    return filterByPopularity(products, brandName);
  } catch {
    return [];
  }
}

// Group products by brand
export function groupByBrand(products) {
  const map = {};
  for (const p of products) {
    const brand = (p.brands || 'Generic').split(',')[0].trim();
    if (!map[brand]) map[brand] = { brand, products: [], image: p.image_front_small_url };
    map[brand].products.push(p);
    if (!map[brand].image && p.image_front_small_url) map[brand].image = p.image_front_small_url;
  }
  return Object.values(map).sort((a, b) => b.products.length - a.products.length);
}

// AI fill-in for gaps when OFF returns too few results
export async function aiFillProducts(categoryLabel, brandName) {
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `List 15 real grocery products in the "${categoryLabel}" category${brandName ? ` specifically from the brand "${brandName}"` : ''}, sold at Walmart, Kroger, or Amazon Fresh. Include different flavors, sizes, and varieties. Return ONLY valid JSON, no explanation.`,
      response_json_schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                brands: { type: 'string' },
                quantity: { type: 'string' },
              },
            },
          },
        },
      },
    });
    return res.products || [];
  } catch {
    return [];
  }
}