/**
 * slideData.js — WillieSlideshow slide definitions for every page.
 *
 * Each slide shape:
 * {
 *   willie: string,             // key from WILLIE_IMAGES in WillieSlideshow.jsx
 *   title: string,
 *   body: string,
 *   williePosition?: 'left' | 'right',   // default 'right'
 *   accent?: string,                      // tailwind bg class e.g. 'bg-emerald-500'
 * }
 */

export const HOME_SLIDES = [
  {
    willie: 'willie_waving',
    title: 'Welcome to THRFT!',
    body: 'Your grocery lists live here. Tap "New List" to start comparing prices across 50+ stores.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_pointing_right',
    title: 'See Your Savings',
    body: 'After comparing prices, the dashboard shows you exactly how much you saved vs. the priciest store.',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const NEWLIST_SLIDES = [
  {
    willie: 'willie_pointing_up',
    title: 'Name Your List',
    body: 'Give it a name like "Weekly Groceries" or "BBQ Party", then add items below.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_reading',
    title: 'Be Specific!',
    body: 'The more specific you are — "Minute Maid OJ 52oz" vs just "orange juice" — the more accurate the prices.',
    williePosition: 'left',
    accent: 'bg-amber-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'Compare & Save',
    body: 'Hit "Save & Compare Prices" and THRFT will search every store for the best deal on your entire list.',
    williePosition: 'right',
    accent: 'bg-emerald-500',
  },
];

export const LISTDETAIL_SLIDES = [
  {
    willie: 'willie_pointing_right',
    title: 'Your List is Ready!',
    body: 'Add items, pick your stores, then tap "Compare Prices" to find the cheapest place to shop.',
    williePosition: 'left',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'Shop Mode',
    body: 'Heading to the store? Tap "Shop Mode" to check off items as you grab them from the shelves.',
    williePosition: 'right',
    accent: 'bg-emerald-500',
  },
];

export const SHOP_SLIDES = [
  {
    willie: 'willie_pointing_up',
    title: 'Browse the Store',
    body: 'Search for products or tap any aisle on the right to browse by category — just like a real store!',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_both_arms',
    title: 'Add to Your Cart',
    body: 'Tap any product to add it to your cart, then compare prices across all stores when you\'re done.',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const BUDGET_SLIDES = [
  {
    willie: 'willie_reading',
    title: 'Set Your Budget',
    body: 'Enter a monthly grocery budget and a per-trip target. THRFT will track your spending automatically.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'AI Smart Tips',
    body: 'Tap "Get My Tips" for personalized savings advice based on your real shopping history.',
    williePosition: 'left',
    accent: 'bg-amber-500',
  },
];

export const COUPONS_SLIDES = [
  {
    willie: 'willie_pointing_up',
    title: 'Scan Paper Coupons',
    body: 'Photograph any paper coupon and AI will read the details — discount, expiry, and product name.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_pointing_right',
    title: 'Add to Your List',
    body: 'Tap "Add to List" on any coupon to automatically add the matching product to your grocery list.',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const ONBOARDING_SLIDES = [
  {
    willie: 'willie_waving',
    title: 'Hi, I\'m Willie! 🦉',
    body: 'I\'m here to help you save money on groceries. Let\'s find the stores near you to get started!',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'You\'re Almost In!',
    body: 'Select the stores you shop at — they\'ll be pre-selected every time you compare prices.',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const STORES_SLIDES = [
  {
    willie: 'willie_pointing_right',
    title: 'Your Store Accounts',
    body: 'Save your loyalty card numbers here so you never forget them at checkout.',
    williePosition: 'left',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_reading',
    title: 'Change Your Zip',
    body: 'Moved or visiting somewhere new? Update your zip code to find stores in a different area.',
    williePosition: 'right',
    accent: 'bg-amber-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'Set Shopping Preference',
    body: 'Choose whether you prefer in-store, curbside pickup, or delivery — applied to all new lists.',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const SEARCHPRODUCTS_SLIDES = [
  {
    willie: 'willie_pointing_up',
    title: 'Search Products',
    body: 'Type any product name or brand to search our database. Use Browse to explore by category.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_pointing_right',
    title: 'Add to Your List',
    body: 'Found what you need? Tap "Add" and it goes straight to your grocery list — ready to compare!',
    williePosition: 'left',
    accent: 'bg-emerald-500',
  },
];

export const INVITEFRIENDS_SLIDES = [
  {
    willie: 'willie_both_arms',
    title: 'Invite Friends & Earn!',
    body: 'Share your referral link and earn points every time a friend signs up or subscribes.',
    williePosition: 'right',
    accent: 'bg-blue-500',
  },
  {
    willie: 'willie_thumbs',
    title: 'Unlock Free Months',
    body: '5 paid referrals = THRFT free forever! Check your progress in the Rewards section.',
    williePosition: 'left',
    accent: 'bg-amber-500',
  },
];