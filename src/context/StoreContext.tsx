import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, BrandTierType, Recipe, Order, RecipeIngredient } from '../types';
import { MOCK_CATALOG } from '../data/mockCatalog';
import { INITIAL_RECIPES } from '../data/mockRecipes';

interface StoreContextType {
  products: Product[];
  recipes: Recipe[];
  cart: CartItem[];
  brandPreferences: Record<string, BrandTierType>;
  globalBrandPreference: 'none' | BrandTierType;
  selectedCategory: string;
  searchQuery: string;
  activeTab: 'browse' | 'recipes' | 'orders' | 'deals';
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isUploadRecipeOpen: boolean;
  selectedRecipe: Recipe | null;
  orders: Order[];
  activeTrackingOrder: Order | null;
  toast: { message: string; subtext?: string; type?: 'success' | 'info' | 'tier' } | null;

  // Actions
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'browse' | 'recipes' | 'orders' | 'deals') => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsUploadRecipeOpen: (open: boolean) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Cart operations
  addToCart: (product: Product, tierOverride?: BrandTierType, quantity?: number) => void;
  addRecipeIngredientsToCart: (recipe: Recipe, activeIngredients?: RecipeIngredient[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  switchCartItemTier: (cartItemId: string, newTier: BrandTierType) => void;
  clearCart: () => void;

  // Brand Tier Preference operations
  setItemBrandPreference: (productId: string, tier: BrandTierType) => void;
  getItemBrandTier: (productId: string, defaultTier?: BrandTierType) => BrandTierType;
  setGlobalBrandPreference: (pref: 'none' | BrandTierType) => void;

  // Recipe operations
  addCustomRecipe: (recipe: Recipe) => void;

  // Orders
  placeOrder: (orderData: Partial<Order>) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  trackOrderById: (orderIdOrNumber: string) => Promise<boolean>;

  // Calculations
  cartCount: number;
  cartSubtotal: number;
  cartSavings: number;
  cartTax: number;
  cartTotal: number;
  freeShippingProgress: number; // 0 to 100 based on $35 threshold
  freeShippingRemaining: number;
  showToast: (message: string, subtext?: string, type?: 'success' | 'info' | 'tier') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const BRAND_PREFS_KEY = 'spark_brand_preferences_v1';
const GLOBAL_PREF_KEY = 'spark_global_brand_pref_v1';
const CUSTOM_RECIPES_KEY = 'spark_custom_recipes_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_CATALOG);
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_RECIPES_KEY);
      if (saved) {
        const parsed: Recipe[] = JSON.parse(saved);
        const initialIds = new Set(INITIAL_RECIPES.map((r) => r.id));
        const customOnly = parsed.filter((r) => !initialIds.has(r.id));
        return [...INITIAL_RECIPES, ...customOnly];
      }
    } catch (e) {
      console.warn('Failed to load custom recipes from localStorage', e);
    }
    return INITIAL_RECIPES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('spark_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [brandPreferences, setBrandPreferences] = useState<Record<string, BrandTierType>>(() => {
    try {
      const saved = localStorage.getItem(BRAND_PREFS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [globalBrandPreference, setGlobalBrandPreferenceState] = useState<'none' | BrandTierType>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_PREF_KEY);
      return (saved as any) || 'none';
    } catch {
      return 'none';
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'browse' | 'recipes' | 'orders' | 'deals'>('recipes');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUploadRecipeOpen, setIsUploadRecipeOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const [toast, setToast] = useState<{ message: string; subtext?: string; type?: 'success' | 'info' | 'tier' } | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spark_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Load orders from server on startup
  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message: string, subtext?: string, type: 'success' | 'info' | 'tier' = 'success') => {
    setToast({ message, subtext, type });
    setTimeout(() => {
      setToast(null);
    }, 4200);
  };

  // Determine current effective tier for a product (Item preference > Global preference > Product default)
  const getItemBrandTier = (productId: string, defaultTier: BrandTierType = 'great_value'): BrandTierType => {
    if (brandPreferences[productId]) {
      return brandPreferences[productId];
    }
    if (globalBrandPreference !== 'none') {
      return globalBrandPreference;
    }
    return defaultTier;
  };

  // Update item-level preference and persist
  const setItemBrandPreference = (productId: string, tier: BrandTierType) => {
    const updated = { ...brandPreferences, [productId]: tier };
    setBrandPreferences(updated);
    try {
      localStorage.setItem(BRAND_PREFS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save brand preferences', e);
    }

    const prod = products.find((p) => p.id === productId);
    const tierLabel = tier === 'great_value' ? 'Great Value' : tier === 'organic' ? 'Organic' : 'Name Brand';
    showToast(
      `Saved Preference: ${tierLabel}`,
      `${prod ? prod.name : 'Item'} will default to ${tierLabel} in recipes & shopping.`,
      'tier'
    );
  };

  const setGlobalBrandPreference = (pref: 'none' | BrandTierType) => {
    setGlobalBrandPreferenceState(pref);
    try {
      localStorage.setItem(GLOBAL_PREF_KEY, pref);
    } catch (e) {
      console.warn('Failed to save global brand pref', e);
    }
    const label = pref === 'great_value' ? 'Great Value' : pref === 'organic' ? 'Organic' : pref === 'name_brand' ? 'Name Brand' : 'Individual Item Defaults';
    showToast(`Storewide Default Set`, `Now prioritizing ${label} across all items without custom overrides.`, 'info');
  };

  // Add custom recipe
  const addCustomRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const updated = [recipe, ...prev];
      try {
        const customOnly = updated.filter((r) => r.sourceType !== 'curated');
        localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist custom recipes', e);
      }
      return updated;
    });
    showToast('Recipe Added to Your Cookbook', `"${recipe.title}" is ready for 1-click carting!`, 'success');
  };

  // Add single product to cart
  const addToCart = (product: Product, tierOverride?: BrandTierType, quantity = 1) => {
    const tier = tierOverride || getItemBrandTier(product.id, product.defaultTier);
    const tierData = product.tiers[tier];
    const cartItemId = `${product.id}__${tier}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        productName: product.name,
        department: product.department,
        selectedTier: tier,
        tierDetails: tierData,
        quantity,
        image: product.image,
      };
      return [...prev, newItem];
    });

    const tierName = tier === 'great_value' ? 'Great Value' : tier === 'organic' ? 'Organic' : 'Name Brand';
    showToast(`Added to Cart (${tierName})`, `${product.name} · $${tierData.price.toFixed(2)}`, 'success');
  };

  // 1-Click Recipe Ingredients Carting
  const addRecipeIngredientsToCart = (recipe: Recipe, activeIngredients?: RecipeIngredient[]) => {
    const ingredientsToAdd = (activeIngredients || recipe.ingredients).filter((ing) => ing.checked !== false);
    if (!ingredientsToAdd.length) {
      showToast('No Ingredients Selected', 'Please check at least one ingredient to add.', 'info');
      return;
    }

    let itemsAddedCount = 0;
    let addedSubtotal = 0;

    setCart((prev) => {
      let updatedCart = [...prev];

      ingredientsToAdd.forEach((ing) => {
        // Find catalog product if matched
        let product = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;

        // If not matched by ID, try name matching with priority for verified Walmart items
        if (!product) {
          const lower = ing.rawName.toLowerCase();
          if (lower.includes('digiorno') || lower.includes('pizza') || lower.includes('10290804') || lower.includes('5328327386')) {
            product = products.find((p) => p.id === 'prod-digiorno-pizza');
          } else if (lower.includes('maruchan') || lower.includes('ramen') || lower.includes('10450904')) {
            product = products.find((p) => p.id === 'prod-maruchan-ramen');
          } else {
            product = products.find((p) => lower.includes(p.name.toLowerCase().split(' ')[0]) || p.slug.split('-').some((s) => lower.includes(s)));
          }
        }

        if (product) {
          // Respect user's saved brand tier preference for this item!
          const tier = getItemBrandTier(product.id, ing.selectedTier || product.defaultTier);
          const tierData = product.tiers[tier];
          const cartItemId = `${product.id}__${tier}`;

          const existingIndex = updatedCart.findIndex((c) => c.cartItemId === cartItemId);
          if (existingIndex > -1) {
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + 1,
            };
          } else {
            updatedCart.push({
              cartItemId,
              productId: product.id,
              productName: product.name,
              department: product.department,
              selectedTier: tier,
              tierDetails: tierData,
              quantity: 1,
              image: product.image,
            });
          }
          itemsAddedCount++;
          addedSubtotal += tierData.price;
        } else {
          // Synthetic custom ingredient entry
          const synthId = `synth-${encodeURIComponent(ing.rawName).slice(0, 15)}`;
          const cartItemId = `${synthId}__${ing.selectedTier || 'great_value'}`;
          const existingIndex = updatedCart.findIndex((c) => c.cartItemId === cartItemId);
          const estPrice = ing.estimatedPrice || 2.98;

          if (existingIndex > -1) {
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + 1,
            };
          } else {
            updatedCart.push({
              cartItemId,
              productId: synthId,
              productName: ing.rawName,
              department: 'Recipe Pantry',
              selectedTier: ing.selectedTier || 'great_value',
              tierDetails: {
                brand: ing.selectedTier === 'organic' ? 'Marketside Organic' : 'Great Value',
                productName: ing.rawName,
                price: estPrice,
                packageSize: `${ing.amount} ${ing.unit}`,
              },
              quantity: 1,
              image: recipe.image,
            });
          }
          itemsAddedCount++;
          addedSubtotal += estPrice;
        }
      });

      return updatedCart;
    });

    showToast(
      `Added ${itemsAddedCount} Recipe Items to Cart!`,
      `"${recipe.title}" ingredients added · +$${addedSubtotal.toFixed(2)}`,
      'success'
    );
    setIsCartOpen(true);
  };

  // Remove from cart
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Update quantity
  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  // Switch tier directly inside cart (e.g. Upgrade to Organic or Switch to Great Value)
  const switchCartItemTier = (cartItemId: string, newTier: BrandTierType) => {
    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const newTierData = product.tiers[newTier];
    const newCartItemId = `${product.id}__${newTier}`;

    setCart((prev) => {
      // Remove old item
      const withoutOld = prev.filter((i) => i.cartItemId !== cartItemId);
      // Check if new tier item already in cart
      const existingNew = withoutOld.find((i) => i.cartItemId === newCartItemId);
      if (existingNew) {
        return withoutOld.map((i) =>
          i.cartItemId === newCartItemId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [
        ...withoutOld,
        {
          cartItemId: newCartItemId,
          productId: product.id,
          productName: product.name,
          department: product.department,
          selectedTier: newTier,
          tierDetails: newTierData,
          quantity: item.quantity,
          image: product.image,
        },
      ];
    });

    // Also remember this tier choice for future shopping!
    setItemBrandPreference(product.id, newTier);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.tierDetails.price * item.quantity, 0);
  }, [cart]);

  const cartSavings = useMemo(() => {
    return cart.reduce((total, item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return total;
      const nameBrandPrice = prod.tiers.name_brand.price;
      const paidPrice = item.tierDetails.price;
      const difference = nameBrandPrice - paidPrice;
      return total + (difference > 0 ? difference * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const cartTax = useMemo(() => {
    return Math.round(cartSubtotal * 0.0825 * 100) / 100;
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTax;
  }, [cartSubtotal, cartTax]);

  const freeShippingThreshold = 35.0;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);

  // Orders API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
          if (data.orders.length > 0 && !activeTrackingOrder) {
            setActiveTrackingOrder(data.orders[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch orders from server', e);
    }
  };

  const placeOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        items: cart.map((c) => ({
          productName: c.productName,
          brand: c.tierDetails.brand,
          tier: c.selectedTier,
          quantity: c.quantity,
          price: c.tierDetails.price,
          image: c.image,
        })),
        subtotal: cartSubtotal,
        tax: cartTax,
        deliveryFee: cartSubtotal >= 35 ? 0 : 5.99,
        total: cartTotal + (cartSubtotal >= 35 ? 0 : 5.99),
        savings: cartSavings,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create order');
    }

    const { order } = await res.json();
    setOrders((prev) => [order, ...prev]);
    setActiveTrackingOrder(order);
    clearCart();
    setIsCheckoutOpen(false);
    setActiveTab('orders');
    showToast(`Order Confirmed: ${order.orderNumber}!`, 'Tracking is live with real-time updates.', 'success');
    return order;
  };

  const trackOrderById = async (query: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      if (res.ok) {
        const { order } = await res.json();
        setActiveTrackingOrder(order);
        setActiveTab('orders');
        showToast(`Tracking Order: ${order.orderNumber}`, `Current status: ${order.status.replace(/_/g, ' ')}`, 'info');
        return true;
      }
    } catch (e) {
      console.warn('Track order lookup failed', e);
    }
    return false;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        recipes,
        cart,
        brandPreferences,
        globalBrandPreference,
        selectedCategory,
        searchQuery,
        activeTab,
        isCartOpen,
        isCheckoutOpen,
        isUploadRecipeOpen,
        selectedRecipe,
        orders,
        activeTrackingOrder,
        toast,
        setSelectedCategory,
        setSearchQuery,
        setActiveTab,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsUploadRecipeOpen,
        setSelectedRecipe,
        setActiveTrackingOrder,
        addToCart,
        addRecipeIngredientsToCart,
        removeFromCart,
        updateCartQuantity,
        switchCartItemTier,
        clearCart,
        setItemBrandPreference,
        getItemBrandTier,
        setGlobalBrandPreference,
        addCustomRecipe,
        placeOrder,
        fetchOrders,
        trackOrderById,
        cartCount,
        cartSubtotal,
        cartSavings,
        cartTax,
        cartTotal,
        freeShippingProgress,
        freeShippingRemaining,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
