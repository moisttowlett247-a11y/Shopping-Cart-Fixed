import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { RecipeSection } from './components/RecipeSection';
import { RecipeModal } from './components/RecipeModal';
import { UploadRecipeModal } from './components/UploadRecipeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { Sparkles, ShoppingBag, Package, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedRecipe,
    setSelectedRecipe,
    isUploadRecipeOpen,
    setIsUploadRecipeOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    toast,
  } = useStore();

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesName = prod.name.toLowerCase().includes(query);
    const matchesDept = prod.department.toLowerCase().includes(query);
    const matchesBrand =
      prod.tiers.name_brand.brand.toLowerCase().includes(query) ||
      prod.tiers.great_value.brand.toLowerCase().includes(query) ||
      prod.tiers.organic.brand.toLowerCase().includes(query);

    return matchesCategory && (matchesName || matchesDept || matchesBrand);
  });

  const categories = [
    { id: 'all', label: 'All Departments' },
    { id: 'grocery', label: 'Grocery & Fresh Food' },
    { id: 'essentials', label: 'Everyday Non-Food Essentials' },
    { id: 'personal_care', label: 'Personal Care & Pharmacy' },
    { id: 'home_electronics', label: 'Home & Electronics' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-start gap-3 max-w-sm ${
              toast.type === 'tier'
                ? 'bg-blue-950 border-blue-600 text-white'
                : toast.type === 'info'
                ? 'bg-slate-900 border-amber-400/50 text-white'
                : 'bg-slate-900 border-emerald-500/60 text-white'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'tier' ? (
                <span className="text-amber-400 font-bold">✦</span>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold leading-snug">{toast.message}</p>
              {toast.subtext && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {toast.subtext}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Primary Section Switcher (Impossible to miss) */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('recipes')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'recipes'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Recipe Hub & Upload Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products (Food & Non-Food)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Track Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* VIEW 1: RECIPE HUB (Default & Front-and-Center) */}
        {activeTab === 'recipes' && <RecipeSection />}

        {/* VIEW 2: BROWSE ALL PRODUCTS (Grocery & Everyday Non-Food Items) */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Show Hero Banner */}
            {!searchQuery && selectedCategory === 'all' && <HeroBanner />}

            {/* Department Navigation Strip */}
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
                  <span>
                    Results for "<strong>{searchQuery}</strong>"
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-amber-400 hover:underline text-[11px]"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

            {/* Section 1: Product Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>
                      {selectedCategory === 'all'
                        ? 'Store Catalog (Food & Non-Food Everyday Shopping)'
                        : categories.find((c) => c.id === selectedCategory)?.label}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({filteredProducts.length} items)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose between Name Brand, Great Value, or Organic on each item. Choices are remembered.
                  </p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
                  <p className="text-sm font-semibold text-slate-200">No products match your search.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for chicken, pasta, paper towels, shampoo, or browse all departments.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 3: SECURE ORDER TRACKING */}
        {activeTab === 'orders' && <OrderTracker />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      {isCheckoutOpen && <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {isUploadRecipeOpen && (
        <UploadRecipeModal onClose={() => setIsUploadRecipeOpen(false)} />
      )}

      {/* Walmart Dark Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Free Delivery</p>
                <p className="text-[11px] text-slate-400">On all orders over $35</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Brand Tier Memory</p>
                <p className="text-[11px] text-slate-400">Great Value / Organic saved</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white">1-Click Recipes</p>
                <p className="text-[11px] text-slate-400">Instant meal ingredient carting</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Live Order Tracking</p>
                <p className="text-[11px] text-slate-400">Real-time status & PIN</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-amber-400 font-bold">✦</span>
              <span className="font-semibold text-slate-300">SparkStore Dark</span>
              <span>·</span>
              <span>Everyday Low Prices · 1-Click Recipe Engine</span>
            </div>
            <p className="text-slate-400">
              All store brands (Great Value, Equate, Marketside) & national brands certified.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
