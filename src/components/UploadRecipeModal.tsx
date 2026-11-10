import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Sparkles, Link2, ListPlus, Loader2, AlertCircle } from 'lucide-react';

export const UploadRecipeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCustomRecipe, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'ai' | 'link' | 'raw'>('ai');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab 1: AI Prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDietary, setAiDietary] = useState<string[]>([]);
  const [aiServings, setAiServings] = useState(4);

  // Tab 2: URL Link
  const [webUrl, setWebUrl] = useState('');

  // Tab 3: Raw Ingredients
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [rawServings, setRawServings] = useState(4);

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
          prompt: aiPrompt,
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
        onClose();
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
        onClose();
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
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing raw ingredients.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">✦</span>
              <span>Upload New Recipe</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Turn any prompt, web link, or raw ingredients into a 1-click grocery cart
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-slate-950/80 border-b border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ai');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('link');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'link'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-blue-200" />
            <span>Website Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('raw');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'raw'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Raw Ingredients</span>
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: AI Prompt Form */}
        {activeTab === 'ai' && (
          <form onSubmit={handleGenerateAI} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                What would you like to cook?
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 25-minute creamy cajun chicken pasta with diced tomatoes, spinach, and garlic butter sauce..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 mr-1 self-center">Ideas:</span>
                {[
                  'Quick High Protein Salmon Bowl',
                  'One-Pan Beef & Cheddar Mac',
                  'Keto Garlic Butter Steak Bites',
                  'Mediterranean Veggie Pasta',
                ].map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(idea)}
                    className="text-[11px] text-amber-400 hover:underline bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dietary Preferences (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['High Protein', 'Under 30 Mins', 'Keto / Low Carb', 'Budget Friendly', 'Gluten Free', 'One-Pan'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietary(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300">Servings:</label>
              <div className="flex items-center gap-1.5">
                {[2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAiServings(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
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

            <p className="text-[11px] text-slate-400">
              ✦ An appetizing dish photo thumbnail will be automatically assigned to your recipe.
            </p>

            <button
              type="submit"
              disabled={loading || !aiPrompt.trim()}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Chef AI is crafting recipe & matching Walmart ingredients...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Recipe & Match Groceries</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Website Link Form */}
        {activeTab === 'link' && (
          <form onSubmit={handleImportUrl} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Recipe or Web Page URL
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com/recipe/creamy-garlic-chicken"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
              />
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                ✓ <strong>Any and all links supported:</strong> If the link is a recipe blog, we extract the ingredients. If it's a general link or news article, our smart culinary engine will synthesize an inspired dinner around it!
                <br />
                ✓ The <strong>thumbnail picture is pulled automatically</strong> directly from the source page metadata!
              </p>
            </div>

            {/* Quick Sample Links */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Or test with a sample link:</span>
              <div className="flex flex-col gap-1.5">
                {[
                  {
                    name: 'AllRecipes Classic Garlic Butter Salmon',
                    url: 'https://www.allrecipes.com/recipe/228285/teriyaki-salmon/',
                  },
                  {
                    name: 'Bon Appetit Roasted Chicken Dinner',
                    url: 'https://www.bonappetit.com/recipe/classic-roast-chicken',
                  },
                  {
                    name: 'Everyday Non-Recipe Blog Link (Synthesis Demo)',
                    url: 'https://en.wikipedia.org/wiki/Pasta',
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWebUrl(sample.url)}
                    className="text-left text-xs text-blue-400 hover:underline bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 truncate"
                  >
                    🔗 {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !webUrl.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Fetching source page, thumbnail, and ingredients...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Import Link & Pull Thumbnail</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Raw Ingredients Form */}
        {activeTab === 'raw' && (
          <form onSubmit={handleParseRaw} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Recipe Title (Optional)
              </label>
              <input
                type="text"
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                placeholder="e.g. Grandma's Famous Garlic Chicken Fettuccine"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Paste Ingredients List (one item per line)
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`1.5 lb boneless skinless chicken breasts\n1 cup heavy cream\n16 oz fettuccine pasta\n4 cloves garlic\n1 bag baby spinach\n1/2 cup grated parmesan`}
                rows={6}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                We'll match each line to Walmart products and give you Name Brand, Great Value, and Organic options.
              </p>
            </div>

            {/* Servings */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300">Servings:</label>
              <div className="flex items-center gap-1.5">
                {[2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRawServings(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
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

            <button
              type="submit"
              disabled={loading || !rawText.trim()}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Parsing lines and matching store catalog...</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-4 h-4" />
                  <span>Create Recipe & Match Grocery Brands</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
