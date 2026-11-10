import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { Search, Package, CheckCircle2, Clock, Truck, Store, MapPin, QrCode, RotateCcw, ShieldCheck, ExternalLink } from 'lucide-react';

export const OrderTracker: React.FC = () => {
  const { orders, activeTrackingOrder, setActiveTrackingOrder, trackOrderById, addToCart, products, showToast } = useStore();
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<OrderStatus | null>(null);

  const currentOrder = activeTrackingOrder || (orders.length > 0 ? orders[0] : null);
  const effectiveStatus: OrderStatus = simulatedStatus || (currentOrder ? currentOrder.status : 'placed');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    const success = await trackOrderById(searchId.trim());
    if (!success) {
      showToast('Order Not Found', 'Please check the order number and try again.', 'info');
    }
    setSearching(false);
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received & routed to Store #2418', icon: Clock },
    { key: 'picked', label: 'Associate Picked', desc: 'Shopper Maria selected fresh items', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver Alex is on the way', icon: Truck },
    { key: 'delivered', label: 'Delivered', desc: 'Securely completed', icon: CheckCircle2 },
  ];

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'placed': return 0;
      case 'picked': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(effectiveStatus);

  // Advance status step and persist to server
  const handleNextSimulation = async () => {
    if (!currentOrder) return;
    const keys: OrderStatus[] = ['placed', 'picked', 'out_for_delivery', 'delivered'];
    const nextIdx = (currentIndex + 1) % keys.length;
    const nextStatus = keys[nextIdx];
    setSimulatedStatus(nextStatus);
    showToast(`Order Status Updated: ${nextStatus.replace(/_/g, ' ')}`, 'Live tracking updated & saved.', 'info');

    try {
      await fetch(`/api/orders/${encodeURIComponent(currentOrder.orderNumber)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.warn('Status patch failed', e);
    }
  };

  const handleReorder = () => {
    if (!currentOrder) return;
    let addedCount = 0;
    currentOrder.items.forEach((item) => {
      const prod = products.find((p) => p.name.toLowerCase() === item.productName.toLowerCase());
      if (prod) {
        addToCart(prod, item.tier, item.quantity);
        addedCount++;
      }
    });
    showToast(`Reordered ${addedCount} Items`, 'Added items back to your cart!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Lookup Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Secure Order Tracking</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time store picking and driver location verification
            </p>
          </div>

          {/* Quick Select existing orders */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Past Orders:</span>
              <select
                value={currentOrder?.orderNumber || ''}
                onChange={(e) => {
                  const ord = orders.find((o) => o.orderNumber === e.target.value);
                  if (ord) {
                    setActiveTrackingOrder(ord);
                    setSimulatedStatus(null);
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200"
              >
                {orders.map((o) => (
                  <option key={o.orderNumber} value={o.orderNumber}>
                    {o.orderNumber} (${o.total.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search by Order ID */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order # e.g. WM-84920412"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchId.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0"
          >
            {searching ? 'Looking up...' : 'Track'}
          </button>
        </form>
      </div>

      {currentOrder ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          {/* Order Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-white">
                  Order {currentOrder.orderNumber}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {currentOrder.fulfillmentType === 'pickup' ? 'Curbside Pickup' : 'Express Delivery'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.walmart.com/orders"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Official Walmart.com Tracking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleNextSimulation}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition-colors"
                title="Click to advance delivery status"
              >
                ↻ Advance Status
              </button>
              <button
                type="button"
                onClick={handleReorder}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorder Basket</span>
              </button>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {statusSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = idx < currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : isCompleted
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isCompleted && (
                        <span className="text-emerald-400 text-xs font-bold">✓</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white leading-snug">{step.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Delivery / Pickup Context Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Fulfillment Location</span>
              <p className="text-white font-semibold flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-blue-400" />
                {currentOrder.storeName} ({currentOrder.storeNumber})
              </p>
              <p className="text-slate-400 mt-0.5">Assigned Shopper: {currentOrder.shopperName}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">
                {currentOrder.fulfillmentType === 'delivery' ? 'Delivery Address' : 'Pickup Slot'}
              </span>
              <p className="text-white font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {currentOrder.deliveryAddress.street}, {currentOrder.deliveryAddress.city}
              </p>
              <p className="text-slate-400 mt-0.5">Recipient: {currentOrder.deliveryAddress.fullName}</p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 md:border-l md:border-slate-800 md:pl-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Security Pass PIN
                </span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {currentOrder.orderNumber.slice(-4)}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg text-slate-950">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Itemized Order Receipt Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itemized Items ({currentOrder.items.length})
            </h3>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{item.productName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-300 font-semibold">{item.brand}</span>
                        <span>·</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-white shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt Summary */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 text-xs max-w-sm ml-auto">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono text-white">${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              {currentOrder.savings > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Great Value Savings</span>
                  <span className="font-mono">-${currentOrder.savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Tax</span>
                <span className="font-mono text-white">${currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery</span>
                <span className="font-mono">
                  {currentOrder.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${currentOrder.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                <span>Total Paid</span>
                <span className="font-mono text-amber-400">${currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <h2 className="text-base font-bold text-slate-200">No active orders found</h2>
          <p className="text-xs text-slate-400 mt-1">
            Place an order from your cart to see live tracking, or search using your Order # above.
          </p>
        </div>
      )}
    </div>
  );
};
