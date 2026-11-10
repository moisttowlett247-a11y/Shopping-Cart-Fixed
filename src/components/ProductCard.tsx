import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { BrandTierSelector } from './BrandTierSelector';
import { Plus, Minus, Star, ShoppingCart, Check, ExternalLink } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, cart, updateCartQuantity, getItemBrandTier } = useStore();
  const [imageError, setImageError] = useState(false);

  const activeTier = getItemBrandTier(product.id, product.defaultTier);
  const tierDetails = product.tiers[activeTier];

  // Find if currently in cart with this specific tier
  const cartItemId = `${product.id}__${activeTier}`;
  const existingCartItem = cart.find((item) => item.cartItemId === cartItemId);
  const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

  return (
    <div className="group flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/20 transition-all duration-200">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 bg-slate-950/70 overflow-hidden flex items-center justify-center p-3">
        {tierDetails.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`text-[11px] font-bold tracking-tight px-2.5 py-0.5 rounded-full uppercase ${
                tierDetails.badge.includes('Rollback')
                  ? 'bg-amber-400 text-slate-950'
                  : tierDetails.badge.includes('Organic')
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {tierDetails.badge}
            </span>
          </div>
        )}

        {!imageError ? (
          <img
            src={product.image}
            alt={tierDetails.productName}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-2xl mb-1">🛒</span>
            <span className="text-xs font-semibold text-slate-300">{product.name}</span>
          </div>
        )}
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Department & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">
              {product.department}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-500 text-[11px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 title-case group-hover:text-amber-400 transition-colors">
            {tierDetails.productName}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {tierDetails.packageSize}
          </p>
        </div>

        {/* Pricing display */}
        <div className="pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-white">
                ${tierDetails.price.toFixed(2)}
              </span>
              {tierDetails.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ${tierDetails.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                ({tierDetails.brand})
              </span>
            </div>

            <a
              href={tierDetails.walmartUrl || `https://www.walmart.com/search?q=${encodeURIComponent(tierDetails.productName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5"
              title="Open item on Walmart.com"
            >
              <span>Walmart</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Tier Selector Panel for Individual Item */}
        <div className="pt-1 border-t border-slate-800/80">
          <BrandTierSelector product={product} compact={true} />
        </div>

        {/* Action Button: Add to Cart / Stepper */}
        <div className="pt-2">
          {quantityInCart === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, activeTier)}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-blue-950/70 border border-blue-600/50 rounded-xl p-1">
              <button
                type="button"
                onClick={() => updateCartQuantity(cartItemId, quantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-bold text-xs text-white">{quantityInCart} in cart</span>
              </div>
              <button
                type="button"
                onClick={() => updateCartQuantity(cartItemId, quantityInCart + 1)}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
