import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Star,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';

const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'order_placed', label: 'Order Placed' },
  { key: 'seller_confirmed', label: 'Seller Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_pickup_out_for_delivery', label: 'Ready for Pickup / Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' }
];

export const BuyerOrders: React.FC = () => {
  const { currentUser, setChatRecipient, setBuyerTab, showToast } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = () => {
    if (!currentUser) return;
    setLoading(true);
    api.getOrders({ buyerId: currentUser.id })
      .then((res) => setOrders(res.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkCompleted = async (orderId: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, 'completed');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      showToast('Order confirmed received! Thank you for supporting local.');
    } catch {
      showToast('Failed to update order status.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !currentUser) return;

    setSubmittingReview(true);
    try {
      await api.createReview({
        orderId: reviewOrder.id,
        productId: reviewOrder.items[0]?.productId,
        sellerId: reviewOrder.sellerId,
        buyerId: currentUser.id,
        buyerName: currentUser.fullName,
        rating,
        comment
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === reviewOrder.id ? { ...o, rated: true } : o))
      );
      setReviewOrder(null);
      setComment('');
      showToast('Review submitted! Thank you for rating the seller.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    const idx = ORDER_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-blue-900" />
        </div>
        <h2 className="text-lg font-black text-slate-900">No orders yet.</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Your purchases and delivery tracking across Surigao del Sur will appear here.
        </p>
        <button
          onClick={() => setBuyerTab('home')}
          className="bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md inline-flex items-center space-x-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Discover Local Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">My Purchases & Tracking</h1>
        <p className="text-xs text-slate-500">
          Track the live fulfillment status of your local orders in Surigao del Sur
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const currentStepIdx = getStepIndex(order.orderStatus);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {order.sellerShopName}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                      {order.sellerMunicipality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    order.orderStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-900'
                  }`}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>

                  <button
                    onClick={() => setChatRecipient({ id: order.sellerId, name: order.sellerShopName, role: 'seller' })}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Message Seller"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs">
                    {it.photo && (
                      <img src={it.photo} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{it.name}</h4>
                      <p className="text-slate-500 text-[11px]">
                        Qty: {it.quantity} × ₱{(it.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₱{((it.price * it.quantity) || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* ORDER STATUS PROGRESSION STEPPER (SECTION 12) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Order Tracking Pipeline
                </span>

                <div className="relative flex items-center justify-between pt-1">
                  {ORDER_STEPS.map((s, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={s.key} className="flex flex-col items-center flex-1 text-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-blue-950 text-amber-400 ring-4 ring-blue-100 shadow-md'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-[9px] mt-1 line-clamp-1 leading-tight max-w-[50px] sm:max-w-none ${
                            isCurrent
                              ? 'font-bold text-blue-950'
                              : isPassed
                              ? 'text-slate-700 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FINANCIAL BREAKDOWN DISPLAY (SECTION 8) */}
              <div className="bg-slate-100/60 rounded-2xl p-3.5 text-xs space-y-1.5 border border-slate-200/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Financial Breakdown
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-slate-900">₱{(order.productSubtotal ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee {order.deliveryDistanceKm ? `(${order.deliveryDistanceKm} km)` : ''}</span>
                  <span className="font-semibold text-slate-900">₱{(order.deliveryFee ?? 0).toFixed(2)}</span>
                </div>
                {order.riderName && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>Delivery Rider: <strong>{order.riderName}</strong></span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-medium">100% Fee Payout</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-blue-950">
                  <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
                  <span>₱{(order.totalPaid ?? 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-400 flex justify-between">
                  <span>Marketplace Commission — 3%</span>
                  <span>₱{(order.commissionAmount ?? 0).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Seller Net Amount</span>
                  <span>₱{(order.sellerNetAmount ?? 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions: Mark Received / Leave Review */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {order.orderStatus === 'delivered' && (
                  <button
                    onClick={() => handleMarkCompleted(order.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Order Received</span>
                  </button>
                )}

                {order.orderStatus === 'completed' && !order.rated && (
                  <button
                    onClick={() => setReviewOrder(order)}
                    className="bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Star className="w-4 h-4 fill-blue-950 text-blue-950" />
                    <span>Rate Seller & Product</span>
                  </button>
                )}

                {order.rated && (
                  <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review Submitted</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review & Rating Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Rate Order #{reviewOrder.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Seller: {reviewOrder.sellerShopName} ({reviewOrder.sellerMunicipality})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Written Review / Feedback *
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about the quality of the product, timeliness, and seller communication..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
