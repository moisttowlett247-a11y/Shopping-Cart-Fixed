import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Truck, Store, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export const CheckoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cart, cartTotal, cartSavings, freeShippingRemaining, placeOrder } = useStore();
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('Alex Johnson');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('IL');
  const [zip, setZip] = useState('62704');
  const [slot, setSlot] = useState('Today, 4:00 PM - 6:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<'walmart_pay' | 'card' | 'ebt'>('walmart_pay');

  const finalDeliveryFee = fulfillmentType === 'pickup' || freeShippingRemaining === 0 ? 0 : 5.99;
  const grandTotal = cartTotal + finalDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await placeOrder({
        fulfillmentType,
        deliveryAddress: {
          fullName: name,
          street,
          city,
          state,
          zip,
        },
        estimatedDelivery: slot,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-lg">✦</span>
            <div>
              <h2 className="text-base font-bold text-white">Spark Secure Checkout</h2>
              <p className="text-xs text-slate-400">Order verification & delivery confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          {/* Fulfillment Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  fulfillmentType === 'delivery'
                    ? 'bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Direct Delivery</div>
                  <div className="text-[11px] text-slate-400">To your front doorstep</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  fulfillmentType === 'pickup'
                    ? 'bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Store className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Curbside Pickup</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">100% Free at Supercenter</div>
                </div>
              </button>
            </div>
          </div>

          {/* Address / Location */}
          <div className="space-y-3 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200">
              {fulfillmentType === 'delivery' ? 'Delivery Destination' : 'Store Pickup Location'}
            </h3>

            {fulfillmentType === 'delivery' ? (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white">Walmart Supercenter #2418</p>
                <p className="text-slate-400 mt-0.5">1200 S Commerce Way, Springfield, IL 62704</p>
                <p className="text-amber-400 text-[11px] mt-1">Dedicated Curbside Pickup Bay #4</p>
              </div>
            )}
          </div>

          {/* Delivery Window */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Time Window
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Today, 4:00 PM - 6:00 PM">Today, 4:00 PM - 6:00 PM (Express)</option>
              <option value="Today, 6:00 PM - 8:00 PM">Today, 6:00 PM - 8:00 PM (Standard)</option>
              <option value="Tomorrow, 8:00 AM - 10:00 AM">Tomorrow, 8:00 AM - 10:00 AM (Morning Slot)</option>
              <option value="Tomorrow, 12:00 PM - 2:00 PM">Tomorrow, 12:00 PM - 2:00 PM (Afternoon)</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Choice
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('walmart_pay')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'walmart_pay'
                    ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xs block text-amber-400">✦ Walmart Pay</span>
                <span className="text-[10px] text-slate-400">1-Touch Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-0.5 text-slate-300" />
                <span className="text-xs block">Card ••4821</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ebt')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'ebt'
                    ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mx-auto mb-0.5 text-emerald-400" />
                <span className="text-xs block">EBT / SNAP</span>
              </button>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal ({cart.length} distinct lines):</span>
              <span className="font-mono text-white">${cartTotal.toFixed(2)}</span>
            </div>
            {cartSavings > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Total Great Value Savings:</span>
                <span className="font-mono">-${cartSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Fulfillment ({fulfillmentType}):</span>
              <span className="font-mono">
                {finalDeliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${finalDeliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
              <span>Grand Total</span>
              <span className="font-mono text-amber-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Securing your order & assigning store associate...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Place Order (${grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
