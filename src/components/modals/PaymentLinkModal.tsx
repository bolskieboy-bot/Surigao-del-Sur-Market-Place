import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const PaymentLinkModal: React.FC = () => {
  const {
    paymentLinkModal,
    setPaymentLinkModal,
    currentUser,
    setCurrentUser,
    currentSeller,
    setCurrentSeller,
    currentAdmin,
    showToast
  } = useApp();

  const [accountName, setAccountName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!paymentLinkModal) return null;

  const { role, method } = paymentLinkModal;
  const methodLabel = method === 'gcash' ? 'GCash' : 'Maya';
  const methodColor = method === 'gcash' ? 'text-blue-600' : 'text-emerald-600';
  const buttonBg = method === 'gcash' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 11 || !cleanMobile.startsWith('09')) {
      setError('Please provide a valid 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).');
      return;
    }

    if (!accountName.trim()) {
      setError('Please enter the exact registered account name as it appears on your ' + methodLabel + '.');
      return;
    }

    setLoading(true);
    try {
      if (role === 'buyer' && currentUser) {
        const res: any = await api.linkBuyerPayment(currentUser.id, method, accountName, cleanMobile);
        setCurrentUser({ ...currentUser, paymentMethods: res.paymentMethods });
        showToast(`${methodLabel} account successfully linked to your Buyer profile!`);
      } else if (role === 'seller' && currentSeller) {
        const res: any = await api.linkSellerPayment(currentSeller.id, method, accountName, cleanMobile, true);
        setCurrentSeller({ ...currentSeller, paymentMethods: res.paymentMethods });
        showToast(`${methodLabel} linked! Your shop can now accept ${methodLabel} payments.`);
      } else if (role === 'admin' && currentAdmin) {
        await api.linkAdminPayment(currentAdmin.id, method, accountName, cleanMobile);
        showToast(`Official Marketplace ${methodLabel} treasury account updated!`);
      }
      setPaymentLinkModal(null);
    } catch (err: any) {
      setError(err.message || `Failed to link ${methodLabel} account.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={() => setPaymentLinkModal(null)}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg ${method === 'gcash' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
            {method === 'gcash' ? 'G' : 'M'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Link {methodLabel} Account
            </h3>
            <p className="text-xs text-slate-500 capitalize">
              Role: <span className="font-bold text-slate-800">{role}</span>
            </p>
          </div>
        </div>

        {/* Security Notice mandated by Section 18 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Payment Security Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Surigao del Sur Marketplace <strong className="text-rose-600">NEVER</strong> asks for your {methodLabel} MPIN, passwords, or One-Time Passwords (OTP). Only your registered name and masked mobile number are retained.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Registered Account Name *
            </label>
            <input
              type="text"
              placeholder="e.g. JUAN DELA CRUZ"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden uppercase font-semibold"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Must match your verified name in your {methodLabel} app.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {methodLabel} Mobile Number *
            </label>
            <input
              type="tel"
              placeholder="09171234567"
              maxLength={11}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Will be masked (e.g. 0917 ••• ••67) for privacy.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2 ${buttonBg} disabled:opacity-50`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? `Connecting ${methodLabel}...` : `CONFIRM & LINK ${methodLabel.toUpperCase()}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
