import React, { useState } from 'react';
import { Recipe, RecipeIngredient, BrandTierType } from '../types';
import { useStore } from '../context/StoreContext';
import { getRecipeWalmartCartUrl } from '../services/walmartCartService';
import { Clock, Users, ShoppingBag, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';

export const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const { addRecipeIngredientsToCart, setSelectedRecipe, products, getItemBrandTier, setItemBrandPreference } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localIngredients, setLocalIngredients] = useState<RecipeIngredient[]>(recipe.ingredients);

  // Compute total price based on current effective brand tiers and checked state
  const computedTotal = localIngredients.reduce((total, ing) => {
    if (ing.checked === false) return total;
    const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
    if (prod) {
      const tier = getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier);
      return total + prod.tiers[tier].price;
    }
    return total + (ing.estimatedPrice || 2.49);
  }, 0);

  const selectedCount = localIngredients.filter((i) => i.checked !== false).length;

  const toggleIngredientChecked = (id: string) => {
    setLocalIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleTierChange = (ingId: string, productId: string | undefined, newTier: BrandTierType) => {
    setLocalIngredients((prev) =>
      prev.map((item) => (item.id === ingId ? { ...item, selectedTier: newTier } : item))
    );
    if (productId) {
      setItemBrandPreference(productId, newTier);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 overflow-hidden hover:border-amber-400/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
      {/* Recipe Thumbnail & Quick Stats */}
      <div className="relative aspect-16/10 bg-slate-950 overflow-hidden cursor-pointer group" onClick={() => setSelectedRecipe(recipe)}>
        {!imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400 text-3xl">
            🍲
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Source Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              recipe.sourceType === 'ai_generated'
                ? 'bg-purple-600/90 text-purple-100 border border-purple-400/30'
                : recipe.sourceType === 'web_link'
                ? 'bg-blue-600/90 text-blue-100 border border-blue-400/30'
                : recipe.sourceType === 'raw_ingredients'
                ? 'bg-amber-500/90 text-slate-950 font-bold'
                : 'bg-slate-800/90 text-slate-200'
            }`}
          >
            {recipe.sourceType === 'ai_generated'
              ? 'AI Recipe'
              : recipe.sourceType === 'web_link'
              ? 'Web Link'
              : recipe.sourceType === 'raw_ingredients'
              ? 'Custom Pantry'
              : 'Spark Curated'}
          </span>
        </div>

        {/* Prep & Cook Time Overlays */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {recipe.cookTime || recipe.prepTime}
            </span>
            <span className="flex items-center gap-1 font-medium bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              {recipe.servings} Servings
            </span>
          </div>

          <span className="bg-amber-400 text-slate-950 font-mono font-bold px-2 py-0.5 rounded-md text-xs">
            ${computedTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => setSelectedRecipe(recipe)}
            className="text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {recipe.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-slate-400">
                #{tag}
              </span>
            ))}
            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                Source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* 1-Click Action & Quick Customize Toggle */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {/* Primary 1-Click Cart Button */}
          <button
            type="button"
            onClick={() => addRecipeIngredientsToCart(recipe, localIngredients)}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All {selectedCount} Ingredients (${computedTotal.toFixed(2)})</span>
          </button>

          {/* Official Walmart.com Cart Transfer */}
          <a
            href={getRecipeWalmartCartUrl(localIngredients, products, getItemBrandTier)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Transfer to Official Walmart.com Cart</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Quick Customize Ingredients Accordion */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-1.5 px-2 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Ingredients & Brand Tiers' : 'Customize Ingredients & Brands'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expanded Ingredients List with Brand Tier Switcher */}
          {isExpanded && (
            <div className="space-y-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span>Select items to cart</span>
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Full Recipe Directions →
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {localIngredients.map((ing) => {
                  const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
                  const activeTier = prod ? getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier) : (ing.selectedTier || 'great_value');
                  const price = prod ? prod.tiers[activeTier].price : (ing.estimatedPrice || 2.49);

                  return (
                    <div
                      key={ing.id}
                      className={`p-2 rounded-lg border transition-all ${
                        ing.checked !== false
                          ? 'bg-slate-900 border-slate-800 text-slate-200'
                          : 'bg-slate-950 border-slate-900 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                          <input
                            type="checkbox"
                            checked={ing.checked !== false}
                            onChange={() => toggleIngredientChecked(ing.id)}
                            className="rounded border-slate-700 text-amber-400 focus:ring-amber-400"
                          />
                          <span className="truncate text-xs font-medium">{ing.rawName}</span>
                        </label>
                        <span className="font-mono text-xs font-bold text-white shrink-0">
                          ${price.toFixed(2)}
                        </span>
                      </div>

                      {/* Brand Tier Selector for this ingredient if matched */}
                      {prod && ing.checked !== false && (
                        <div className="mt-1.5 flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-400">Brand:</span>
                          <div className="flex items-center gap-1">
                            {(['great_value', 'name_brand', 'organic'] as BrandTierType[]).map((tierKey) => (
                              <button
                                key={tierKey}
                                type="button"
                                onClick={() => handleTierChange(ing.id, prod.id, tierKey)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  activeTier === tierKey
                                    ? tierKey === 'organic'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {tierKey === 'great_value'
                                  ? 'GV'
                                  : tierKey === 'organic'
                                  ? 'Organic'
                                  : 'Name Brand'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
