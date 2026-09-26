import React from 'react';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartDeliveryDistance,
    cartDeliveryBreakdown,
    cartTotal,
    setCheckoutOpen,
    setBuyerTab
  } = useApp();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8 text-blue-900" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Your cart is empty.</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Discover products from local sellers in Surigao del Sur and support our province’s producers!
        </p>
        <button
          onClick={() => setBuyerTab('home')}
          className="bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md inline-flex items-center space-x-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Start Browsing Local Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} from verified local merchants
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => {
          const unitPrice = item.product.discountPrice || item.product.price;
          const itemSubtotal = unitPrice * item.quantity;

          return (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-4"
            >
              <img
                src={item.product.photos[0]}
                alt={item.product.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-amber-700 font-bold uppercase">{item.product.category}</span>
                <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {item.product.sellerShopName} • {item.product.municipality}
                </p>
                <span className="text-xs font-extrabold text-blue-950 mt-1 block">
                  ₱{(unitPrice ?? 0).toLocaleString()} each
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1 font-bold bg-white text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    title={item.quantity >= item.product.stock ? 'Maximum available stock reached' : 'Increase quantity'}
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">
                  {item.product.stock} in stock
                </span>
              </div>

              {/* Item Total & Remove */}
              <div className="text-right shrink-0">
                <span className="font-extrabold text-sm text-blue-950 block">
                  ₱{(itemSubtotal ?? 0).toLocaleString()}
                </span>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-600 mt-1 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary Card as specified in Section 10 */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
          Order Financial Summary
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>PRODUCT TOTAL</span>
            <span className="font-semibold text-slate-900">₱{(cartSubtotal ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>DELIVERY FEE ({cartDeliveryDistance} km)</span>
            <span className="font-semibold text-slate-900">₱{(cartDeliveryFee ?? 0).toLocaleString()}</span>
          </div>
          {cartDeliveryBreakdown && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Grab PH Rate Reference: {cartDeliveryBreakdown} (100% to Rider)
            </div>
          )}

          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-black text-blue-950">
            <span>GRAND TOTAL</span>
            <span className="text-blue-950">₱{(cartTotal ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-3 rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center space-x-2"
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pay safely with GCash, Maya, or Cash on Delivery (COD)</span>
        </div>
      </div>
    </div>
  );
};
