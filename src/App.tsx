import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { BuyerHome } from './components/buyer/BuyerHome';
import { CartDrawer } from './components/buyer/CartDrawer';
import { BuyerOrders } from './components/buyer/BuyerOrders';
import { BuyerProfile } from './components/buyer/BuyerProfile';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RiderDashboard } from './components/rider/RiderDashboard';

// Modals
import { AuthModal } from './components/modals/AuthModal';
import { AdminPasswordModal } from './components/modals/AdminPasswordModal';
import { PaymentLinkModal } from './components/modals/PaymentLinkModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { SellerStorefrontModal } from './components/modals/SellerStorefrontModal';
import { ReportModal } from './components/modals/ReportModal';
import { ChatModal } from './components/modals/ChatModal';
import { CheckoutModal } from './components/buyer/CheckoutModal';

const MainLayout: React.FC = () => {
  const {
    role,
    buyerTab,
    isMobileView,
    toastMessage,
    setBuyerTab
  } = useApp();

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-all ${
      isMobileView ? 'py-6 px-3 bg-slate-200/80 items-center justify-start' : ''
    }`}>
      {/* Container Frame (Mobile Frame or Full Desktop) */}
      <div className={`w-full flex-1 flex flex-col transition-all ${
        isMobileView
          ? 'max-w-md bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden min-h-[850px]'
          : 'bg-white'
      }`}>
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
          {/* BUYER PORTAL */}
          {role === 'buyer' && (
            <>
              {buyerTab === 'home' && <BuyerHome />}
              {buyerTab === 'cart' && <CartDrawer />}
              {buyerTab === 'orders' && <BuyerOrders />}
              {buyerTab === 'profile' && <BuyerProfile />}
              {buyerTab === 'messages' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 space-y-3">
                  <h3 className="font-extrabold text-base text-slate-900">Direct Conversations</h3>
                  <p className="text-xs text-slate-500">
                    To start a chat, click the "Chat" button on any product listing or order card to connect with the local merchant.
                  </p>
                  <button
                    onClick={() => setBuyerTab('home')}
                    className="bg-blue-950 text-amber-400 font-bold px-5 py-2 rounded-xl text-xs"
                  >
                    Browse Local Listings
                  </button>
                </div>
              )}
            </>
          )}

          {/* SELLER PORTAL */}
          {role === 'seller' && <SellerDashboard />}

          {/* RIDER PORTAL */}
          {role === 'rider' && <RiderDashboard />}

          {/* ADMINISTRATOR PORTAL */}
          {role === 'admin' && <AdminDashboard />}
        </main>

        <Footer />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Globally Mounted Modals */}
      <AuthModal />
      <AdminPasswordModal />
      <PaymentLinkModal />
      <ProductDetailModal />
      <SellerStorefrontModal />
      <ReportModal />
      <ChatModal />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
