import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  SellerProfile,
  AdminAccount,
  RiderProfile,
  Product,
  NotificationItem,
  PlatformSettings,
  UserRole
} from '../types';
import { api } from '../services/api';
import { calculateGrabDeliveryFee } from '../utils/deliveryCalculator';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AuthModalTabType =
  | 'buyer_login'
  | 'seller_login'
  | 'rider_login'
  | 'admin_login'
  | 'register_buyer'
  | 'register_seller'
  | 'register_rider'
  | 'login';

interface AppContextType {
  // Roles & Users
  role: UserRole;
  setRole: (r: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  currentSeller: SellerProfile | null;
  setCurrentSeller: (s: SellerProfile | null) => void;
  currentAdmin: AdminAccount | null;
  setCurrentAdmin: (a: AdminAccount | null) => void;
  currentRider: RiderProfile | null;
  setCurrentRider: (r: RiderProfile | null) => void;

  // Navigation & View mode
  isMobileView: boolean;
  setIsMobileView: (val: boolean) => void;
  selectedMunicipality: string;
  setSelectedMunicipality: (muni: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Active sub-views
  buyerTab: 'home' | 'categories' | 'near_you' | 'cart' | 'orders' | 'messages' | 'profile';
  setBuyerTab: (tab: 'home' | 'categories' | 'near_you' | 'cart' | 'orders' | 'messages' | 'profile') => void;
  sellerTab: 'dashboard' | 'products' | 'add_product' | 'orders' | 'payments' | 'messages' | 'shop_profile';
  setSellerTab: (tab: 'dashboard' | 'products' | 'add_product' | 'orders' | 'payments' | 'messages' | 'shop_profile') => void;
  adminTab: 'dashboard' | 'sellers' | 'products' | 'orders' | 'commission' | 'municipalities' | 'reports' | 'ads' | 'announcements' | 'audit_logs' | 'settings' | 'riders';
  setAdminTab: (tab: 'dashboard' | 'sellers' | 'products' | 'orders' | 'commission' | 'municipalities' | 'reports' | 'ads' | 'announcements' | 'audit_logs' | 'settings' | 'riders') => void;
  riderTab: 'dashboard' | 'jobs' | 'active' | 'history' | 'profile';
  setRiderTab: (tab: 'dashboard' | 'jobs' | 'active' | 'history' | 'profile') => void;

  // Modals & Navigation helpers
  productDetailId: string | null;
  setProductDetailId: (id: string | null) => void;
  storefrontSellerId: string | null;
  setStorefrontSellerId: (id: string | null) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: AuthModalTabType;
  setAuthModalTab: (tab: AuthModalTabType) => void;
  adminPasswordModalOpen: boolean;
  setAdminPasswordModalOpen: (open: boolean) => void;
  chatRecipient: { id: string; name: string; role: UserRole } | null;
  setChatRecipient: (rec: { id: string; name: string; role: UserRole } | null) => void;
  reportModal: { targetType: 'seller' | 'product' | 'message'; targetId: string; targetTitle: string } | null;
  setReportModal: (val: { targetType: 'seller' | 'product' | 'message'; targetId: string; targetTitle: string } | null) => void;
  paymentLinkModal: { role: 'buyer' | 'seller' | 'admin'; method: 'gcash' | 'maya' } | null;
  setPaymentLinkModal: (val: { role: 'buyer' | 'seller' | 'admin'; method: 'gcash' | 'maya' } | null) => void;

  // Cart & Grab PH Delivery Calculation
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartDeliveryDistance: number;
  cartDeliveryBreakdown: string;
  cartTotal: number;

  // Platform & Notifications
  settings: PlatformSettings | null;
  notifications: NotificationItem[];
  refreshNotifications: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Authentication access handlers (Strict login required on access)
  promptLoginForRole: (targetRole: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('sds_role');
      if (saved === 'admin' || saved === 'seller' || saved === 'buyer' || saved === 'rider') {
        return saved;
      }
    } catch {}
    return 'buyer';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sds_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentSeller, setCurrentSeller] = useState<SellerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sds_current_seller');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sds_current_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRider, setCurrentRider] = useState<RiderProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sds_current_rider');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [buyerTab, setBuyerTab] = useState<'home' | 'categories' | 'near_you' | 'cart' | 'orders' | 'messages' | 'profile'>('home');
  const [sellerTab, setSellerTab] = useState<'dashboard' | 'products' | 'add_product' | 'orders' | 'payments' | 'messages' | 'shop_profile'>('dashboard');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'sellers' | 'products' | 'orders' | 'commission' | 'municipalities' | 'reports' | 'ads' | 'announcements' | 'audit_logs' | 'settings' | 'riders'>('dashboard');
  const [riderTab, setRiderTab] = useState<'dashboard' | 'jobs' | 'active' | 'history' | 'profile'>('dashboard');

