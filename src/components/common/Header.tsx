import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  ShoppingCart,
  Bell,
  MessageSquare,
  User,
  Store,
  ShieldCheck,
  Bike,
  Smartphone,
  Monitor,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    currentSeller,
    currentAdmin,
    currentRider,
    isMobileView,
    setIsMobileView,
    selectedMunicipality,
    setSelectedMunicipality,
    searchQuery,
    setSearchQuery,
    buyerTab,
    setBuyerTab,
    sellerTab,
    setSellerTab,
    adminTab,
    setAdminTab,
    riderTab,
    setRiderTab,
    cart,
    notifications,
    setChatRecipient,
    promptLoginForRole,
    setAuthModalOpen,
    setAuthModalTab,
    logout
  } = useApp();

  const [notifDropdown, setNotifDropdown] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Provincial Identity & Strict Account Login Portals */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Provincial Identity Branding */}
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-amber-400">SURIGAO DEL SUR</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline italic text-[11px]">
              “Buy Local. Sell Local. Grow Surigao del Sur.”
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs flex-wrap">
            {/* View Mode Toggle (Mobile simulation vs Full Desktop) */}
            <button
              onClick={() => setIsMobileView(!isMobileView)}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full border border-slate-700 transition-colors text-[11px]"
              title="Toggle Mobile Smartphone Frame view"
            >
              {isMobileView ? (
                <>
                  <Monitor className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Mobile Frame</span>
                </>
              )}
            </button>

            {/* Account Portals: Every click enforces login with Account Name & Password */}
            <div className="flex items-center bg-slate-800/90 rounded-full p-0.5 border border-slate-700 text-[10px] sm:text-[11px] overflow-x-auto no-scrollbar">
              <button
                onClick={() => promptLoginForRole('buyer')}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  role === 'buyer' && currentUser
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Log in to Buyer Account"
              >
                Buyer<span className="hidden sm:inline"> Account</span>
              </button>
              <button
                onClick={() => promptLoginForRole('seller')}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  role === 'seller' && currentSeller
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Log in to Seller Account"
              >
                Seller<span className="hidden sm:inline"> Account</span>
              </button>
              <button
                onClick={() => promptLoginForRole('rider')}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  role === 'rider' && currentRider
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Log in to Delivery Rider Account"
              >
                Rider<span className="hidden sm:inline"> Account</span>
              </button>
              <button
                onClick={() => promptLoginForRole('admin')}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  role === 'admin' && currentAdmin
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Log in to Administrator Account"
              >
                Admin<span className="hidden sm:inline"> Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand Identity */}
        <div
          onClick={() => {
            if (role === 'buyer') setBuyerTab('home');
            else if (role === 'seller') setSellerTab('dashboard');
            else if (role === 'rider') setRiderTab('dashboard');
            else setAdminTab('dashboard');
          }}
          className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-950 text-amber-400 flex items-center justify-center shadow-md border border-amber-400/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm sm:text-base font-black text-blue-950 tracking-tight leading-none">
                SURIGAO DEL SUR
              </span>
              <span className="text-[10px] font-black bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded font-mono">
                SDS
              </span>
            </div>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide leading-tight">
              Provincial Marketplace
            </p>
          </div>
        </div>

        {/* Municipality Selector & Search Bar (Desktop & Tablet) */}
        {role === 'buyer' && (
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4 space-x-2">
            <div className="relative shrink-0 w-44">
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 focus:border-blue-600 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-hidden"
              >
                <option value="All">All 19 Municipalities</option>
                {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search fresh seafood, motor parts, local produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-hidden transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}

        {/* Right Section: Role Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Role Indicator Badge */}
          {role === 'rider' && currentRider && (
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <Bike className="w-4 h-4 text-emerald-700" />
              <div className="text-left text-xs">
                <p className="font-bold text-emerald-950 leading-tight">{currentRider.riderName}</p>
                <p className="text-[10px] text-emerald-700">Rider Partner (100% Fee)</p>
              </div>
            </div>
          )}

          {role === 'seller' && currentSeller && (
            <div className="hidden sm:flex items-center space-x-2 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              <Store className="w-4 h-4 text-amber-700" />
              <div className="text-left text-xs">
                <p className="font-bold text-amber-950 leading-tight">{currentSeller.shopName}</p>
                <p className="text-[10px] text-amber-700">Seller Dashboard</p>
              </div>
            </div>
          )}

          {role === 'admin' && currentAdmin && (
            <div className="hidden sm:flex items-center space-x-2 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-rose-700" />
              <div className="text-left text-xs">
                <p className="font-bold text-rose-950 leading-tight">{currentAdmin.username}</p>
                <p className="text-[10px] text-rose-700">Provincial Administrator</p>
              </div>
            </div>
          )}

          {/* Cart Button (Buyer) */}
          {role === 'buyer' && (
            <button
              onClick={() => setBuyerTab('cart')}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-blue-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdown(!notifDropdown)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
              )}
            </button>

            {notifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] text-slate-500">{notifications.length} recent</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Account Profile / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdown(!roleDropdown)}
              className="flex items-center space-x-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors text-xs"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  role === 'admin'
                    ? 'bg-rose-100 text-rose-800'
                    : role === 'seller'
                    ? 'bg-amber-100 text-amber-800'
                    : role === 'rider'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                {role === 'admin'
                  ? 'A'
                  : role === 'seller'
                  ? 'S'
                  : role === 'rider'
                  ? 'R'
                  : (currentUser?.fullName?.charAt(0) || 'U')}
              </div>
              <span className="font-semibold text-slate-800 hidden md:inline truncate max-w-[100px]">
                {role === 'admin'
                  ? currentAdmin?.username || 'Admin'
                  : role === 'seller'
                  ? currentSeller?.shopName || 'Seller'
                  : role === 'rider'
                  ? currentRider?.riderName || 'Rider'
                  : currentUser?.fullName || 'Buyer'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">
                    {role === 'admin'
                      ? `${currentAdmin?.username || 'Admin'} (Administrator)`
                      : role === 'seller'
                      ? currentSeller?.shopName || 'Seller Portal'
                      : role === 'rider'
                      ? `${currentRider?.riderName || 'Rider'} (Delivery Partner)`
                      : currentUser?.fullName || 'Buyer Account'}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">Active Role: {role}</p>
                </div>

                {/* Sub-menu navigation according to active role */}
                <div className="py-1">
                  {role === 'buyer' && (
                    <>
                      <button
                        onClick={() => {
                          setBuyerTab('profile');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Buyer Profile & Payment Setup</span>
                      </button>
                      <button
                        onClick={() => {
                          setBuyerTab('orders');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>My Orders & Delivery Tracking</span>
                      </button>
                    </>
                  )}

                  {role === 'seller' && (
                    <>
                      <button
                        onClick={() => {
                          setSellerTab('dashboard');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <Store className="w-4 h-4 text-slate-400" />
                        <span>Seller Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setSellerTab('orders');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>Manage Store Orders</span>
                      </button>
                    </>
                  )}

                  {role === 'rider' && (
                    <>
                      <button
                        onClick={() => {
                          setRiderTab('dashboard');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <Bike className="w-4 h-4 text-slate-400" />
                        <span>Available Delivery Jobs</span>
                      </button>
                      <button
                        onClick={() => {
                          setRiderTab('active');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>My In-Progress Deliveries</span>
                      </button>
                    </>
                  )}

                  {role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setAdminTab('dashboard');
                          setRoleDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Admin Overview & 3% Revenue</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  {/* Explicit Portal Logins (Enforces Login on Access) */}
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Access Account Portal
                  </p>
                  <button
                    onClick={() => {
                      promptLoginForRole('buyer');
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-blue-50 text-blue-700 font-medium"
                  >
                    Log In to Buyer Account
                  </button>
                  <button
                    onClick={() => {
                      promptLoginForRole('seller');
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-amber-50 text-amber-700 font-medium"
                  >
                    Log In to Seller Account
                  </button>
                  <button
                    onClick={() => {
                      promptLoginForRole('rider');
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-emerald-50 text-emerald-700 font-medium"
                  >
                    Log In to Rider Account
                  </button>
                  <button
                    onClick={() => {
                      promptLoginForRole('admin');
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-rose-50 text-rose-700 font-medium"
                  >
                    Log In to Admin Account
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Registration & Partnership
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalTab('register_rider');
                      setAuthModalOpen(true);
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center space-x-1.5"
                  >
                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Register as Delivery Rider</span>
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('register_seller');
                      setAuthModalOpen(true);
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-amber-50 text-amber-800 font-semibold flex items-center space-x-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>Register as Merchant Seller</span>
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('register_buyer');
                      setAuthModalOpen(true);
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-blue-50 text-blue-800 font-semibold flex items-center space-x-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Register as Buyer</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setRoleDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Current Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Row (Smartphone Responsive) */}
      {role === 'buyer' && (
        <div className="md:hidden px-3 pb-2.5 flex items-center space-x-2">
          <div className="shrink-0 bg-slate-100 border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-medium text-slate-700 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-amber-600" />
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="bg-transparent border-none outline-hidden text-[11px] font-semibold text-slate-800"
            >
              <option value="All">All LGUs</option>
              {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>
      )}
    </header>
  );
};
