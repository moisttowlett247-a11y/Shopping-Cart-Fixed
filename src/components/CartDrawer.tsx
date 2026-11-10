import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandTierType } from '../types';
import { generateWalmartCartManifest, getWalmartItemDirectUrl } from '../services/walmartCartService';
import { X, Trash2, Plus, Minus, Sparkles, ArrowRight, ShoppingBag, ExternalLink, Check, ShoppingCart } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    switchCartItemTier,
    cartSubtotal,
    cartSavings,
    cartTax,
    cartTotal,
    cartCount,
    freeShippingProgress,
    freeShippingRemaining,
    setIsCheckoutOpen,
    products,
  } = useStore();

  const [showWalmartSyncModal, setShowWalmartSyncModal] = useState(false);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const walmartManifest = generateWalmartCartManifest(cart);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Walmart Direct Sync Banner */}
          {cart.length > 0 && (
            <div className="p-3 bg-blue-950/70 border-b border-blue-900/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">✦</span>
                <span className="text-xs font-semibold text-white">Official Walmart.com Sync</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWalmartSyncModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Transfer Cart</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Walmart+ Free Delivery Progress Bar */}
          <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 text-xs">
            <div className="flex items-center justify-between font-medium text-slate-200 mb-1.5">
              <span>Next-Day Delivery</span>
              {freeShippingRemaining > 0 ? (
                <span className="text-amber-400 font-bold">
                  Add ${freeShippingRemaining.toFixed(2)} for FREE delivery
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">
                  ✓ FREE Delivery Unlocked ($35+ order)!
                </span>
              )}
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-3xl mb-3 text-amber-400">
                  🛒
                </div>
                <h3 className="text-sm font-bold text-slate-200">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Browse products, add recipe ingredients with 1 click, or switch brand tiers to save.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                const directWalmartUrl = getWalmartItemDirectUrl(
                  item.tierDetails.productName,
                  item.tierDetails.brand,
                  item.tierDetails.walmartItemId
                );

                return (
                  <div
                    key={item.cartItemId}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-100 truncate">
                            {item.tierDetails.productName || item.productName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span className="truncate">
                            {item.tierDetails.brand} · {item.tierDetails.packageSize}
                          </span>
                          <a
                            href={directWalmartUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-0.5 text-[10px] shrink-0 ml-1"
                            title="Open exact item on Walmart.com"
                          >
                            <span>Walmart.com</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono font-bold text-sm text-white">
                            ${(item.tierDetails.price * item.quantity).toFixed(2)}
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (${item.tierDetails.price.toFixed(2)} ea)
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-bold px-1.5 text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick In-Cart Brand Tier Switcher */}
                    {product && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Tier:</span>
                        <div className="flex items-center gap-1">
                          {(['great_value', 'name_brand', 'organic'] as BrandTierType[]).map((tierKey) => {
                            const isCurrent = item.selectedTier === tierKey;
                            const tierInfo = product.tiers[tierKey];

                            return (
                              <button
                                key={tierKey}
                                type="button"
                                onClick={() => switchCartItemTier(item.cartItemId, tierKey)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  isCurrent
                                    ? tierKey === 'organic'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                                title={`${tierInfo.brand} - $${tierInfo.price.toFixed(2)}`}
                              >
                                {tierKey === 'great_value'
                                  ? 'Great Value'
                                  : tierKey === 'organic'
                                  ? 'Organic'
                                  : 'Name Brand'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono text-white font-semibold">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                {cartSavings > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Great Value Savings
                    </span>
                    <span className="font-mono">-${cartSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300">
                  <span>Estimated Tax (8.25%)</span>
                  <span className="font-mono text-white">${cartTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {freeShippingRemaining === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      '$5.99'
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="font-mono text-amber-400">
                    ${(cartTotal + (freeShippingRemaining === 0 ? 0 : 5.99)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Continue to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowWalmartSyncModal(true)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transfer All Items to Official Walmart.com Cart</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Walmart.com Transfer Modal */}
      {showWalmartSyncModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-xl">✦</span>
                <h3 className="text-base font-bold text-white">Transfer to Official Walmart.com</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWalmartSyncModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Below are your {cart.length} items formatted for your official Walmart.com account. You can open your official Walmart cart or click each item to add it directly to your Walmart bag:
            </p>

            {/* Primary Action Button */}
            <a
              href={walmartManifest.primaryWalmartCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open Official Walmart.com Cart & Add Items</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Itemized Direct Walmart Links */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct Item Walmart.com Links ({cart.length})
              </span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 max-h-56 overflow-y-auto">
                {walmartManifest.transferItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.brand} · Qty {item.quantity} · ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <a
                      href={item.walmartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Add on Walmart</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWalmartSyncModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
