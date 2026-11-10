import React from 'react';
import { Product, BrandTierType } from '../types';
import { useStore } from '../context/StoreContext';
import { Check, Sparkles, ShieldCheck, Tag } from 'lucide-react';

interface BrandTierSelectorProps {
  product: Product;
  compact?: boolean;
  onTierChange?: (tier: BrandTierType) => void;
}

export const BrandTierSelector: React.FC<BrandTierSelectorProps> = ({
  product,
  compact = false,
  onTierChange,
}) => {
  const { getItemBrandTier, setItemBrandPreference, brandPreferences } = useStore();
  const currentTier = getItemBrandTier(product.id, product.defaultTier);
  const isCustomPreferred = !!brandPreferences[product.id];

  const handleSelectTier = (tier: BrandTierType, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemBrandPreference(product.id, tier);
    if (onTierChange) {
      onTierChange(tier);
    }
  };

  const nameBrandPrice = product.tiers.name_brand.price;
  const gvPrice = product.tiers.great_value.price;
  const organicPrice = product.tiers.organic.price;

  const gvSavings = nameBrandPrice - gvPrice;

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Brand Choice</span>
          {isCustomPreferred && (
            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Saved Default
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {/* Great Value */}
          <button
            type="button"
            onClick={(e) => handleSelectTier('great_value', e)}
            className={`py-1 px-1.5 rounded text-center transition-all flex flex-col items-center justify-center ${
              currentTier === 'great_value'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={`Great Value: $${gvPrice.toFixed(2)}`}
          >
            <span className="text-[10px] leading-tight truncate max-w-full">Great Value</span>
            <span className="text-[11px] font-mono font-bold text-amber-300 leading-tight">
              ${gvPrice.toFixed(2)}
            </span>
          </button>

          {/* Name Brand */}
          <button
            type="button"
            onClick={(e) => handleSelectTier('name_brand', e)}
            className={`py-1 px-1.5 rounded text-center transition-all flex flex-col items-center justify-center ${
              currentTier === 'name_brand'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={`Name Brand: $${nameBrandPrice.toFixed(2)}`}
          >
            <span className="text-[10px] leading-tight truncate max-w-full">Name Brand</span>
            <span className="text-[11px] font-mono leading-tight">${nameBrandPrice.toFixed(2)}</span>
          </button>

          {/* Organic */}
          <button
            type="button"
            onClick={(e) => handleSelectTier('organic', e)}
            className={`py-1 px-1.5 rounded text-center transition-all flex flex-col items-center justify-center ${
              currentTier === 'organic'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={`Organic: $${organicPrice.toFixed(2)}`}
          >
            <span className="text-[10px] leading-tight truncate max-w-full">Organic</span>
            <span className="text-[11px] font-mono leading-tight">${organicPrice.toFixed(2)}</span>
          </button>
        </div>
        {gvSavings > 0 && currentTier === 'great_value' && (
          <p className="text-[11px] text-emerald-400 font-medium mt-1 truncate">
            Rollback: Save ${gvSavings.toFixed(2)} vs Name Brand
          </p>
        )}
      </div>
    );
  }

  // Expanded detailed selector panel
  return (
    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <span>Brand Tier Selection</span>
        </div>
        <span className="text-[11px] text-slate-400">Remembers choice for future orders</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Great Value */}
        <button
          type="button"
          onClick={(e) => handleSelectTier('great_value', e)}
          className={`relative p-2.5 rounded-lg border text-left transition-all ${
            currentTier === 'great_value'
              ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500 text-white'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {product.tiers.great_value.brand}
            </span>
            {currentTier === 'great_value' && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div className="text-sm font-bold font-mono text-white mt-1">
            ${gvPrice.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {product.tiers.great_value.packageSize}
          </div>
          {gvSavings > 0 && (
            <div className="mt-1 text-[10px] font-semibold text-emerald-400">
              Save ${gvSavings.toFixed(2)}
            </div>
          )}
        </button>

        {/* Name Brand */}
        <button
          type="button"
          onClick={(e) => handleSelectTier('name_brand', e)}
          className={`relative p-2.5 rounded-lg border text-left transition-all ${
            currentTier === 'name_brand'
              ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500 text-white'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 truncate">
              {product.tiers.name_brand.brand}
            </span>
            {currentTier === 'name_brand' && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div className="text-sm font-bold font-mono text-white mt-1">
            ${nameBrandPrice.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {product.tiers.name_brand.packageSize}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Standard Tier</div>
        </button>

        {/* Organic */}
        <button
          type="button"
          onClick={(e) => handleSelectTier('organic', e)}
          className={`relative p-2.5 rounded-lg border text-left transition-all ${
            currentTier === 'organic'
              ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500 text-white'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 truncate">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {product.tiers.organic.brand}
            </span>
            {currentTier === 'organic' && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div className="text-sm font-bold font-mono text-white mt-1">
            ${organicPrice.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {product.tiers.organic.packageSize}
          </div>
          <div className="mt-1 text-[10px] text-emerald-400">USDA Certified</div>
        </button>
      </div>
    </div>
  );
};
