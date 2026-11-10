/**
 * Data models for SparkStore Walmart Dark shopping & recipe engine
 */

export type BrandTierType = 'name_brand' | 'great_value' | 'organic';

export interface TierOption {
  brand: string;
  productName: string;
  price: number;
  originalPrice?: number;
  packageSize: string;
  badge?: string;
  image?: string;
  walmartItemId?: string;
  walmartUrl?: string;
  walmartAddToCartUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'grocery' | 'essentials' | 'personal_care' | 'home_electronics';
  department: string;
  description: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  defaultTier: BrandTierType;
  tiers: {
    name_brand: TierOption;
    great_value: TierOption;
    organic: TierOption;
  };
}

export interface CartItem {
  cartItemId: string; // unique per product + tier
  productId: string;
  productName: string;
  department: string;
  selectedTier: BrandTierType;
  tierDetails: TierOption;
  quantity: number;
  image: string;
}

export interface RecipeIngredient {
  id: string;
  rawName: string;
  matchedProductId?: string;
  amount: string;
  unit: string;
  selectedTier: BrandTierType;
  estimatedPrice: number;
  checked: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty?: 'Easy' | 'Medium' | 'Chef Level';
  sourceType: 'curated' | 'ai_generated' | 'web_link' | 'raw_ingredients';
  sourceUrl?: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  createdAt: number;
}

export type OrderStatus = 'placed' | 'picked' | 'out_for_delivery' | 'delivered';

export interface OrderItem {
  productName: string;
  brand: string;
  tier: BrandTierType;
  quantity: number;
  price: number;
  image: string;
  walmartItemId?: string;
  walmartUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  savings: number;
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  fulfillmentType: 'delivery' | 'pickup';
  storeNumber: string;
  storeName: string;
  estimatedDelivery: string;
  shopperName: string;
  driverName?: string;
}
