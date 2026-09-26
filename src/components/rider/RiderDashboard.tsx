import React, { useState, useEffect } from 'react';
import {
  Bike,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  Phone,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Navigation,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { api } from '../../services/api';

export const RiderDashboard: React.FC = () => {
  const {
    currentRider,
    currentUser,
    riderTab,
    setRiderTab,
    showToast,
    promptLoginForRole
  } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ totalDeliveries: number; totalEarnings: number; activeDeliveries: number }>({
    totalDeliveries: currentRider?.totalDeliveries || 0,
    totalEarnings: currentRider?.totalEarnings || 0,
    activeDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRiderData = async () => {
    if (!currentRider) return;
    setLoading(true);
    try {
      const ordersRes = await api.getRiderOrders(currentRider.id);
      if (ordersRes?.orders) {
        setOrders(ordersRes.orders);
      }
      const statsRes = await api.getRiderStats(currentRider.id);
      if (statsRes) {
        setStats({
          totalDeliveries: statsRes.totalDeliveries,
          totalEarnings: statsRes.totalEarnings,
          activeDeliveries: statsRes.activeDeliveries
        });
      }
    } catch (err) {
      console.error('Failed to fetch rider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 7000);
    return () => clearInterval(interval);
  }, [currentRider?.id]);

  if (!currentRider) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Delivery Rider Account Required</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto">
          Please log in with your Rider Partner credentials (Account Name and Password) to access assignments, trip logs, and 100% fee earnings.
        </p>
        <button
          onClick={() => promptLoginForRole('rider')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all text-xs sm:text-sm"
        >
          LOG IN AS DELIVERY RIDER
        </button>
      </div>
    );
  }

  // Filter orders
  const availableOrders = orders.filter(
    (o) => !o.riderId && o.fulfillmentType === 'delivery' && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );
  const myActiveOrders = orders.filter(
    (o) => o.riderId === currentRider.id && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );
  const myCompletedOrders = orders.filter(
    (o) => o.riderId === currentRider.id && o.orderStatus === 'completed'
  );

  // Accept a delivery job
  const handleAcceptJob = async (order: Order) => {
    setProcessingId(order.id);
    try {
      const res = await api.acceptDelivery(order.id, currentRider.id, currentRider.riderName, currentRider.mobileNumber);
      if (res.order) {
        showToast(`Job accepted! You are assigned to deliver order #${order.id}.`);
        await fetchRiderData();
        setRiderTab('active');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept delivery job.');
    } finally {
      setProcessingId(null);
    }
  };

  // Update status (e.g. mark delivered)
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setProcessingId(orderId);
    try {
      const res = await api.updateRiderDeliveryStatus(orderId, currentRider.id, newStatus);
      if (res.order) {
        if (newStatus === 'completed') {
          showToast(`Order #${orderId} marked DELIVERED! Delivery fee added to your earnings.`);
        } else {
          showToast(`Status updated for order #${orderId}`);
        }
        await fetchRiderData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Rider Partner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <Bike className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight">{currentRider.riderName}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  Active Rider Partner
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 flex items-center space-x-1.5 flex-wrap">
                <span>{currentRider.vehicleType}</span>
                <span>•</span>
                <span className="font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-600/40 text-[10px]">
                  Plate: {currentRider.plateNumber}
                </span>
                <span>•</span>
                <span className="flex items-center text-amber-300">
                  <MapPin className="w-3 h-3 mr-0.5" />
                  {currentRider.municipality} Base
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={fetchRiderData}
              disabled={loading}
              className="bg-emerald-800/80 hover:bg-emerald-700 text-white p-2 sm:px-3 sm:py-2 rounded-xl border border-emerald-600/40 flex items-center space-x-1.5 text-xs transition-colors"
              title="Refresh job listings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] px-3 py-1.5 rounded-xl font-medium">
              Grab PH Distance Rate Formula
            </div>
          </div>
        </div>

        {/* Policy Guarantee Banner */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>100% Zero-Commission Guarantee:</strong> Delivery fees belong completely to the rider partner.
            </span>
          </div>
          <span className="text-amber-300 font-medium">
            Base: ₱49 (first 2 km) + ₱10/km thereafter
          </span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Deliveries</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalDeliveries}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Trips Done</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Fee Earnings</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ₱{stats.totalEarnings.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">100% Keep</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active Deliveries</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-blue-700">{myActiveOrders.length}</span>
            <span className="text-[10px] text-blue-600 font-bold">In Transit</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">Partner Rating</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-500">5.0</span>
            <span className="text-amber-500 text-xs">★★★★★</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-semibold mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setRiderTab('dashboard')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
            riderTab === 'dashboard' || riderTab === 'jobs'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Available Jobs ({availableOrders.length})
        </button>

        <button
          onClick={() => setRiderTab('active')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
            riderTab === 'active'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Active Jobs ({myActiveOrders.length})
        </button>

        <button
          onClick={() => setRiderTab('history')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
            riderTab === 'history'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trip History ({myCompletedOrders.length})
        </button>

        <button
          onClick={() => setRiderTab('profile')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
            riderTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rider Profile
        </button>
      </div>

      {/* TAB CONTENT: AVAILABLE JOBS */}
      {(riderTab === 'dashboard' || riderTab === 'jobs') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>Available Delivery Opportunities in Surigao del Sur</span>
            </h2>
            <span className="text-xs text-slate-500">Live Queue</span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Open Delivery Requests Right Now</h3>
              <p className="text-xs max-w-sm mx-auto">
                Orders requiring rider delivery will appear here as soon as local buyers place delivery checkouts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => {
                const distance = order.deliveryDistanceKm || 5;
                return (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Order Header & Earnings Highlight */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">#{order.id}</span>
                          <span className="text-xs font-bold text-slate-900 block mt-0.5">
                            {order.items.length} item(s) • Subtotal: ₱{order.productSubtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
                          <span className="text-[10px] text-emerald-800 font-semibold block">Your Earnings</span>
                          <span className="text-base font-black text-emerald-700">₱{order.deliveryFee.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="py-3 space-y-2.5 text-xs">
                        <div className="flex items-start space-x-2.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                            P
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">PICKUP STORE</span>
                            <span className="font-bold text-slate-800">{order.sellerShopName}</span>
                            <p className="text-slate-500 text-[11px]">{order.sellerMunicipality}, Surigao del Sur</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                            D
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">DELIVER TO</span>
                            <span className="font-bold text-slate-800">{order.buyerName}</span>
                            <p className="text-slate-500 text-[11px]">{order.buyerAddress}</p>
                          </div>
                        </div>

                        {/* Grab PH Distance Meter */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Distance: <strong>{distance} km</strong></span>
                          </div>
                          <span className="text-slate-500">
                            Rate: ₱49 (2km) + ₱10/km
                          </span>
                        </div>

                        {/* Payment & Collection Protocol */}
                        <div className="text-[11px] bg-amber-50/70 border border-amber-200 rounded-xl p-2 text-amber-900">
                          {order.paymentMethod === 'cod' ? (
                            <span>
                              <strong>COD Order:</strong> Collect <strong>₱{order.totalPaid.toLocaleString()}</strong> from buyer. Keep ₱{order.deliveryFee} delivery fee, remit ₱{order.sellerNetAmount.toFixed(2)} to seller.
                            </span>
                          ) : (
                            <span>
                              <strong>Prepaid Order ({order.paymentMethod.toUpperCase()}):</strong> Product is pre-paid. Collect <strong>₱{order.deliveryFee}</strong> delivery fee upon drop-off!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptJob(order)}
                      disabled={processingId === order.id}
                      className="w-full mt-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{processingId === order.id ? 'Accepting...' : 'ACCEPT DELIVERY ASSIGNMENT'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MY ACTIVE JOBS */}
      {riderTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>In-Progress Deliveries</span>
            </h2>
            <span className="text-xs text-slate-500">{myActiveOrders.length} active</span>
          </div>

          {myActiveOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Active Orders</h3>
              <p className="text-xs max-w-sm mx-auto">
                You have no active orders in transit. Check the Available Jobs tab to accept a new delivery.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-400">#{order.id}</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base mt-1">
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Rider Net Payout</span>
                      <span className="text-lg font-black text-emerald-700">₱{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Route & Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">1. Pickup Origin</span>
                      <p className="font-bold text-slate-800">{order.sellerShopName}</p>
                      <p className="text-slate-500 text-[11px]">{order.sellerMunicipality}, Surigao del Sur</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">2. Destination Buyer</span>
                      <p className="font-bold text-slate-800">{order.buyerName}</p>
                      <p className="text-slate-500 text-[11px]">{order.buyerAddress}</p>
                      <p className="text-blue-700 font-semibold text-[11px] mt-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Mobile: {order.buyerMobile}
                      </p>
                    </div>
                  </div>

                  {/* Distance and Settlement */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-emerald-700" />
                      <span>
                        Route Distance: <strong>{order.deliveryDistanceKm || 5} km</strong> (Grab PH Base ₱49 + ₱10/km)
                      </span>
                    </div>
                    <div>
                      {order.paymentMethod === 'cod' ? (
                        <span className="font-bold text-amber-800">
                          Collect Cash: ₱{order.totalPaid.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-800">
                          Prepaid (Verify signature on drop-off)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup_out_for_delivery')}
                      disabled={processingId === order.id}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                    >
                      Picked Up Package from Seller
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      disabled={processingId === order.id}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{processingId === order.id ? 'Processing...' : 'Mark Delivered & Complete (Earn ₱' + order.deliveryFee + ')'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TRIP HISTORY */}
      {riderTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Completed Delivery Records & Earnings</span>
            </h2>
            <span className="text-xs text-slate-500">{myCompletedOrders.length} completed</span>
          </div>

          {myCompletedOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Completed Deliveries Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Completed jobs will automatically appear here with exact Grab PH distance, fee amounts, and payout receipts.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Origin Store</th>
                      <th className="py-3 px-4">Destination Buyer</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4">Fee Earned</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myCompletedOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">#{ord.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ord.sellerShopName}
                          <span className="block text-[10px] text-slate-400 font-normal">{ord.sellerMunicipality}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {ord.buyerName}
                          <span className="block text-[10px] text-slate-400">{ord.buyerMunicipality}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {ord.deliveryDistanceKm || 5} km
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ₱{ord.deliveryFee.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Delivered & Paid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RIDER PROFILE */}
      {riderTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rider Partner Account Information</h2>
            <p className="text-xs text-slate-500">
              Registered provincial delivery profile. Contact administrator for license or vehicle changes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rider Full Name</span>
              <p className="text-sm font-black text-slate-800">{currentRider.riderName}</p>
              <p className="text-slate-500 mt-0.5">Mobile: {currentRider.mobileNumber}</p>
              <p className="text-slate-500">Email: {currentRider.email}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vehicle Details</span>
              <p className="text-sm font-black text-slate-800">{currentRider.vehicleType}</p>
              <p className="text-slate-500 mt-0.5 font-mono">Plate: {currentRider.plateNumber}</p>
              <p className="text-slate-500 font-mono">License: {currentRider.licenseNumber}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Operational Territory</span>
              <p className="text-sm font-black text-slate-800">{currentRider.municipality}</p>
              <p className="text-slate-500 mt-0.5">Barangay: {currentRider.barangay}</p>
              <p className="text-slate-500">Coverage: All 19 Municipalities & Cities of Surigao del Sur</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Fee Agreement</span>
              <p className="text-sm font-black text-emerald-900">0% Platform Fee Charged</p>
              <p className="text-emerald-700 mt-0.5">
                Riders keep 100% of the distance delivery fare based on Grab Philippines rate reference.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
