import React, { useState } from 'react';
import {
  X,
  User,
  Store,
  ShieldCheck,
  ShoppingBag,
  Bike,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp, AuthModalTabType } from '../../context/AppContext';
import { SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';
import { api } from '../../services/api';
import { compressImage } from '../../utils/imageCompression';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    setCurrentUser,
    setCurrentSeller,
    setCurrentAdmin,
    setCurrentRider,
    setRole,
    setAdminPasswordModalOpen,
    showToast
  } = useApp();

  // Registration branch selector: null | 'buyer' | 'seller' | 'rider'
  const [registerType, setRegisterType] = useState<'buyer' | 'seller' | 'rider' | null>(null);

  // Buyer Login state (Account Name & Password only)
  const [buyerAccountName, setBuyerAccountName] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');

  // Seller Login state (Account Name & Password only)
  const [sellerAccountName, setSellerAccountName] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');

  // Rider Login state (Account Name & Password only)
  const [riderAccountName, setRiderAccountName] = useState('');
  const [riderPassword, setRiderPassword] = useState('');

  // Admin Login state (Account Name & Password only - Secret fixed account)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Buyer Register fields (Strictly preserved existing fields)
  const [bFullName, setBFullName] = useState('');
  const [bMobile, setBMobile] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bMunicipality, setBMunicipality] = useState(SURIGAO_DEL_SUR_MUNICIPALITIES[0].name);
  const [bBarangay, setBBarangay] = useState('Poblacion');
  const [bAddress, setBAddress] = useState('');
  const [bPhoto, setBPhoto] = useState('');

  // Seller Register fields (Strictly preserved existing fields)
  const [sOwnerName, setSOwnerName] = useState('');
  const [sShopName, setSShopName] = useState('');
  const [sMobile, setSMobile] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sMunicipality, setSMunicipality] = useState(SURIGAO_DEL_SUR_MUNICIPALITIES[0].name);
  const [sBarangay, setSBarangay] = useState('Poblacion');
  const [sBusinessAddress, setSBusinessAddress] = useState('');
  const [sShopDescription, setSShopDescription] = useState('');
  const [sPhoto, setSPhoto] = useState('');
  const [sIdDocument, setSIdDocument] = useState('');
  const [sBusinessPermit, setSBusinessPermit] = useState('');

  // Rider Register fields
  const [rRiderName, setRRiderName] = useState('');
  const [rMobile, setRMobile] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rMunicipality, setRMunicipality] = useState(SURIGAO_DEL_SUR_MUNICIPALITIES[0].name);
  const [rBarangay, setRBarangay] = useState('Poblacion');
  const [rVehicleType, setRVehicleType] = useState('Motorcycle');
  const [rPlateNumber, setRPlateNumber] = useState('');
  const [rLicenseNumber, setRLicenseNumber] = useState('');
  const [rPhoto, setRPhoto] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.75);
      setter(compressed);
      showToast('Image uploaded and optimized for provincial data connection.');
    } catch {
      showToast('Failed to process image.');
    }
  };

  // Buyer Login
  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(buyerAccountName, buyerPassword);
      if (res.user) {
        setCurrentUser(res.user);
        setRole('buyer');
        setAuthModalOpen(false);
        showToast(`Welcome back, Buyer ${res.user.fullName}!`);
      }
    } catch (err: any) {
      setError(err.message || 'Buyer login failed. Please check Account Name and Password.');
    } finally {
      setLoading(false);
    }
  };

  // Seller Login
  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(sellerAccountName, sellerPassword);
      if (res.user) {
        setCurrentUser(res.user);
        if (res.sellerProfile) {
          setCurrentSeller(res.sellerProfile);
        } else {
          // If profile not returned, fetch default seller or by email
          const sellerRes = await api.getSeller('seller_1');
          if (sellerRes?.seller) setCurrentSeller(sellerRes.seller);
        }
        setRole('seller');
        setAuthModalOpen(false);
        showToast(`Welcome back, Seller ${res.sellerProfile?.shopName || res.user.fullName}!`);
      }
    } catch (err: any) {
      setError(err.message || 'Seller login failed. Please verify Seller Account Name and Password.');
    } finally {
      setLoading(false);
    }
  };

  // Rider Login
  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.riderLogin(riderAccountName, riderPassword);
      if (res.rider) {
        setCurrentRider(res.rider);
        setCurrentUser(res.user);
        setRole('rider');
        setAuthModalOpen(false);
        showToast(`Welcome back, Delivery Rider ${res.rider.riderName}!`);
      }
    } catch (err: any) {
      setError(err.message || 'Rider login failed. Please check Rider Account Name and Password.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Login (Account Name & Password only - NO Passkeys)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(adminUsername, adminPassword);
      if (res.admin) {
        setCurrentAdmin(res.admin);
        setRole('admin');
        setAuthModalOpen(false);
        if (res.admin.mustChangePassword) {
          setAdminPasswordModalOpen(true);
        } else {
          showToast(`Logged in as Administrator (${res.admin.username})`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Administrator login failed. Check Account Name and Password.');
    } finally {
      setLoading(false);
    }
  };

  // Preserved Buyer Registration
  const handleRegisterBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerBuyer({
        fullName: bFullName,
        mobileNumber: bMobile,
        email: bEmail,
        municipality: bMunicipality,
        barangay: bBarangay,
        completeAddress: bAddress,
        profilePhoto: bPhoto
      });

      if (res.user) {
        setCurrentUser(res.user);
        setRole('buyer');
        setAuthModalOpen(false);
        showToast('Buyer account created successfully! Welcome to Surigao del Sur Marketplace.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create buyer account.');
    } finally {
      setLoading(false);
    }
  };

  // Preserved Seller Registration
  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerSeller({
        ownerName: sOwnerName,
        shopName: sShopName,
        mobileNumber: sMobile,
        email: sEmail,
        municipality: sMunicipality,
        barangay: sBarangay,
        businessAddress: sBusinessAddress,
        shopDescription: sShopDescription,
        profilePhoto: sPhoto,
        idDocumentUrl: sIdDocument,
        businessPermitUrl: sBusinessPermit
      });

      if (res.user && res.seller) {
        setCurrentUser(res.user);
        setCurrentSeller(res.seller);
        setRole('seller');
        setAuthModalOpen(false);
        showToast('Seller application submitted! Status is PENDING APPROVAL by provincial admin.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit seller application.');
    } finally {
      setLoading(false);
    }
  };

  // Delivery Rider Registration
  const handleRegisterRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerRider({
        riderName: rRiderName,
        mobileNumber: rMobile,
        email: rEmail,
        municipality: rMunicipality,
        barangay: rBarangay,
        vehicleType: rVehicleType,
        plateNumber: rPlateNumber,
        licenseNumber: rLicenseNumber,
        profilePhoto: rPhoto
      });

      if (res.user && res.rider) {
        setCurrentUser(res.user);
        setCurrentRider(res.rider);
        setRole('rider');
        setAuthModalOpen(false);
        showToast('Delivery rider partner registered successfully! Welcome to the team.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit rider registration.');
    } finally {
      setLoading(false);
    }
  };

  const isRegistrationTab =
    authModalTab === 'register_buyer' ||
    authModalTab === 'register_seller' ||
    authModalTab === 'register_rider';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center mb-4 sm:mb-5 shrink-0">
          <div className="inline-flex w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-950 text-amber-400 items-center justify-center shadow-md mb-2 border border-amber-400/40">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-blue-950 tracking-tight">
            SURIGAO DEL SUR MARKETPLACE
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-700 font-semibold italic">
            “Buy Local. Sell Local. Grow Surigao del Sur.”
          </p>
        </div>

        {/* Account Selector Tabs (Smartphone Responsive Horizontal Scroll) */}
        <div className="shrink-0 mb-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-[11px] sm:text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setAuthModalTab('buyer_login');
                setRegisterType(null);
                setError(null);
              }}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl transition-all text-center whitespace-nowrap ${
                authModalTab === 'buyer_login' || authModalTab === 'login'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer
            </button>
            <button
              onClick={() => {
                setAuthModalTab('seller_login');
                setRegisterType(null);
                setError(null);
              }}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl transition-all text-center whitespace-nowrap ${
                authModalTab === 'seller_login'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller
            </button>
            <button
              onClick={() => {
                setAuthModalTab('rider_login');
                setRegisterType(null);
                setError(null);
              }}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl transition-all text-center whitespace-nowrap ${
                authModalTab === 'rider_login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rider
            </button>
            <button
              onClick={() => {
                setAuthModalTab('admin_login');
                setRegisterType(null);
                setError(null);
              }}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl transition-all text-center whitespace-nowrap ${
                authModalTab === 'admin_login'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                setAuthModalTab('register_buyer');
                setRegisterType(null);
                setError(null);
              }}
              className={`flex-1 min-w-[85px] py-2 px-2 rounded-xl transition-all text-center whitespace-nowrap ${
                isRegistrationTab
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl mb-4 flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words leading-tight">{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 pr-0.5">
          {/* ======================================= */}
          {/* TAB 1: BUYER ACCOUNT LOGIN */}
          {/* ======================================= */}
          {(authModalTab === 'buyer_login' || authModalTab === 'login') && (
            <form onSubmit={handleBuyerLogin} className="space-y-3.5 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-blue-950 flex items-center space-x-2.5">
                <User className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Buyer Account Access</h4>
                  <p className="text-[11px] text-blue-700">Enter your Account Name (email or mobile) and Password.</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name (Email or Mobile Number) *
                </label>
                <input
                  type="text"
                  placeholder="Enter registered email or mobile number"
                  value={buyerAccountName}
                  onChange={(e) => setBuyerAccountName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={buyerPassword}
                  onChange={(e) => setBuyerPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>{loading ? 'Logging In...' : 'SIGN IN AS BUYER'}</span>
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* TAB 2: SELLER ACCOUNT LOGIN */}
          {/* ======================================= */}
          {authModalTab === 'seller_login' && (
            <form onSubmit={handleSellerLogin} className="space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-950 flex items-center space-x-2.5">
                <Store className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Seller Storefront Access</h4>
                  <p className="text-[11px] text-amber-800">Enter your Seller Account Name and Password.</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name (Email or Mobile Number) *
                </label>
                <input
                  type="text"
                  placeholder="Enter seller email or mobile number"
                  value={sellerAccountName}
                  onChange={(e) => setSellerAccountName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="Enter your seller password"
                  value={sellerPassword}
                  onChange={(e) => setSellerPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
              >
                <Store className="w-4 h-4" />
                <span>{loading ? 'Verifying Merchant...' : 'SIGN IN AS SELLER'}</span>
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* TAB 3: RIDER ACCOUNT LOGIN */}
          {/* ======================================= */}
          {authModalTab === 'rider_login' && (
            <form onSubmit={handleRiderLogin} className="space-y-3.5 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-950 flex items-center space-x-2.5">
                <Bike className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Delivery Rider Partner Portal</h4>
                  <p className="text-[11px] text-emerald-700">
                    Riders receive 100% of the Grab PH delivery fee. ₱0 platform fee deducted!
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rider Account Name (Email, Name, or Mobile) *
                </label>
                <input
                  type="text"
                  placeholder="Enter rider email or mobile number"
                  value={riderAccountName}
                  onChange={(e) => setRiderAccountName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="Enter rider password"
                  value={riderPassword}
                  onChange={(e) => setRiderPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
              >
                <Bike className="w-4 h-4" />
                <span>{loading ? 'Authenticating Rider...' : 'SIGN IN AS DELIVERY RIDER'}</span>
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* TAB 4: ADMIN PORTAL LOGIN */}
          {/* (Secret fixed credentials - No Account List displayed) */}
          {/* ======================================= */}
          {authModalTab === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-950 flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-rose-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Administrator Governance Portal</h4>
                  <p className="text-[11px] text-rose-800">
                    Strict login required: Enter Administrator Account Name and Password only.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter administrator username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating Admin...' : 'SIGN IN AS ADMINISTRATOR'}</span>
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* REGISTRATION: BRANCH SELECTOR */}
          {/* ======================================= */}
          {isRegistrationTab && registerType === null && authModalTab !== 'register_rider' && (
            <div className="text-center py-2 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Register a New Account</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose the type of account you want to register. All existing fields and procedures are retained.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRegisterType('buyer')}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                    BUY PRODUCTS
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Order local goods, fresh seafood, and agricultural produce across Surigao del Sur.
                  </p>
                  <div className="flex items-center space-x-1 text-blue-700 font-semibold text-xs mt-3">
                    <span>Register as Buyer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterType('seller')}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Store className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-900">
                    SELL PRODUCTS
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Set up your merchant storefront, upload products, and grow your local provincial sales.
                  </p>
                  <div className="flex items-center space-x-1 text-amber-700 font-semibold text-xs mt-3">
                    <span>Register as Seller</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterType('rider')}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all group col-span-1 sm:col-span-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Bike className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900">
                    DELIVERY RIDER PARTNER
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Deliver local food, goods, and produce in Surigao del Sur. Earn 100% of delivery fees with 0% platform deductions.
                  </p>
                  <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-xs mt-3">
                    <span>Register as Rider</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* BUYER REGISTRATION FORM (UNTOUCHED FIELDS) */}
          {/* ======================================= */}
          {isRegistrationTab && registerType === 'buyer' && (
            <form onSubmit={handleRegisterBuyer} className="space-y-3 text-xs pr-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Buyer Registration Form</span>
                <button
                  type="button"
                  onClick={() => setRegisterType(null)}
                  className="text-blue-700 hover:underline text-[11px]"
                >
                  ← Back to Selection
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={bFullName}
                  onChange={(e) => setBFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="09171234567"
                    value={bMobile}
                    onChange={(e) => setBMobile(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="maria@gmail.com"
                    value={bEmail}
                    onChange={(e) => setBEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipality / City *</label>
                  <select
                    value={bMunicipality}
                    onChange={(e) => setBMunicipality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                  >
                    {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay *</label>
                  <input
                    type="text"
                    placeholder="Barangay name"
                    value={bBarangay}
                    onChange={(e) => setBBarangay(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complete Delivery Address *</label>
                <input
                  type="text"
                  placeholder="House/Purok/Street number"
                  value={bAddress}
                  onChange={(e) => setBAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setBPhoto)}
                  className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs"
              >
                {loading ? 'Creating Account...' : 'COMPLETE BUYER REGISTRATION'}
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* SELLER REGISTRATION FORM (UNTOUCHED FIELDS) */}
          {/* ======================================= */}
          {isRegistrationTab && registerType === 'seller' && (
            <form onSubmit={handleRegisterSeller} className="space-y-3 text-xs pr-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Seller Registration Form</span>
                <button
                  type="button"
                  onClick={() => setRegisterType(null)}
                  className="text-amber-700 hover:underline text-[11px]"
                >
                  ← Back to Selection
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Arreza"
                    value={sOwnerName}
                    onChange={(e) => setSOwnerName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shop / Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kuya Sam General Merchandise"
                    value={sShopName}
                    onChange={(e) => setSShopName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="09171234567"
                    value={sMobile}
                    onChange={(e) => setSMobile(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="kuyasam@gmail.com"
                    value={sEmail}
                    onChange={(e) => setSEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipality / City *</label>
                  <select
                    value={sMunicipality}
                    onChange={(e) => setSMunicipality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  >
                    {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay *</label>
                  <input
                    type="text"
                    placeholder="Barangay name"
                    value={sBarangay}
                    onChange={(e) => setSBarangay(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complete Business Address *</label>
                <input
                  type="text"
                  placeholder="Physical location of store or farm"
                  value={sBusinessAddress}
                  onChange={(e) => setSBusinessAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your local products, farm produce, or goods..."
                  value={sShopDescription}
                  onChange={(e) => setSShopDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                />
              </div>

              {/* Document Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valid ID Document (Required)
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-3 cursor-pointer bg-slate-50 text-slate-500 transition-colors min-h-[50px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setSIdDocument)}
                      className="hidden"
                    />
                    <div className="text-center">
                      {sIdDocument ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center text-xs">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> ID Uploaded
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px]">Upload Govt ID</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Barangay / Business Permit
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-3 cursor-pointer bg-slate-50 text-slate-500 transition-colors min-h-[50px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setSBusinessPermit)}
                      className="hidden"
                    />
                    <div className="text-center">
                      {sBusinessPermit ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center text-xs">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Permit Uploaded
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px]">Upload Permit</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900">
                <span className="font-bold">Provincial Verification Note:</span> Your seller account will be in{' '}
                <strong className="text-amber-800">PENDING APPROVAL</strong> status until reviewed by a provincial administrator.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs"
              >
                {loading ? 'Submitting Application...' : 'SUBMIT SELLER APPLICATION'}
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* RIDER REGISTRATION FORM */}
          {/* ======================================= */}
          {isRegistrationTab && (registerType === 'rider' || (registerType === null && authModalTab === 'register_rider')) && (
            <form onSubmit={handleRegisterRider} className="space-y-3 text-xs pr-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Rider Registration Form</span>
                <button
                  type="button"
                  onClick={() => setRegisterType(null)}
                  className="text-emerald-700 hover:underline text-[11px]"
                >
                  ← Back to Selection
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name (Rider Name) *</label>
                <input
                  type="text"
                  placeholder="e.g. Juan dela Cruz"
                  value={rRiderName}
                  onChange={(e) => setRRiderName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="09191234567"
                    value={rMobile}
                    onChange={(e) => setRMobile(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="rider@example.com"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Municipality / City *</label>
                  <select
                    value={rMunicipality}
                    onChange={(e) => setRMunicipality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                  >
                    {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay Base *</label>
                  <input
                    type="text"
                    placeholder="e.g. Poblacion"
                    value={rBarangay}
                    onChange={(e) => setRBarangay(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Type *</label>
                  <select
                    value={rVehicleType}
                    onChange={(e) => setRVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Tricycle">Tricycle</option>
                    <option value="E-Bike">E-Bike</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Van / Multicab">Van / Multicab</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plate Number / MV File No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. 123-ABC or MV-998877"
                    value={rPlateNumber}
                    onChange={(e) => setRPlateNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Driver's License Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. N01-12-345678"
                  value={rLicenseNumber}
                  onChange={(e) => setRLicenseNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setRPhoto)}
                  className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900">
                <span className="font-bold">100% Delivery Fee Guarantee:</span> You keep 100% of all delivery earnings. The provincial marketplace takes 0% commission from riders.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-1.5"
              >
                <Bike className="w-4 h-4" />
                <span>{loading ? 'Submitting Registration...' : 'COMPLETE RIDER REGISTRATION'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