  const [productDetailId, setProductDetailId] = useState<string | null>(null);
  const [storefrontSellerId, setStorefrontSellerId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTabType>('buyer_login');
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [reportModal, setReportModal] = useState<{ targetType: 'seller' | 'product' | 'message'; targetId: string; targetTitle: string } | null>(null);
  const [paymentLinkModal, setPaymentLinkModal] = useState<{ role: 'buyer' | 'seller' | 'admin'; method: 'gcash' | 'maya' } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync auth session state to localStorage for persistence across reloads, networks, and cellphones
  useEffect(() => {
    try {
      if (role) localStorage.setItem('sds_role', role);
      if (currentUser) localStorage.setItem('sds_current_user', JSON.stringify(currentUser));
      else localStorage.removeItem('sds_current_user');

      if (currentSeller) localStorage.setItem('sds_current_seller', JSON.stringify(currentSeller));
      else localStorage.removeItem('sds_current_seller');

      if (currentAdmin) localStorage.setItem('sds_current_admin', JSON.stringify(currentAdmin));
      else localStorage.removeItem('sds_current_admin');

      if (currentRider) localStorage.setItem('sds_current_rider', JSON.stringify(currentRider));
      else localStorage.removeItem('sds_current_rider');
    } catch (e) {
      console.error('Session sync error:', e);
    }
  }, [role, currentUser, currentSeller, currentAdmin, currentRider]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load platform settings on mount (no silent auto-login so login is enforced when accessing accounts)
  useEffect(() => {
    api.getSettings().then((res) => {
      if (res && res.settings) {
        setSettings(res.settings);
      }
    }).catch(console.error);
  }, []);

  const refreshNotifications = () => {
    const uid =
      role === 'admin'
        ? 'admin_all'
        : role === 'seller'
        ? currentSeller?.userId
        : role === 'rider'
        ? currentRider?.userId
        : currentUser?.id;

    if (!uid) return;

    api.getNotifications(uid).then((res) => {
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [role, currentUser, currentSeller, currentRider]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name.substring(0, 30)}..." to your cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart.');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Dynamic Distance-based Delivery Fee calculation using Grab Philippines Fare Rate Reference
  const sellerMunicipality =
    cart[0]?.product?.sellerMunicipality || cart[0]?.product?.municipality || 'Madrid';
  const buyerMunicipality =
    currentUser?.municipality || (selectedMunicipality !== 'All' ? selectedMunicipality : 'Madrid');

  const deliveryCalculation =
    cart.length === 0
      ? { totalDeliveryFee: 0, distanceKm: 0, breakdownText: 'Cart is empty' }
      : calculateGrabDeliveryFee(sellerMunicipality, buyerMunicipality, 'delivery');

  const cartDeliveryFee = deliveryCalculation.totalDeliveryFee;
  const cartDeliveryDistance = deliveryCalculation.distanceKm;
  const cartDeliveryBreakdown = deliveryCalculation.breakdownText;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  /**
   * Enforces login every time user clicks or accesses an account portal.
   * Standardized format across Admin, Seller, Buyer, and Rider: Account Name and Password only.
   */
  const promptLoginForRole = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      setAuthModalTab('admin_login');
    } else if (targetRole === 'seller') {
      setAuthModalTab('seller_login');
    } else if (targetRole === 'rider') {
      setAuthModalTab('rider_login');
    } else {
      setAuthModalTab('buyer_login');
    }
    setAuthModalOpen(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem('sds_current_user');
      localStorage.removeItem('sds_current_seller');
      localStorage.removeItem('sds_current_admin');
      localStorage.removeItem('sds_current_rider');
      localStorage.setItem('sds_role', 'buyer');
    } catch {}
    setCurrentUser(null);
    setCurrentSeller(null);
    setCurrentAdmin(null);
    setCurrentRider(null);
    setRole('buyer');
    setBuyerTab('home');
    showToast('Signed out of account successfully.');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        currentSeller,
        setCurrentSeller,
        currentAdmin,
        setCurrentAdmin,
        currentRider,
        setCurrentRider,
        isMobileView,
        setIsMobileView,
        selectedMunicipality,
        setSelectedMunicipality,
        selectedCategory,
        setSelectedCategory,
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
        productDetailId,
        setProductDetailId,
        storefrontSellerId,
        setStorefrontSellerId,
        checkoutOpen,
        setCheckoutOpen,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        adminPasswordModalOpen,
        setAdminPasswordModalOpen,
        chatRecipient,
        setChatRecipient,
        reportModal,
        setReportModal,
        paymentLinkModal,
        setPaymentLinkModal,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartDeliveryDistance,
        cartDeliveryBreakdown,
        cartTotal,
        settings,
        notifications,
        refreshNotifications,
        toastMessage,
        showToast,
        promptLoginForRole,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
