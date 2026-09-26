import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Package,
  ShoppingBag,
  MapPin,
  Flag,
  Megaphone,
  FileText,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  KeyRound,
  Filter,
  Search,
  Lock,
  Layers,
  BarChart3,
  Bike,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Plus,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SellerProfile,
  Product,
  Order,
  Report,
  Advertisement,
  Announcement,
  AdminAuditLog,
  PlatformSettings,
  RiderProfile
} from '../../types';
import { api } from '../../services/api';
import { SURIGAO_DEL_SUR_MUNICIPALITIES, PROHIBITED_ITEMS } from '../../data/surigaoData';

export const AdminDashboard: React.FC = () => {
  const {
    currentAdmin,
    adminTab,
    setAdminTab,
    setAdminPasswordModalOpen,
    setPaymentLinkModal,
    showToast
  } = useApp();

  // Overview stats
  const [overview, setOverview] = useState<any>(null);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [muniStats, setMuniStats] = useState<any[]>([]);

  // Management lists
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [riders, setRiders] = useState<RiderProfile[]>([]);

  // Filters & inputs
  const [financeMuniFilter, setFinanceMuniFilter] = useState('All');
  const [orderPayFilter, setOrderPayFilter] = useState('All');
  const [commissionInputRate, setCommissionInputRate] = useState('3');
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  // Ads management state (Requirement 5: Admin Ads Management)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adFormBiz, setAdFormBiz] = useState('');
  const [adFormImage, setAdFormImage] = useState('');
  const [adFormLink, setAdFormLink] = useState('');
  const [adFormPlacement, setAdFormPlacement] = useState<'home_banner' | 'category_top' | 'near_you'>('home_banner');
  const [adFormActive, setAdFormActive] = useState(true);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAllAdminData = () => {
    setLoading(true);

    api.getAdminOverview().then((res) => setOverview(res)).catch(console.error);
    api.getFinanceStats({ municipality: financeMuniFilter !== 'All' ? financeMuniFilter : undefined })
      .then((res) => setFinanceStats(res))
      .catch(console.error);
    api.getMunicipalityStats().then((res) => setMuniStats(res.municipalities || [])).catch(console.error);
    api.getSellers().then((res) => setSellers(res.sellers || [])).catch(console.error);
    api.getProducts().then((res) => setProducts(res.products || [])).catch(console.error);
    api.getOrders().then((res) => setOrders(res.orders || [])).catch(console.error);
    api.getReports().then((res) => setReports(res.reports || [])).catch(console.error);
    api.getAdvertisements().then((res) => setAds(res.advertisements || [])).catch(console.error);
    api.getAnnouncements().then((res) => setAnnouncements(res.announcements || [])).catch(console.error);
    api.getAuditLogs().then((res) => setAuditLogs(res.auditLogs || [])).catch(console.error);
    api.getRiders().then((res) => setRiders(res.riders || [])).catch(console.error);
    api.getSettings().then((res) => {
      setSettings(res.settings);
      setCommissionInputRate(res.settings.commissionRate.toString());
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllAdminData();
    const interval = setInterval(fetchAllAdminData, 7000);
    return () => clearInterval(interval);
  }, [financeMuniFilter]);

  if (!currentAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          Please log in using one of the 8 authorized provincial admin accounts (admin1 - admin8).
        </p>
      </div>
    );
  }

  // Verification actions
  const handleVerifySeller = async (sellerId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateSellerVerification(sellerId, status, undefined, currentAdmin.username);
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status, verified: status === 'approved' } : s))
      );
      showToast(`Seller status updated to: ${status.toUpperCase()}`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to update seller verification.');
    }
  };

  // Rider verification actions (Requirement 1: Rider Registration Approval)
  const handleVerifyRider = async (riderId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateRiderStatus(riderId, status, undefined, currentAdmin.username);
      setRiders((prev) =>
        prev.map((r) =>
          r.id === riderId
            ? { ...r, status, verified: status === 'approved', active: status === 'approved' }
            : r
        )
      );
      showToast(`Rider partner status updated to: ${status.toUpperCase()}`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to update rider verification status.');
    }
  };

  // Ads management actions (Requirement 5: Admin Ads Management)
  const handleOpenEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setAdFormBiz(ad.businessName);
    setAdFormImage(ad.image);
    setAdFormLink(ad.link);
    setAdFormPlacement(ad.placement);
    setAdFormActive(ad.active);
  };

  const handleSaveEditAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    try {
      const res = await api.updateAdvertisement(editingAd.id, {
        businessName: adFormBiz.trim(),
        image: adFormImage.trim(),
        link: adFormLink.trim(),
        placement: adFormPlacement,
        active: adFormActive,
        adminUsername: currentAdmin.username
      });
      setAds((prev) => prev.map((a) => (a.id === editingAd.id ? res.advertisement : a)));
      setEditingAd(null);
      showToast('Advertisement in Ads Corner updated successfully!');
      fetchAllAdminData();
    } catch {
      showToast('Failed to update advertisement.');
    }
  };

  const handleToggleAdActive = async (ad: Advertisement) => {
    try {
      const newStatus = !ad.active;
      const res = await api.updateAdvertisement(ad.id, {
        active: newStatus,
        adminUsername: currentAdmin.username
      });
      setAds((prev) => prev.map((a) => (a.id === ad.id ? res.advertisement : a)));
      showToast(`Ad "${ad.businessName}" ${newStatus ? 'is now POSTED in Ads Corner' : 'is now HIDDEN from Ads Corner'}.`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to toggle ad status.');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await api.deleteAdvertisement(adId, currentAdmin.username);
      setAds((prev) => prev.filter((a) => a.id !== adId));
      showToast('Advertisement removed from Ads Corner.');
      fetchAllAdminData();
    } catch {
      showToast('Failed to delete advertisement.');
    }
  };

  const handleCreateNewAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFormBiz.trim() || !adFormImage.trim()) {
      showToast('Please provide business sponsor name and image banner URL.');
      return;
    }
    try {
      const res = await api.createAdvertisement({
        businessName: adFormBiz.trim(),
        image: adFormImage.trim(),
        link: adFormLink.trim() || '#',
        placement: adFormPlacement,
        active: adFormActive,
        adminUsername: currentAdmin.username
      });
      setAds((prev) => [res.advertisement, ...prev]);
      setIsCreatingAd(false);
      setAdFormBiz('');
      setAdFormImage('');
      setAdFormLink('');
      showToast('New advertisement created and published to Ads Corner!');
      fetchAllAdminData();
    } catch {
      showToast('Failed to create advertisement.');
    }
  };

  // Product moderation
  const handleModerateProduct = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      await api.moderateProduct(productId, status, undefined, currentAdmin.username);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status } : p))
      );
      showToast(`Product listing marked as ${status.toUpperCase()}`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to update product status.');
    }
  };

  // Report resolution
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.resolveReport(reportId, status, `Reviewed and resolved by ${currentAdmin.username}`, currentAdmin.username);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, resolvedBy: currentAdmin.username } : r))
      );
      showToast(`Report marked as ${status.toUpperCase()}`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to update report.');
    }
  };

  // Update commission rate
  const handleUpdateCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(commissionInputRate);
    if (isNaN(rate) || rate < 0 || rate > 10) {
      showToast('Commission rate must be between 0% and 10%.');
      return;
    }

    try {
      await api.updateSettings({ commissionRate: rate, adminUsername: currentAdmin.username });
      setSettings((prev) => prev ? { ...prev, commissionRate: rate } : null);
      showToast(`Platform commission rate updated to ${rate}%!`);
      fetchAllAdminData();
    } catch {
      showToast('Failed to update commission rate.');
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim()) return;

    try {
      await api.createAnnouncement({
        title: newAnnouncementTitle.trim(),
        content: newAnnouncementContent.trim(),
        authorAdmin: currentAdmin.username
      });
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      showToast('Public provincial announcement broadcasted!');
      fetchAllAdminData();
    } catch {
      showToast('Failed to create announcement.');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderPayFilter === 'All') return true;
    return o.paymentMethod.toLowerCase() === orderPayFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white">Provincial Governance & Commission</h1>
                <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {currentAdmin.username}
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Surigao del Sur Independent Online Marketplace Management Console
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setAdminPasswordModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl border border-white/20 transition-colors flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Security / Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none gap-1">
        {[
          { key: 'dashboard', label: 'Overview', icon: BarChart3 },
          { key: 'commission', label: '3% Commission & Revenue', icon: DollarSign },
          { key: 'municipalities', label: '19 LGUs Analytics', icon: MapPin },
          { key: 'sellers', label: `Sellers (${sellers.filter((s) => s.status === 'pending').length} Pending)`, icon: Store },
          { key: 'riders', label: `Riders (${riders.filter((r) => r.status === 'pending').length} Pending)`, icon: Bike },
          { key: 'products', label: 'Product Moderation', icon: Package },
          { key: 'orders', label: 'All Orders & Payments', icon: ShoppingBag },
          { key: 'ads', label: `Ads Corner (${ads.length})`, icon: ImageIcon },
          { key: 'reports', label: `Reports (${reports.filter((r) => r.status === 'new' || r.status === 'under_review').length})`, icon: Flag },
          { key: 'announcements', label: 'Announcements', icon: Megaphone },
          { key: 'audit_logs', label: 'Audit Logs', icon: FileText },
          { key: 'settings', label: 'Platform & Official Treasury', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================= */}
      {/* VIEW 1: OVERVIEW DASHBOARD */}
      {/* ======================================= */}
      {adminTab === 'dashboard' && overview && (
        <div className="space-y-6">
          {/* Key Metric Cards (Requirement 6: Sales and Commission Separation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Admin Total Sales (Commissions Earned)</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                ₱{(overview.totalCommissionRevenue ?? overview.platformRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Admin sales consists only of commissions earned from sellers</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Seller Merchant Sales</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₱{(overview.totalGrossSales ?? overview.grossMarketplaceSales ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Recorded as sellers' own merchandise income</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Sellers</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {overview.totalSellers ?? 0}
              </span>
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">
                {(overview.pendingSellerApprovals ?? overview.pendingSellers ?? 0)} awaiting verification
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Products</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {overview.totalProducts}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Across 19 municipalities</span>
            </div>
          </div>

          {/* Pending Verifications Callout */}
          {(overview.pendingSellerApprovals ?? overview.pendingSellers ?? 0) > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    {(overview.pendingSellerApprovals ?? overview.pendingSellers ?? 0)} Seller Application(s) Awaiting Review
                  </h4>
                  <p className="text-xs text-amber-800">
                    Review submitted IDs and barangay business permits before granting public storefront access.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAdminTab('sellers')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Review Applications
              </button>
            </div>
          )}

          {/* Municipalities Quick Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">
              Top Active Municipalities by Sales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {muniStats.slice(0, 4).map((m, idx) => (
                <div key={m.municipality || m.name || `muni-top-${idx}`} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">{m.municipality || m.name}</span>
                  <span className="text-blue-900 font-extrabold text-sm mt-0.5 block">
                    ₱{(m.totalSales ?? m.salesAmount ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Comm: ₱{(m.totalCommission ?? (m.salesAmount ? m.salesAmount * 0.03 : 0)).toFixed(2)} • {m.completedOrders ?? m.ordersCount ?? 0} orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 2: 3% COMMISSION & REVENUE SECTION (REQUIREMENT 4 & 5) */}
      {/* ======================================= */}
      {adminTab === 'commission' && financeStats && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Marketplace Commission & Revenue Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Server-side calculated 3% commission on completed product sales (delivery fee exempt)
              </p>
            </div>

            {/* Municipality Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-600">Filter Municipality:</span>
              <select
                value={financeMuniFilter}
                onChange={(e) => setFinanceMuniFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
              >
                <option value="All">All 19 Municipalities</option>
                {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Total Commission Earned (3%)
              </span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                ₱{(financeStats.totalCommissionRevenue ?? financeStats.totalCommission ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                From ₱{(financeStats.totalCompletedSales ?? financeStats.totalSales ?? 0).toLocaleString()} completed product sales
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Orders</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {financeStats.totalCompletedOrders ?? financeStats.completedOrdersCount ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Successful deliveries in Surigao del Sur</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Commission Per Order</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                ₱{(financeStats.avgCommissionPerOrder ?? (financeStats.completedOrdersCount ? (financeStats.totalCommission / financeStats.completedOrdersCount) : 0)).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Average per completed transaction</span>
            </div>
          </div>

          {/* Breakdown Section: By Payment Method & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Payment Method */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-900" />
                <span>Commission by Payment Method</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Breakdown of marketplace revenue across GCash, Maya, and COD
              </p>

              <div className="space-y-2 pt-2 text-xs">
                {Object.entries(financeStats.byPaymentMethod || {}).map(([method, data]: [string, any]) => (
                  <div key={method} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 uppercase">{method}</span>
                      <p className="text-[10px] text-slate-500">{data.count ?? 0} completed orders</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-700 block">
                        ₱{(data.commission ?? 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">Sales: ₱{(data.sales ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configurable Commission Rate (Requirement 5) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-rose-700" />
                <span>Commission Rate Governance</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Default: 3.00% • Configurable range: 0.00% to 10.00%
              </p>

              <form onSubmit={handleUpdateCommissionRate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Provincial Marketplace Rate (%)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={commissionInputRate}
                      onChange={(e) => setCommissionInputRate(e.target.value)}
                      className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-rose-600 outline-hidden font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
                    >
                      Update Rate
                    </button>
                  </div>
                </div>

                {/* Calculation Example Box */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900 block">Calculation Example (₱1,000 Product Sale):</span>
                  <div className="flex justify-between">
                    <span>Product Sale Amount:</span>
                    <span className="font-semibold text-slate-900">₱1,000.00</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Marketplace Commission ({commissionInputRate}%):</span>
                    <span className="font-bold">-₱{(1000 * parseFloat(commissionInputRate || '3') / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                    <span>Seller Receives:</span>
                    <span>₱{(1000 - (1000 * parseFloat(commissionInputRate || '3') / 100)).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 italic">
                    * Delivery fee of ₱60.00 is 100% remitted to the local courier/seller.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 3: 19 LGUs ANALYTICS (REQUIREMENT 9) */}
      {/* ======================================= */}
      {adminTab === 'municipalities' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              19 Municipalities & Cities of Surigao del Sur Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Total sales, 3% commission, active sellers, and completed orders for every single LGU
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Municipality / City</th>
                    <th className="py-3 px-4 text-right">Total Sales</th>
                    <th className="py-3 px-4 text-right">3% Commission</th>
                    <th className="py-3 px-4 text-center">Active Sellers</th>
                    <th className="py-3 px-4 text-center">Completed Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {muniStats.map((m, idx) => (
                    <tr key={m.municipality || m.name || `muni-row-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {m.municipality || m.name} {m.isCity ? '(Component City)' : ''}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        ₱{(m.totalSales ?? m.salesAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-700">
                        ₱{(m.totalCommission ?? (m.salesAmount ? m.salesAmount * 0.03 : 0)).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {m.activeSellers ?? m.sellersCount ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {m.completedOrders ?? m.ordersCount ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 4: SELLER ACCOUNTS & VERIFICATION */}
      {/* ======================================= */}
      {adminTab === 'sellers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Seller Verifications & Accounts</h2>
              <p className="text-xs text-slate-500">
                Inspect valid IDs and business permits to grant Verified Seller ✓ status
              </p>
            </div>
            <span className="text-xs text-slate-500">{sellers.length} total sellers</span>
          </div>

          <div className="space-y-4">
            {sellers.map((s, idx) => (
              <div
                key={s.id || `seller-${idx}`}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                      {s.profilePhoto ? (
                        <img src={s.profilePhoto} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Store className="w-6 h-6 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{s.shopName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            s.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Owner: <strong>{s.ownerName}</strong> • {s.municipality}, Surigao del Sur • {s.mobileNumber}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {s.status !== 'approved' && (
                      <button
                        onClick={() => handleVerifySeller(s.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Seller</span>
                      </button>
                    )}

                    {s.status !== 'rejected' && (
                      <button
                        onClick={() => handleVerifySeller(s.id, 'rejected')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Address</span>
                    <p className="font-medium text-slate-800">{s.businessAddress}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Description</span>
                    <p className="text-slate-700 line-clamp-2">{s.shopDescription}</p>
                  </div>
                </div>

                {/* Document Verification Proofs */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                  <span className="font-bold text-slate-700">Verification Proofs:</span>
                  {s.idDocumentUrl ? (
                    <a
                      href={s.idDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-300 hover:border-blue-600 text-blue-700 font-semibold px-2.5 py-1 rounded-lg"
                    >
                      View Government ID Document ↗
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No ID uploaded</span>
                  )}

                  {s.businessPermitUrl ? (
                    <a
                      href={s.businessPermitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-300 hover:border-blue-600 text-blue-700 font-semibold px-2.5 py-1 rounded-lg"
                    >
                      View Barangay / Business Permit ↗
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No Permit uploaded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW: REGISTERED RIDERS & LOGISTICS */}
      {/* ======================================= */}
      {adminTab === 'riders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Bike className="w-5 h-5 text-emerald-700" />
                <span>Delivery Rider Partners & Fare Reconciliation</span>
              </h2>
              <p className="text-xs text-slate-500">
                Independent provincial delivery couriers operating across Surigao del Sur
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold">
              0% Platform Fee Deducted (100% to Riders)
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Registered Riders</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{riders.length}</span>
              <span className="text-[10px] text-emerald-600">Active throughout Surigao del Sur</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Delivery Earnings</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                ₱{riders.reduce((sum, r) => sum + (r.totalEarnings || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">Distributed 100% without commission</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Rate Formula Standard</span>
              <span className="text-sm font-black text-blue-950 mt-1 block">Grab Philippines Reference</span>
              <span className="text-[10px] text-slate-500">Base ₱49 (2km) + ₱10/km thereafter</span>
            </div>
          </div>

          {/* Riders List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Rider Details</th>
                    <th className="py-3 px-4">Home Municipality</th>
                    <th className="py-3 px-4">Vehicle & Plate</th>
                    <th className="py-3 px-4 text-center">Deliveries Done</th>
                    <th className="py-3 px-4 text-right">Rider's Own Delivery Sales</th>
                    <th className="py-3 px-4 text-center">Verification Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riders.map((r, idx) => (
                    <tr key={r.id || `rider-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{r.riderName}</span>
                        <span className="text-[11px] text-slate-500">{r.mobileNumber}</span>
                        <span className="text-[10px] text-slate-400 block">{r.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{r.municipality}</span>
                        <span className="text-[10px] text-slate-400 block">{r.barangay}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{r.vehicleType}</span>
                        <span className="text-[10px] font-mono text-slate-500 block">Plate: {r.plateNumber}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">License: {r.licenseNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {r.totalDeliveries}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">
                        ₱{(r.totalEarnings || 0).toLocaleString()}
                        <span className="text-[9px] text-slate-400 font-normal block">0% fee deduction (100% rider)</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.status === 'pending' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full inline-block">
                            Pending Verification
                          </span>
                        ) : r.status === 'approved' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block">
                            Approved Partner ✓
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full inline-block">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {r.status !== 'approved' && (
                            <button
                              onClick={() => handleVerifyRider(r.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              onClick={() => handleVerifyRider(r.id, 'rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs transition-colors flex items-center space-x-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 5: PRODUCT MODERATION */}
      {/* ======================================= */}
      {adminTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Product Moderation & Safety</h2>
              <p className="text-xs text-slate-500">
                Filter and remove illegal goods, firearms, wildlife, and prohibited listings
              </p>
            </div>
            <span className="text-xs text-slate-500">{products.length} listed items</span>
          </div>

          {/* Prohibited items warning banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 space-y-1">
            <span className="font-bold flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Surigao del Sur Prohibited Goods Policy:</span>
            </span>
            <p className="text-[11px] text-rose-800">
              Alcohol, tobacco, firearms, illegal drugs, prescription medications, wildlife/endangered species, pirated media, and hazardous chemicals are strictly barred.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p, idx) => (
              <div
                key={p.id || `product-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between text-xs"
              >
                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">{p.category}</span>
                    <h4 className="font-bold text-slate-900 mt-0.5 line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Seller: {p.sellerShopName} • {p.municipality}
                    </p>
                    <span className="font-black text-sm text-blue-950 mt-1 block">
                      ₱{((p.discountPrice || p.price) || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    {p.status === 'approved' ? (
                      <button
                        onClick={() => handleModerateProduct(p.id, 'rejected')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-xl text-xs transition-colors"
                      >
                        Remove Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerateProduct(p.id, 'approved')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-xl text-xs transition-colors"
                      >
                        Restore Listing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 6: ALL ORDERS & PAYMENT VERIFICATION */}
      {/* ======================================= */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">All Marketplace Orders & Payments</h2>
              <p className="text-xs text-slate-500">
                View submitted GCash / Maya reference numbers and commission settlement
              </p>
            </div>

            {/* Filter by payment method */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-600">Payment Method:</span>
              <select
                value={orderPayFilter}
                onChange={(e) => setOrderPayFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
              >
                <option value="All">All Methods (GCash, Maya, COD)</option>
                <option value="gcash">GCash Only</option>
                <option value="maya">Maya Only</option>
                <option value="cod">Cash on Delivery Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Seller & Municipality</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Payment Ref</th>
                    <th className="py-3 px-4 text-right">Product Total</th>
                    <th className="py-3 px-4 text-right">Delivery Fee (Rider)</th>
                    <th className="py-3 px-4 text-right">3% Commission</th>
                    <th className="py-3 px-4 text-right">Seller Net</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o, idx) => (
                    <tr key={o.id || `order-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">#{o.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{o.sellerShopName}</span>
                        <span className="text-[10px] text-slate-400">{o.sellerMunicipality}</span>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-slate-700">
                        {o.paymentMethod}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-900 font-bold">
                        {o.paymentReference?.refNumber || o.paymentReferenceNumber || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        ₱{(o.productSubtotal ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-800 block">₱{(o.deliveryFee ?? 0).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 block">
                          {o.deliveryDistanceKm ? `${o.deliveryDistanceKm}km • ` : ''}{o.riderName || 'Pending Rider'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-700">
                        ₱{(o.commissionAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₱{(o.sellerNetAmount ?? (o.productSubtotal - (o.commissionAmount || 0))).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase">
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW: ADS CORNER & PROMOTIONS (REQUIREMENT 5) */}
      {/* ======================================= */}
      {adminTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-rose-700" />
                <span>Ads Corner & Promotional Banner Management</span>
              </h2>
              <p className="text-xs text-slate-500">
                Edit and manage which advertisements can be posted in the Ads Corner across Surigao del Sur
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAd(null);
                setIsCreatingAd(!isCreatingAd);
              }}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingAd ? 'Close Form' : 'Add New Ad Banner'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Advertisements</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{ads.length}</span>
              <span className="text-[10px] text-slate-500">Configured promotional campaigns</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Posted in Ads Corner</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {ads.filter((a) => a.active).length}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Active & visible to marketplace buyers</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Hidden / Inactive</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {ads.filter((a) => !a.active).length}
              </span>
              <span className="text-[10px] text-slate-400">Offline / Awaiting scheduling</span>
            </div>
          </div>

          {/* EDIT AD MODAL / PANEL */}
          {editingAd && (
            <div className="bg-rose-50/60 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-rose-700" />
                  <h3 className="font-black text-base text-slate-900">
                    Edit Advertisement: <span className="text-rose-800">{editingAd.businessName}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-white"
                >
                  ✕ Cancel
                </button>
              </div>

              <form onSubmit={handleSaveEditAd} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Business Sponsor Name *</label>
                    <input
                      type="text"
                      value={adFormBiz}
                      onChange={(e) => setAdFormBiz(e.target.value)}
                      required
                      placeholder="e.g. Bislig Bay Resort & Eco-Tours"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden font-semibold focus:border-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Target Clickthrough Link</label>
                    <input
                      type="text"
                      value={adFormLink}
                      onChange={(e) => setAdFormLink(e.target.value)}
                      placeholder="e.g. https://facebook.com/bisligresort or #"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-rose-600 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Banner Image URL *</label>
                    <input
                      type="url"
                      value={adFormImage}
                      onChange={(e) => setAdFormImage(e.target.value)}
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-rose-600 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Placement Location</label>
                    <select
                      value={adFormPlacement}
                      onChange={(e) => setAdFormPlacement(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-rose-600 font-semibold"
                    >
                      <option value="home_banner">Ads Corner (Homepage Main Banner)</option>
                      <option value="category_top">Category Header Showcase</option>
                      <option value="near_you">Near You Municipality Feature</option>
                    </select>
                  </div>
                </div>

                {/* Banner Preview */}
                {adFormImage && (
                  <div>
                    <span className="block font-bold text-slate-700 mb-1.5">Live Preview:</span>
                    <div className="rounded-2xl overflow-hidden border border-slate-300 h-28 sm:h-36 relative bg-slate-900">
                      <img
                        src={adFormImage}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-transparent flex items-center p-4 text-white">
                        <div>
                          <span className="text-[9px] bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-sm uppercase">
                            Ads Corner Partner
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base mt-1 text-white">
                            {adFormBiz || 'Business Sponsor Name'}
                          </h4>
                          <span className="text-[10px] text-slate-200 block">
                            Placement: {adFormPlacement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Toggle in Edit */}
                <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="editAdActive"
                    checked={adFormActive}
                    onChange={(e) => setAdFormActive(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
                  />
                  <label htmlFor="editAdActive" className="text-slate-800 font-semibold cursor-pointer">
                    <strong>Post in Ads Corner:</strong> Make this advertisement actively visible to buyers in the Ads Corner
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAd(null)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Advertisement Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CREATE NEW AD FORM */}
          {isCreatingAd && !editingAd && (
            <div className="bg-white rounded-3xl border-2 border-rose-300 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-rose-700" />
                  <span>Create & Post New Advertisement in Ads Corner</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingAd(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewAd} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business Sponsor Name *</label>
                    <input
                      type="text"
                      value={adFormBiz}
                      onChange={(e) => setAdFormBiz(e.target.value)}
                      required
                      placeholder="e.g. Hinatuan Enchanted River Tours"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden font-semibold focus:bg-white focus:border-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Clickthrough Link</label>
                    <input
                      type="text"
                      value={adFormLink}
                      onChange={(e) => setAdFormLink(e.target.value)}
                      placeholder="e.g. https://facebook.com/sponsor or #"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:bg-white focus:border-rose-600 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Banner Image URL *</label>
                    <input
                      type="url"
                      value={adFormImage}
                      onChange={(e) => setAdFormImage(e.target.value)}
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:bg-white focus:border-rose-600 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Placement Location</label>
                    <select
                      value={adFormPlacement}
                      onChange={(e) => setAdFormPlacement(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:bg-white focus:border-rose-600 font-semibold"
                    >
                      <option value="home_banner">Ads Corner (Homepage Main Banner)</option>
                      <option value="category_top">Category Header Showcase</option>
                      <option value="near_you">Near You Municipality Feature</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="newAdActive"
                    checked={adFormActive}
                    onChange={(e) => setAdFormActive(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
                  />
                  <label htmlFor="newAdActive" className="text-slate-800 font-semibold cursor-pointer">
                    <strong>Post in Ads Corner immediately:</strong> Check to activate and display in the Ads Corner right away
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingAd(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Post Advertisement</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADS LIST & MANAGEMENT TABLE/GRID */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">
              Manage Ads Corner Postings ({ads.length} Total)
            </h3>

            {ads.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No advertisements created yet. Click "Add New Ad Banner" above to post an advertisement in the Ads Corner.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map((ad, idx) => (
                  <div
                    key={ad.id || `ad-${idx}`}
                    className={`bg-white rounded-3xl border ${
                      ad.active ? 'border-emerald-200 shadow-sm' : 'border-slate-200 opacity-75'
                    } overflow-hidden flex flex-col justify-between`}
                  >
                    {/* Image Banner */}
                    <div className="h-36 bg-slate-900 relative overflow-hidden group">
                      <img
                        src={ad.image}
                        alt={ad.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                        {ad.active ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>POSTED IN ADS CORNER</span>
                          </span>
                        ) : (
                          <span className="bg-slate-700 text-slate-200 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                            <EyeOff className="w-3 h-3" />
                            <span>HIDDEN</span>
                          </span>
                        )}
                        <span className="bg-blue-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {ad.placement}
                        </span>
                      </div>
                    </div>

                    {/* Ad Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{ad.businessName}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {ad.startDate || 'Provincial Ad'}
                          </span>
                        </div>
                        {ad.link && ad.link !== '#' && (
                          <a
                            href={ad.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 font-mono text-[11px] flex items-center space-x-1 mt-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ad.link}</span>
                          </a>
                        )}
                      </div>

                      {/* Management Controls: Edit, Toggle Active, Delete */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          {/* EDIT AD BUTTON */}
                          <button
                            onClick={() => handleOpenEditAd(ad)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1 border border-blue-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Ad</span>
                          </button>

                          {/* TOGGLE ACTIVE / INACTIVE */}
                          <button
                            onClick={() => handleToggleAdActive(ad)}
                            className={`font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1 border ${
                              ad.active
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {ad.active ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide from Ads</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Post in Ads</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* DELETE AD */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove the advertisement for "${ad.businessName}"?`)) {
                              handleDeleteAd(ad.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="Delete advertisement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 7: REPORTS & DISPUTES */}
      {/* ======================================= */}
      {adminTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Community Safety Reports</h2>
            <span className="text-xs text-slate-500">{reports.length} reports logged</span>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No reports filed by community buyers.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r, idx) => (
                <div
                  key={r.id || `report-${idx}`}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">
                        Report #{r.id}: {r.targetTitle}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Reason: <strong className="text-rose-700 uppercase">{r.reason.replace(/_/g, ' ')}</strong> • Filed by: {r.reporterName}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      r.status === 'resolved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    "{r.details}"
                  </p>

                  {(r.status === 'new' || r.status === 'under_review') && (
                    <div className="flex space-x-2 pt-1 justify-end">
                      <button
                        onClick={() => handleResolveReport(r.id, 'dismissed')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'resolved')}
                        className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs"
                      >
                        Take Moderation Action
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 8: ANNOUNCEMENTS */}
      {/* ======================================= */}
      {adminTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-rose-700" />
              <span>Broadcast Provincial Announcement</span>
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Free Delivery Weekend for Madrid & Cantilan"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content / Message *</label>
                <textarea
                  rows={3}
                  placeholder="Write clear instructions or announcements for buyers and sellers..."
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 rounded-xl shadow-md text-xs transition-colors"
              >
                Broadcast to Marketplace Users
              </button>
            </form>
          </div>

          {/* Existing announcements list */}
          <div className="space-y-3">
            {announcements.map((a, idx) => (
              <div key={a.id || `announcement-${idx}`} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    By {a.authorAdmin || 'Marketplace Administration'} • {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 9: AUDIT LOGS */}
      {/* ======================================= */}
      {adminTab === 'audit_logs' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Administrator Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Immutable server-side audit trail of all administrative actions and moderations
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Affected Record</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log, idx) => (
                    <tr key={log.id || `audit-log-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-800">{log.adminUsername}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.affectedRecord}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.notes || log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 10: OFFICIAL MARKETPLACE TREASURY ACCOUNTS (REQUIREMENT 3) */}
      {/* ======================================= */}
      {adminTab === 'settings' && settings && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Official Marketplace Payment Accounts (Treasury)
                </h3>
                <p className="text-slate-500">
                  Official GCash and Maya accounts authorized to receive provincial platform commissions and advertising fees.
                </p>
              </div>
            </div>

            {/* Official GCash Account */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center">
                  G
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Official Marketplace GCash Account</span>
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
                    <p>Account Name: <strong className="text-slate-900">{settings.adminGcash?.accountName || settings.adminPaymentMethods?.gcash?.accountName || 'Not configured'}</strong></p>
                    <p>Masked Number: <span className="font-mono font-bold text-blue-900">{settings.adminGcash?.maskedMobile || settings.adminPaymentMethods?.gcash?.maskedMobile || '—'}</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPaymentLinkModal({ role: 'admin', method: 'gcash' })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs"
              >
                Configure Official GCash
              </button>
            </div>

            {/* Official Maya Account */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center">
                  M
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Official Marketplace Maya Account</span>
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
                    <p>Account Name: <strong className="text-slate-900">{settings.adminMaya?.accountName || settings.adminPaymentMethods?.maya?.accountName || 'Not configured'}</strong></p>
                    <p>Masked Number: <span className="font-mono font-bold text-emerald-900">{settings.adminMaya?.maskedMobile || settings.adminPaymentMethods?.maya?.maskedMobile || '—'}</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPaymentLinkModal({ role: 'admin', method: 'maya' })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs"
              >
                Configure Official Maya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
