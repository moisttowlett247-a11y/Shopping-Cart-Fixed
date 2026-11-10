/**
 * Official Walmart Add to Cart Proxy & Search Service
 * Uses Walmart's verified endpoint:
 * https://www.walmart.com/sc/cart/addToCart?items=ITEM_ID|QTY,ITEM_ID2|QTY
 */

import { CartItem, Product, Recipe, RecipeIngredient, BrandTierType } from '../types';

export function getWalmartSearchUrl(query: string): string {
  return `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
}

export function getWalmartItemDirectUrl(productName: string, brand?: string, itemId?: string): string {
  const combined = `${brand || ''} ${productName || ''}`.toLowerCase();
  if (itemId === '5328327386' || itemId === '10290804' || combined.includes('digiorno')) {
    return 'https://www.walmart.com/ip/DiGiorno-Frozen-Pizza-Rising-Crust-Ultimate-Pepperoni-with-Cheese-24-7-oz-Frozen/5328327386?classType=REGULAR&athbdg=L1102&from=/search';
  }
  if (itemId === '10450904' || combined.includes('maruchan')) {
    return 'https://www.walmart.com/ip/Maruchan-Instant-Lunch-Chicken-Flavor-Ramen-Noodle-Soup-2-25-oz/10450904';
  }
  if (itemId) {
    const slug = (productName || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `https://www.walmart.com/ip/${slug}/${itemId}`;
  }
  const fullSearch = `${brand ? brand + ' ' : ''}${productName}`;
  return getWalmartSearchUrl(fullSearch);
}

/**
 * Official Walmart Add-to-Cart endpoint format
 * e.g. https://www.walmart.com/sc/cart/addToCart?items=36179444|2
 */
export function getWalmartAddToCartUrl(itemId?: string, quantity = 1, fallbackQuery?: string): string {
  let effectiveId = itemId;
  if (effectiveId === '10290804') {
    effectiveId = '5328327386';
  }
  if (effectiveId) {
    return `https://www.walmart.com/sc/cart/addToCart?items=${effectiveId}|${quantity}`;
  }
  return getWalmartSearchUrl(fallbackQuery || 'groceries');
}

/**
 * Generates direct Walmart Add-to-Cart batch URL and itemized transfer list
 */
export function generateWalmartCartManifest(cartItems: CartItem[]): {
  transferItems: {
    name: string;
    brand: string;
    quantity: number;
    price: number;
    itemId?: string;
    walmartUrl: string;
    walmartAddToCartUrl: string;
  }[];
  primaryWalmartCartUrl: string;
} {
  const transferItems = cartItems.map((item) => {
    const query = `${item.tierDetails.brand} ${item.tierDetails.productName}`;
    const directUrl = getWalmartItemDirectUrl(
      item.tierDetails.productName,
      item.tierDetails.brand,
      item.tierDetails.walmartItemId
    );
    const addToCartUrl = getWalmartAddToCartUrl(
      item.tierDetails.walmartItemId,
      item.quantity,
      query
    );

    return {
      name: item.tierDetails.productName,
      brand: item.tierDetails.brand,
      quantity: item.quantity,
      price: item.tierDetails.price,
      itemId: item.tierDetails.walmartItemId,
      walmartUrl: directUrl,
      walmartAddToCartUrl: addToCartUrl,
    };
  });

  // Extract items with valid Walmart Item IDs
  const itemsWithIds = cartItems.filter((i) => i.tierDetails.walmartItemId);

  let primaryWalmartCartUrl = 'https://www.walmart.com/cart';
  if (itemsWithIds.length > 0) {
    // Official Walmart Add-to-Cart format: items=ID|QTY,ID2|QTY
    const param = itemsWithIds.map((i) => `${i.tierDetails.walmartItemId}|${i.quantity}`).join(',');
    primaryWalmartCartUrl = `https://www.walmart.com/sc/cart/addToCart?items=${param}`;
  } else if (cartItems.length > 0) {
    primaryWalmartCartUrl = getWalmartSearchUrl(cartItems[0].productName);
  }

  return {
    transferItems,
    primaryWalmartCartUrl,
  };
}

/**
 * Helper to build official Walmart Add to Cart URL for an entire recipe
 */
export function getRecipeWalmartCartUrl(
  ingredients: RecipeIngredient[],
  products: Product[],
  getItemTier: (prodId: string, def?: BrandTierType) => BrandTierType
): string {
  const itemParams: string[] = [];

  ingredients.forEach((ing) => {
    if (ing.checked === false) return;
    const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
    if (prod) {
      const tier = getItemTier(prod.id, ing.selectedTier || prod.defaultTier);
      const tierInfo = prod.tiers[tier];
      if (tierInfo?.walmartItemId) {
        itemParams.push(`${tierInfo.walmartItemId}|1`);
      }
    }
  });

  if (itemParams.length > 0) {
    return `https://www.walmart.com/sc/cart/addToCart?items=${itemParams.join(',')}`;
  }

  return 'https://www.walmart.com/cart';
}
