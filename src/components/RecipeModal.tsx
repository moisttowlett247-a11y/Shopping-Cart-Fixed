import React, { useState } from 'react';
import { Recipe, RecipeIngredient, BrandTierType } from '../types';
import { useStore } from '../context/StoreContext';
import { getRecipeWalmartCartUrl } from '../services/walmartCartService';
import { X, Clock, Users, ShoppingBag, Check, ChefHat, ExternalLink } from 'lucide-react';

export const RecipeModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  const { addRecipeIngredientsToCart, products, getItemBrandTier, setItemBrandPreference } = useStore();
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(recipe.ingredients);

  const toggleChecked = (id: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleTierChange = (ingId: string, productId: string | undefined, tier: BrandTierType) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === ingId ? { ...i, selectedTier: tier } : i))
    );
    if (productId) {
      setItemBrandPreference(productId, tier);
    }
  };

  const selectedCount = ingredients.filter((i) => i.checked !== false).length;

  const totalCalculated = ingredients.reduce((sum, ing) => {
    if (ing.checked === false) return sum;
    const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
    if (prod) {
      const tier = getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier);
      return sum + prod.tiers[tier].price * servingsMultiplier;
    }
    return sum + (ing.estimatedPrice || 2.49) * servingsMultiplier;
  }, 0);

  const handleAddToCart = () => {
    addRecipeIngredientsToCart(recipe, ingredients);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close recipe details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero image */}
        <div className="relative aspect-21/9 w-full bg-slate-950 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                {recipe.difficulty || 'Easy Recipe'}
              </span>
              {recipe.tags.map((t, idx) => (
                <span key={idx} className="text-[11px] text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                  #{t}
                </span>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-5 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Prep: {recipe.prepTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Cook: {recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Servings: {recipe.servings * servingsMultiplier}</span>
              </div>
            </div>

            {/* Serving scaler */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Scale:</span>
              <button
                type="button"
                onClick={() => setServingsMultiplier((prev) => Math.max(1, prev - 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="font-mono font-bold text-white px-1">{servingsMultiplier}x</span>
              <button
                type="button"
                onClick={() => setServingsMultiplier((prev) => prev + 1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {recipe.description}
          </p>

          {/* Grid: Ingredients & Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Grocery Ingredients ({selectedCount})</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono font-semibold">
                  Total: ${totalCalculated.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {ingredients.map((ing) => {
                  const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
                  const activeTier = prod ? getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier) : (ing.selectedTier || 'great_value');
                  const itemPrice = (prod ? prod.tiers[activeTier].price : (ing.estimatedPrice || 2.49)) * servingsMultiplier;

                  return (
                    <div
                      key={ing.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        ing.checked !== false
                          ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                          : 'bg-slate-950/30 border-slate-900 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={ing.checked !== false}
                            onChange={() => toggleChecked(ing.id)}
                            className="rounded border-slate-700 text-amber-400 focus:ring-amber-400"
                          />
                          <span className="text-xs font-medium leading-snug">{ing.rawName}</span>
                        </label>
                        <span className="font-mono text-xs font-bold text-white shrink-0">
                          ${itemPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Tier Selector in Modal */}
                      {prod && ing.checked !== false && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Choice:</span>
                          <div className="flex items-center gap-1">
                            {(['great_value', 'name_brand', 'organic'] as BrandTierType[]).map((tierKey) => (
                              <button
                                key={tierKey}
                                type="button"
                                onClick={() => handleTierChange(ing.id, prod.id, tierKey)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  activeTier === tierKey
                                    ? tierKey === 'organic'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {tierKey === 'great_value'
                                  ? 'Great Value'
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

            {/* Instructions Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Cooking Instructions</span>
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <p className="flex-1">{step}</p>
                  </div>
                ))}
              </div>

              {recipe.sourceUrl && (
                <div className="pt-2 border-t border-slate-800">
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>View original source publication</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Modal Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Total Recipe Cart:</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                ${totalCalculated.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={getRecipeWalmartCartUrl(ingredients, products, getItemBrandTier)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <span>Transfer to Official Walmart.com Cart</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {selectedCount} to In-App Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
