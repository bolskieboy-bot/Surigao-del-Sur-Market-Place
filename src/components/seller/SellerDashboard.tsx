import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  PlusCircle,
  ShoppingBag,
  CreditCard,
  Settings,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  DollarSign,
  Upload,
  AlertCircle,
  Eye,
  Trash2,
  MapPin,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { MARKETPLACE_CATEGORIES, SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';
import { compressImage } from '../../utils/imageCompression';

export const SellerDashboard: React.FC = () => {
  const {
    currentSeller,
    setCurrentSeller,
    sellerTab,
    setSellerTab,
    setProductDetailId,
    setPaymentLinkModal,
    showToast
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Product Form State
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<string>(MARKETPLACE_CATEGORIES[0]);
  const [pPrice, setPPrice] = useState('');
  const [pDiscountPrice, setPDiscountPrice] = useState('');
  const [pStock, setPStock] = useState('10');
  const [pDescription, setPDescription] = useState('');
  const [pPhotos, setPPhotos] = useState<string[]>([]);
  const [pDelivery, setPDelivery] = useState(true);
  const [pPickup, setPPickup] = useState(true);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Seller Payment Settings State
  const [gcashEnabled, setGcashEnabled] = useState(true);
  const [mayaEnabled, setMayaEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  const fetchSellerData = () => {
    if (!currentSeller) return;
    setLoading(true);

    api.getProducts({ sellerId: currentSeller.id })
      .then((res) => setProducts(res.products || []))
      .catch(console.error);

    api.getOrders({ sellerId: currentSeller.id })
      .then((res) => setOrders(res.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (currentSeller.paymentMethods) {
      setGcashEnabled(currentSeller.paymentMethods.gcash?.enabled ?? true);
      setMayaEnabled(currentSeller.paymentMethods.maya?.enabled ?? true);
      setCodEnabled(currentSeller.paymentMethods.cod?.enabled ?? true);
    }
  };

  useEffect(() => {
    fetchSellerData();
    const interval = setInterval(fetchSellerData, 7000);
    return () => clearInterval(interval);
  }, [currentSeller]);

  if (!currentSeller) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 space-y-4">
        <Store className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Seller Account Required</h2>
        <p className="text-xs text-slate-500">
          Please select or register a seller account to access the store management dashboard.
        </p>
      </div>
    );
  }

  // Calculate seller financial totals
  const completedOrders = orders.filter((o) => o.orderStatus === 'completed');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.productSubtotal, 0);
  const totalCommissionDeducted = completedOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const netEarnings = totalSales - totalCommissionDeducted;

  // Image Upload with compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i], 800, 0.75);
        setPPhotos((prev) => [...prev, compressed]);
      } catch (err) {
        console.error(err);
      }
    }
    showToast('Photo(s) added and compressed for fast provincial mobile load.');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pPhotos.length === 0) {
      showToast('Please upload at least one product photo.');
      return;
    }

    setSubmittingProduct(true);
    try {
      const res = await api.createProduct({
        sellerId: currentSeller.id,
        sellerShopName: currentSeller.shopName,
        sellerMunicipality: currentSeller.municipality,
        sellerVerified: currentSeller.verified,
        name: pName,
        category: pCategory,
        price: parseFloat(pPrice),
        discountPrice: pDiscountPrice ? parseFloat(pDiscountPrice) : undefined,
        stock: parseInt(pStock, 10),
        description: pDescription,
        photos: pPhotos,
        deliveryAvailable: pDelivery,
        pickupAvailable: pPickup,
        municipality: currentSeller.municipality
      });

      setProducts((prev) => [res.product, ...prev]);
      showToast(`Product "${pName}" successfully published!`);
      // Reset form
      setPName('');
      setPPrice('');
      setPDiscountPrice('');
      setPDescription('');
      setPPhotos([]);
      setSellerTab('products');
    } catch (err: any) {
      showToast(err.message || 'Failed to list product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      showToast(`Order status updated to: ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      showToast('Failed to update order status.');
    }
  };

  const handleSavePaymentConfig = async () => {
    try {
      await api.configureSellerPaymentMethods(currentSeller.id, gcashEnabled, mayaEnabled, codEnabled);
      showToast('Payment methods configuration saved!');
    } catch {
      showToast('Failed to save configuration.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Seller Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center text-amber-200 text-2xl font-black shrink-0">
              {currentSeller.profilePhoto ? (
                <img src={currentSeller.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-white">{currentSeller.shopName}</h1>
                {currentSeller.verified ? (
                  <span className="bg-emerald-400 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center shadow-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Seller ✓
                  </span>
                ) : (
                  <span className="bg-amber-300 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center shadow-xs">
                    Pending Approval
                  </span>
                )}
              </div>

              <p className="text-xs text-amber-100 mt-1 flex items-center space-x-2">
                <span>{currentSeller.ownerName}</span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-0.5" />
                  {currentSeller.municipality}, Surigao del Sur
                </span>
                <span>•</span>
                <span className="flex items-center font-bold">
                  ★ {currentSeller.rating ? currentSeller.rating.toFixed(1) : '5.0'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSellerTab('add_product')}
            className="bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>List New Product</span>
          </button>
        </div>
      </div>

      {/* Seller Sub-navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => setSellerTab('dashboard')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            sellerTab === 'dashboard'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setSellerTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            sellerTab === 'orders'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-blue-600" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setSellerTab('products')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            sellerTab === 'products'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setSellerTab('add_product')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            sellerTab === 'add_product'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-amber-600" />
          <span>Add Product</span>
        </button>

        <button
          onClick={() => setSellerTab('payments')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            sellerTab === 'payments'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-purple-600" />
          <span>Payment Accounts</span>
        </button>
      </div>

      {/* ======================================= */}
      {/* VIEW 1: OVERVIEW & STATS */}
      {/* ======================================= */}
      {sellerTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Product Sales</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                ₱{(totalSales ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{completedOrders.length} completed orders</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Platform Commission (3%)</span>
              <span className="text-xl font-black text-rose-600 mt-1 block">
                ₱{totalCommissionDeducted.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Exempt from delivery fees</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Take-Home Earnings</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">
                ₱{netEarnings.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Gross sales minus 3%</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Listings</span>
              <span className="text-xl font-black text-blue-900 mt-1 block">
                {products.length}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">In {currentSeller.municipality}</span>
            </div>
          </div>

          {/* Pending Orders Action Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Recent Store Orders</h3>
                <p className="text-xs text-slate-500">Orders requiring your attention or fulfillment</p>
              </div>
              <button
                onClick={() => setSellerTab('orders')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No orders received yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">Order #{o.id}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-md uppercase">
                          {o.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {o.items.length} items • Total: ₱{(o.totalPaid ?? 0).toLocaleString()} • Status: <strong className="capitalize">{o.orderStatus.replace(/_/g, ' ')}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setSellerTab('orders')}
                      className="bg-white border border-slate-300 hover:border-amber-600 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Manage Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 2: ORDERS MANAGEMENT & FULFILLMENT */}
      {/* ======================================= */}
      {sellerTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Orders Pipeline</h3>
            <span className="text-xs text-slate-500">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No orders have been placed for your store yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">Order #{o.id}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Placed on {new Date(o.createdAt).toLocaleDateString()} • Payment: <strong className="uppercase">{o.paymentMethod}</strong>
                      </p>
                    </div>

                    <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Payment Reference Check if GCash / Maya */}
                  {o.paymentMethod !== 'cod' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-blue-900 uppercase">
                          {o.paymentMethod.toUpperCase()} Payment Reference:
                        </span>
                        <p className="font-mono font-bold text-slate-900">
                          {o.paymentReference?.refNumber || o.paymentReferenceNumber || 'Waiting for buyer reference'}
                        </p>
                      </div>
                      <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                        Digital Verification
                      </span>
                    </div>
                  )}

                  {/* Delivery Location */}
                  <div className="text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Delivery Address</span>
                    <p className="font-medium text-slate-800">{o.buyerAddress || o.deliveryAddress}</p>
                    {o.notesToSeller && (
                      <p className="text-[11px] text-amber-800 mt-1 italic">Note: "{o.notesToSeller}"</p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-semibold text-slate-900">₱{((it.price * it.quantity) || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Commission Breakdown (Section 8) */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-[11px] space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Product Subtotal:</span>
                      <span className="font-bold text-slate-900">₱{(o.productSubtotal ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee {o.deliveryDistanceKm ? `(${o.deliveryDistanceKm} km)` : ''}:</span>
                      <span>₱{(o.deliveryFee ?? 0).toFixed(2)}</span>
                    </div>
                    {o.riderName && (
                      <div className="flex justify-between text-emerald-800">
                        <span>Delivery Rider Partner:</span>
                        <span>{o.riderName} (100% fee paid to rider)</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-blue-950 pt-1 border-t border-slate-200">
                      <span>Total Paid:</span>
                      <span>₱{(o.totalPaid ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Platform Commission (3% on products):</span>
                      <span>-₱{(o.commissionAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Seller Net Earnings:</span>
                      <span>₱{o.sellerNetAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status Progression Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    {o.orderStatus === 'order_placed' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'seller_confirmed')}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}

                    {o.orderStatus === 'seller_confirmed' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'preparing')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Mark as Preparing
                      </button>
                    )}

                    {o.orderStatus === 'preparing' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'ready_for_pickup_out_for_delivery')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Out for Delivery / Ready
                      </button>
                    )}

                    {o.orderStatus === 'ready_for_pickup_out_for_delivery' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'delivered')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 3: INVENTORY & PRODUCTS */}
      {/* ======================================= */}
      {sellerTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Product Inventory</h3>
            <button
              onClick={() => setSellerTab('add_product')}
              className="bg-blue-950 text-amber-400 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs"
            >
              + Add New Listing
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Stock: {p.stock}
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold uppercase">{p.category}</span>
                    <h4 className="font-bold text-slate-900 line-clamp-1 mt-0.5">{p.name}</h4>
                    <p className="text-slate-500 line-clamp-2 text-[11px] mt-1">{p.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-blue-950 text-sm">
                        ₱{((p.discountPrice || p.price) || 0).toLocaleString()}
                      </span>
                      {p.discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1">
                          ₱{(p.price || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setProductDetailId(p.id)}
                      className="text-blue-700 hover:text-blue-900 font-bold text-xs"
                    >
                      View Page →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 4: ADD NEW PRODUCT FORM */}
      {/* ======================================= */}
      {sellerTab === 'add_product' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-4 text-xs">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">List a New Product</h3>
            <p className="text-slate-500">
              List local goods, produce, seafood, handicrafts, or merchandise from {currentSeller.municipality}
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. Madrid Sweet Watermelon (Fresh Harvest)"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                >
                  {MARKETPLACE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available Quantity / Stock *</label>
                <input
                  type="number"
                  min={1}
                  value={pStock}
                  onChange={(e) => setPStock(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regular Price (PHP) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sale / Discount Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 120.00"
                  value={pDiscountPrice}
                  onChange={(e) => setPDiscountPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Description *</label>
              <textarea
                rows={3}
                placeholder="Describe product freshness, origin barangay, specifications, package weight..."
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
              />
            </div>

            {/* Product Photos Upload with Client Compression */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Upload Product Photos (Multiple supported) *
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {pPhotos.map((photo, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 text-[9px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 cursor-pointer flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px] font-bold">+ Photo</span>
                </label>
              </div>
              <p className="text-[10px] text-slate-400">
                Images are automatically compressed to save data for buyers on 3G/4G connections.
              </p>
            </div>

            {/* Fulfillment Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pDelivery}
                  onChange={(e) => setPDelivery(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">Local Delivery Available</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pPickup}
                  onChange={(e) => setPPickup(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">Store Pickup Available</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs disabled:opacity-50"
              >
                {submittingProduct ? 'Publishing Product...' : 'PUBLISH PRODUCT LISTING'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 5: DEDICATED SELLER PAYMENT ACCOUNTS */}
      {/* ======================================= */}
      {sellerTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-700" />
              <span>Seller Payment Method Settings</span>
            </h3>
            <p className="text-slate-500">
              Configure which payment methods your store accepts and connect your official merchant accounts.
            </p>
          </div>

          {/* Security Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-600 text-[11px] leading-relaxed flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              Your phone numbers are masked when displayed to buyers. Never share OTP or PIN with anyone.
            </p>
          </div>

          <div className="space-y-4">
            {/* GCash Setting */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center">
                    G
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">GCash Payment Details</h4>
                    <span className="text-[10px] text-slate-500">
                      {currentSeller.paymentMethods?.gcash?.linked ? 'Linked Account' : 'Not Linked'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentLinkModal({ role: 'seller', method: 'gcash' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  {currentSeller.paymentMethods?.gcash?.linked ? 'Update GCash' : '[ LINK GCASH ]'}
                </button>
              </div>

              {currentSeller.paymentMethods?.gcash?.linked && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                  <p>Account Name: <strong className="text-slate-900">{currentSeller.paymentMethods.gcash.accountName}</strong></p>
                  <p>Masked Number: <span className="font-mono text-slate-800 font-bold">{currentSeller.paymentMethods.gcash.maskedMobile}</span></p>
                </div>
              )}

              <label className="flex items-center space-x-2 text-slate-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gcashEnabled}
                  onChange={(e) => setGcashEnabled(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold">Enable GCash checkout for my shop</span>
              </label>
            </div>

            {/* Maya Setting */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Maya Payment Details</h4>
                    <span className="text-[10px] text-slate-500">
                      {currentSeller.paymentMethods?.maya?.linked ? 'Linked Account' : 'Not Linked'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentLinkModal({ role: 'seller', method: 'maya' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  {currentSeller.paymentMethods?.maya?.linked ? 'Update Maya' : '[ LINK MAYA ]'}
                </button>
              </div>

              {currentSeller.paymentMethods?.maya?.linked && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                  <p>Account Name: <strong className="text-slate-900">{currentSeller.paymentMethods.maya.accountName}</strong></p>
                  <p>Masked Number: <span className="font-mono text-slate-800 font-bold">{currentSeller.paymentMethods.maya.maskedMobile}</span></p>
                </div>
              )}

              <label className="flex items-center space-x-2 text-slate-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mayaEnabled}
                  onChange={(e) => setMayaEnabled(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold">Enable Maya checkout for my shop</span>
              </label>
            </div>

            {/* COD Setting */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center">
                  ₱
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Cash on Delivery (COD)</h4>
                  <span className="text-[10px] text-slate-500">Collect payment upon arrival</span>
                </div>
              </div>

              <label className="flex items-center space-x-2 text-slate-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="font-semibold">Accept Cash on Delivery for local orders</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSavePaymentConfig}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs"
          >
            Save Payment Preferences
          </button>
        </div>
      )}
    </div>
  );
};
