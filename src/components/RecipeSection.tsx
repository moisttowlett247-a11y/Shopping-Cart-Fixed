import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Recipe, RecipeIngredient, BrandTierType } from '../types';
import { getRecipeWalmartCartUrl, getWalmartItemDirectUrl } from '../services/walmartCartService';
import {
  Sparkles,
  Link2,
  ListPlus,
  ShoppingBag,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const RecipeSection: React.FC = () => {
  const {
    recipes,
    products,
    addRecipeIngredientsToCart,
    setSelectedRecipe,
    addCustomRecipe,
    getItemBrandTier,
    setItemBrandPreference,
    brandPreferences,
  } = useStore();

  // In-page upload tab state
  const [activeUploadTab, setActiveUploadTab] = useState<'ai' | 'link' | 'raw'>('ai');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDietary, setAiDietary] = useState<string[]>([]);
  const [aiServings, setAiServings] = useState(4);

  const [webUrl, setWebUrl] = useState('');

  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [rawServings, setRawServings] = useState(4);

  // Expanded ingredients accordion state for each recipe card
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'recipe-tuscan-chicken': true, // Show first one open by default so user sees the ingredient brand tiers immediately!
  });

  const toggleExpandCard = (recipeId: string) => {
    setExpandedCards((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  const toggleDietary = (item: string) => {
    setAiDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  // 1. Submit AI Generation
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          dietary: aiDietary.join(', '),
          servings: aiServings,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      if (data.recipe) {
        addCustomRecipe(data.recipe);
        setAiPrompt('');
        // Expand the newly added recipe
        setExpandedCards((prev) => ({ ...prev, [data.recipe.id]: true }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with AI engine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Web Link Import
  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/recipe/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to import recipe from link');
      }

      const data = await response.json();
      if (data.recipe) {
        addCustomRecipe(data.recipe);
        setWebUrl('');
        setExpandedCards((prev) => ({ ...prev, [data.recipe.id]: true }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error parsing recipe link. Please verify URL.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Raw Ingredients
  const handleParseRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/recipe/parse-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rawTitle.trim(),
          rawText: rawText.trim(),
          servings: rawServings,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to parse raw ingredients');
      }

      const data = await response.json();
      if (data.recipe) {
        addCustomRecipe(data.recipe);
        setRawTitle('');
        setRawText('');
        setExpandedCards((prev) => ({ ...prev, [data.recipe.id]: true }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing raw ingredients.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Recipe Hub Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <span className="text-amber-400">✦</span>
            <span>1-Click Entire Recipe Carting & Brand Customizer</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Recipe Hub: Add Entire Meals to Cart in 1 Click
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Choose between <strong>Name Brand</strong>, <strong>Great Value</strong>, or <strong>Organic</strong> for each ingredient. Your preference is remembered automatically! Upload recipes via <strong>AI prompt</strong>, <strong>any website link</strong> (with automatic photo thumbnails), or <strong>raw ingredients</strong>.
          </p>
        </div>
      </div>

      {/* 2. Prominent In-Page Recipe Upload Studio (AI / Link / Raw) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">✦</span>
              <span>Upload or Generate a New Recipe</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your upload method below. Thumbnails are automatically pulled from source metadata or high-res photography.
            </p>
          </div>

          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full self-start sm:self-auto">
            ✓ Any & All Links Accepted
          </span>
        </div>

        {/* 3 Upload Mode Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveUploadTab('ai');
              setErrorMessage(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeUploadTab === 'ai'
                ? 'bg-purple-600 text-white shadow-lg ring-1 ring-purple-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Method 1: AI Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveUploadTab('link');
              setErrorMessage(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeUploadTab === 'link'
                ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4 text-blue-200" />
            <span>Method 2: Any Web Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveUploadTab('raw');
              setErrorMessage(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeUploadTab === 'raw'
                ? 'bg-amber-400 text-slate-950 shadow-lg ring-1 ring-amber-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListPlus className="w-4 h-4 text-slate-950" />
            <span>Method 3: Raw Ingredients</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM 1: AI PROMPT */}
        {activeUploadTab === 'ai' && (
          <form onSubmit={handleGenerateAI} className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Describe the recipe you want Chef AI to create:
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 25-minute creamy Tuscan garlic chicken skillet with baby spinach, heavy cream, and sun-dried tomatoes..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 mr-1 self-center">Try prompt:</span>
                {[
                  'Quick High-Protein Salmon Power Bowl',
                  'One-Pan Beef & Cheddar Chili Mac',
                  'Keto Garlic Butter Steak Bites with Asparagus',
                  'Creamy Fettuccine Alfredo with Chicken',
                ].map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(idea)}
                    className="text-[11px] text-purple-300 hover:underline bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Dietary Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Dietary Preferences:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['High Protein', 'Under 30 Mins', 'Keto / Low Carb', 'Budget Friendly', 'Gluten Free'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietary(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          aiDietary.includes(tag)
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Servings:</span>
                <div className="flex items-center gap-1">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAiServings(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        aiServings === num
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-950 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !aiPrompt.trim()}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Chef AI is generating recipe and assigning food photo thumbnail...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Recipe & Match Walmart Groceries</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 2: ANY WEBSITE LINK */}
        {activeUploadTab === 'link' && (
          <form onSubmit={handleImportUrl} className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Paste ANY website link (recipe blog, article, food news, or video):
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://www.allrecipes.com/recipe/228285/teriyaki-salmon/ (or any link!)"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
              />
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl mt-2 text-xs text-blue-200 space-y-1">
                <p>
                  ✓ <strong>Any and all links are accepted:</strong> If the link is an active recipe, ingredients and cooking instructions are extracted. If the link is a non-recipe article or general page, our engine synthesizes an inspired delicious meal around it so you can still shop the ingredients!
                </p>
                <p>
                  ✓ <strong>Automatic Source Thumbnail:</strong> The picture thumbnail is automatically extracted directly from the web page's OpenGraph (`og:image`) metadata!
                </p>
              </div>
            </div>

            {/* Sample link buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Click a sample link to test instantly:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    title: 'AllRecipes Teriyaki Salmon',
                    url: 'https://www.allrecipes.com/recipe/228285/teriyaki-salmon/',
                  },
                  {
                    title: 'Bon Appetit Classic Roast Chicken',
                    url: 'https://www.bonappetit.com/recipe/classic-roast-chicken',
                  },
                  {
                    title: 'Generic Link (Wikipedia Pasta Synthesis)',
                    url: 'https://en.wikipedia.org/wiki/Pasta',
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWebUrl(sample.url)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-[11px] text-blue-300 truncate"
                  >
                    🔗 {sample.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !webUrl.trim()}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Pulling page thumbnail & extracting recipe ingredients...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Import Link & Pull Thumbnail Image</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 3: RAW INGREDIENTS */}
        {activeUploadTab === 'raw' && (
          <form onSubmit={handleParseRaw} className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Recipe Title (Optional)
                </label>
                <input
                  type="text"
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  placeholder="e.g. Grandma's Sunday Garlic Chicken Pasta"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Servings
                </label>
                <div className="flex items-center gap-1">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRawServings(num)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                        rawServings === num
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-950 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Paste Raw Ingredients (one per line):
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`1.25 lb boneless skinless chicken breasts\n1 cup heavy whipping cream\n16 oz fettuccine pasta\n4 cloves fresh garlic\n5 oz fresh baby spinach\n1/2 cup grated parmesan cheese`}
                rows={5}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Each ingredient will automatically be matched with <strong>Name Brand</strong>, <strong>Great Value</strong>, and <strong>Organic</strong> options with your saved brand preference remembered!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Parsing lines and matching grocery brands...</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-4 h-4 text-slate-950" />
                  <span>Convert Raw Ingredients to 1-Click Recipe Cart</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 3. The Recipe Catalog & 1-Click Ingredient Carting Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Available 1-Click Recipes ({recipes.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click <strong>"Add All Ingredients to Cart"</strong> on any recipe to cart every item at once. Customize brand tiers on the fly!
            </p>
          </div>
        </div>

        {/* Recipe Cards with full ingredient brand tier selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <DetailedRecipeCard
              key={recipe.id}
              recipe={recipe}
              isExpanded={!!expandedCards[recipe.id]}
              onToggleExpand={() => toggleExpandCard(recipe.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Detailed Recipe Card with full in-card brand tier panels for each ingredient
const DetailedRecipeCard: React.FC<{
  recipe: Recipe;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ recipe, isExpanded, onToggleExpand }) => {
  const {
    products,
    addRecipeIngredientsToCart,
    setSelectedRecipe,
    getItemBrandTier,
    setItemBrandPreference,
    brandPreferences,
  } = useStore();

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(recipe.ingredients);
  const [imageError, setImageError] = useState(false);

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

  // Calculate price dynamically
  const totalCost = ingredients.reduce((sum, ing) => {
    if (ing.checked === false) return sum;
    const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
    if (prod) {
      const tier = getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier);
      return sum + prod.tiers[tier].price;
    }
    return sum + (ing.estimatedPrice || 2.49);
  }, 0);

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden hover:border-amber-400/50 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between">
      {/* Top Media Bar */}
      <div className="relative aspect-16/9 bg-slate-950 overflow-hidden group">
        {!imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400 text-4xl">
            🍲
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Source badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              recipe.sourceType === 'ai_generated'
                ? 'bg-purple-600 text-white border border-purple-400/40'
                : recipe.sourceType === 'web_link'
                ? 'bg-blue-600 text-white border border-blue-400/40'
                : recipe.sourceType === 'raw_ingredients'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            {recipe.sourceType === 'ai_generated'
              ? '✦ AI Generated'
              : recipe.sourceType === 'web_link'
              ? '🔗 Web Link Source'
              : recipe.sourceType === 'raw_ingredients'
              ? '📝 Raw Ingredients'
              : '★ Spark Curated'}
          </span>
        </div>

        {/* Overlaid stats */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{recipe.cookTime || recipe.prepTime}</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{recipe.servings} Servings</span>
            </span>
          </div>

          <span className="bg-amber-400 text-slate-950 font-mono font-black px-3 py-1 rounded-lg text-sm shadow-md">
            ${totalCost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3
              onClick={() => setSelectedRecipe(recipe)}
              className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors leading-snug"
            >
              {recipe.title}
            </h3>
          </div>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
            {recipe.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {recipe.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800"
              >
                #{tag}
              </span>
            ))}
            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 ml-auto"
              >
                <span>Original Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* 1-Click Entire Recipe Cart Action */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => addRecipeIngredientsToCart(recipe, ingredients)}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <span>Add Entire Recipe Ingredients to Cart (${totalCost.toFixed(2)}) · 1-Click</span>
          </button>

          {/* Transfer directly to official Walmart.com cart via official /sc/cart/addToCart endpoint */}
          <a
            href={getRecipeWalmartCartUrl(ingredients, products, getItemBrandTier)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Transfer Entire Recipe to Official Walmart.com Cart</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Accordion Toggle for Individual Item Brand Panel */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>
                {isExpanded
                  ? `Hide Ingredient Brands (${ingredients.length})`
                  : `Customize Ingredients & Brand Tiers (${ingredients.length})`}
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRecipe(recipe)}
              className="text-amber-400 hover:underline text-xs font-semibold"
            >
              Full Directions & Steps →
            </button>
          </div>

          {/* Detailed Ingredients Panel with Name Brand / Great Value / Organic Tiers */}
          {isExpanded && (
            <div className="space-y-2 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                <span>Check items to cart · Switch brand tiers below</span>
                <span className="font-semibold text-amber-400">{selectedCount} Selected</span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {ingredients.map((ing) => {
                  const prod = ing.matchedProductId ? products.find((p) => p.id === ing.matchedProductId) : undefined;
                  const activeTier = prod ? getItemBrandTier(prod.id, ing.selectedTier || prod.defaultTier) : (ing.selectedTier || 'great_value');
                  const price = prod ? prod.tiers[activeTier].price : (ing.estimatedPrice || 2.49);
                  const isPreferred = prod ? !!brandPreferences[prod.id] : false;

                  return (
                    <div
                      key={ing.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        ing.checked !== false
                          ? 'bg-slate-900 border-slate-800 text-slate-200'
                          : 'bg-slate-950 border-slate-900 text-slate-400 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                          <input
                            type="checkbox"
                            checked={ing.checked !== false}
                            onChange={() => toggleChecked(ing.id)}
                            className="rounded border-slate-700 text-amber-400 focus:ring-amber-400"
                          />
                          <span className="truncate text-xs font-medium">{ing.rawName}</span>
                        </label>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPreferred && (
                            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Saved Default
                            </span>
                          )}
                          <span className="font-mono text-xs font-bold text-white">
                            ${price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Brand Tier Selector Panel for each individual item */}
                      {prod && ing.checked !== false && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span>Tier:</span>
                            </span>
                            <a
                              href={getWalmartItemDirectUrl(prod.name, prod.tiers[activeTier].brand, prod.tiers[activeTier].walmartItemId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                              title="Open exact product on Walmart.com"
                            >
                              <span>Walmart</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Great Value */}
                            <button
                              type="button"
                              onClick={() => handleTierChange(ing.id, prod.id, 'great_value')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                                activeTier === 'great_value'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>Great Value</span>
                              <span className="font-mono text-amber-300 font-bold">
                                ${prod.tiers.great_value.price.toFixed(2)}
                              </span>
                            </button>

                            {/* Name Brand */}
                            <button
                              type="button"
                              onClick={() => handleTierChange(ing.id, prod.id, 'name_brand')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                                activeTier === 'name_brand'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{prod.tiers.name_brand.brand}</span>
                              <span className="font-mono text-slate-200">
                                ${prod.tiers.name_brand.price.toFixed(2)}
                              </span>
                            </button>

                            {/* Organic */}
                            <button
                              type="button"
                              onClick={() => handleTierChange(ing.id, prod.id, 'organic')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                                activeTier === 'organic'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>Organic</span>
                              <span className="font-mono text-emerald-300">
                                ${prod.tiers.organic.price.toFixed(2)}
                              </span>
                            </button>
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
