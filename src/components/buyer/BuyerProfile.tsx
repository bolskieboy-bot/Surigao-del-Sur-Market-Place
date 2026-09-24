import React from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const BuyerProfile: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    setPaymentLinkModal,
    setAuthModalOpen,
    setAuthModalTab,
    showToast
  } = useApp();

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto shadow-sm space-y-4 my-8">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">You are not signed in</h2>
        <button
          onClick={() => {
            setAuthModalTab('login');
            setAuthModalOpen(true);
          }}
          className="bg-blue-950 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          Sign In as Buyer
        </button>
      </div>
    );
  }

  const gcash = currentUser.paymentMethods?.gcash;
  const maya = currentUser.paymentMethods?.maya;

  const handleUnlink = async (method: 'gcash' | 'maya') => {
    try {
      const res: any = await api.unlinkBuyerPayment(currentUser.id, method);
      setCurrentUser({ ...currentUser, paymentMethods: res.paymentMethods });
      showToast(`${method === 'gcash' ? 'GCash' : 'Maya'} account unlinked.`);
    } catch {
      showToast('Failed to unlink payment method.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Buyer Profile & Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your personal information, delivery addresses, and connected payment accounts
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center text-xl font-black">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{currentUser.fullName}</h2>
            <p className="text-xs text-slate-500">
              Community Buyer • {currentUser.municipality}, Surigao del Sur
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center space-x-2.5">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Number</span>
              <span className="text-slate-800 font-mono font-medium">{currentUser.mobileNumber}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center space-x-2.5">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
              <span className="text-slate-800 font-medium">{currentUser.email || 'None registered'}</span>
            </div>
          </div>

          <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Address</span>
              <span className="text-slate-800 font-medium">
                {currentUser.completeAddress}, {currentUser.barangay}, {currentUser.municipality}, Surigao del Sur
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED PAYMENT METHODS SECTION (REQUIREMENT 2 & 18) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-900" />
              <span>Dedicated Payment Methods</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Surigao del Sur Marketplace connects exclusively with GCash and Maya.
            </p>
          </div>
        </div>

        {/* Security Alert Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-950 text-xs flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Sensitive security credentials (MPIN, Passwords, OTP) are <strong>NEVER</strong> requested or stored. Numbers are masked for privacy.
          </p>
        </div>

        {/* Payment Methods Cards */}
        <div className="space-y-3 pt-1">
          {/* GCash Row */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                G
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">GCash</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      gcash?.linked
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {gcash?.linked ? 'Linked ✓' : 'Not Linked'}
                  </span>
                </div>

                {gcash?.linked ? (
                  <div className="mt-1 text-[11px] text-slate-600 space-y-0.5">
                    <p>
                      Account Name: <strong className="text-slate-800">{gcash.accountName}</strong>
                    </p>
                    <p>
                      Mobile Number: <span className="font-mono text-slate-800 font-semibold">{gcash.maskedMobile}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Connect your GCash for seamless local payments
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              {gcash?.linked ? (
                <button
                  onClick={() => handleUnlink('gcash')}
                  className="bg-white border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              ) : (
                <button
                  onClick={() => setPaymentLinkModal({ role: 'buyer', method: 'gcash' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                >
                  [ LINK GCASH ]
                </button>
              )}
            </div>
          </div>

          {/* Maya Row */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                M
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Maya</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      maya?.linked
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {maya?.linked ? 'Linked ✓' : 'Not Linked'}
                  </span>
                </div>

                {maya?.linked ? (
                  <div className="mt-1 text-[11px] text-slate-600 space-y-0.5">
                    <p>
                      Account Name: <strong className="text-slate-800">{maya.accountName}</strong>
                    </p>
                    <p>
                      Mobile Number: <span className="font-mono text-slate-800 font-semibold">{maya.maskedMobile}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Connect your Maya account for instant digital checkout
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              {maya?.linked ? (
                <button
                  onClick={() => handleUnlink('maya')}
                  className="bg-white border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              ) : (
                <button
                  onClick={() => setPaymentLinkModal({ role: 'buyer', method: 'maya' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                >
                  [ LINK MAYA ]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
