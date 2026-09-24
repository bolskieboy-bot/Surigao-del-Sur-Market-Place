import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  FileText,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethodType } from '../../types';
import { SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';
import { api } from '../../services/api';
import { calculateGrabDeliveryFee } from '../../utils/deliveryCalculator';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    clearCart,
    cartSubtotal,
    cartTotal,
    currentUser,
    setBuyerTab,
    showToast
  } = useApp();

  // Form Fields
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || 'Maria Santos');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '09175551234');
  const [municipality, setMunicipality] = useState(currentUser?.municipality || 'Madrid');
  const [barangay, setBarangay] = useState(currentUser?.barangay || 'Manga');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.completeAddress || 'Purok 2, Barangay Manga');
  const [notesToSeller, setNotesToSeller] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // ONLY 3 Payment Methods
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('gcash');

  // For GCash/Maya payment flow
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [step, setStep] = useState<'form' | 'payment_instructions' | 'confirmed'>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [sellerPayInfo, setSellerPayInfo] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!checkoutOpen) return null;

  // Primary seller municipality from cart
  const primarySellerMuni = cart[0]?.product?.sellerMunicipality || cart[0]?.product?.municipality || 'Madrid';
  const deliveryCalc = calculateGrabDeliveryFee(primarySellerMuni, municipality, fulfillmentType);
  const activeDeliveryFee = cart.length === 0 ? 0 : deliveryCalc.totalDeliveryFee;
  const activeDistanceKm = cart.length === 0 ? 0 : deliveryCalc.distanceKm;
  const activeTotalPaid = cartSubtotal + activeDeliveryFee;

  // Calculate transparent 3% commission preview (server verifies and applies strictly on product subtotal)
  const commissionPreview = Math.round(cartSubtotal * 0.03 * 100) / 100;
  const sellerNetPreview = Math.round((cartSubtotal - commissionPreview) * 100) / 100;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setError(null);
    setLoading(true);

    try {
      // Primary seller is from the first item
      const primarySellerId = cart[0].product.sellerId;

      const orderPayload = {
        buyerId: currentUser?.id || 'guest_buyer_1',
        sellerId: primarySellerId,
        buyerMunicipality: municipality,
        buyerBarangay: barangay,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.discountPrice || item.product.price,
          quantity: item.quantity,
          photo: item.product.photos[0],
          category: item.product.category
        })),
        deliveryAddress: `${deliveryAddress}, ${barangay}, ${municipality}, Surigao del Sur`,
        notesToSeller,
        paymentMethod,
        fulfillmentType
      };

      const res = await api.createOrder(orderPayload);
      setCreatedOrderId(res.order.id);
      setSellerPayInfo(res.sellerPaymentInfo);
      clearCart();

      if (paymentMethod === 'cod') {
        setStep('confirmed');
        showToast('Order placed successfully via Cash on Delivery!');
      } else {
        // GCash or Maya instructions step
        setStep('payment_instructions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmElectronicPayment = async () => {
    if (!createdOrderId) return;
    setLoading(true);
    try {
      await api.submitPaymentReference(
        createdOrderId,
        paymentRefNumber.trim() || `REF-${Date.now().toString().slice(-6)}`
      );
      setStep('confirmed');
      showToast('Payment confirmation submitted to seller!');
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment reference.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setStep('form');
    setCreatedOrderId(null);
    if (step === 'confirmed') {
      setBuyerTab('orders');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================= */}
        {/* STEP 1: ORDER FORM & PAYMENT SELECTION */}
        {/* ======================================= */}
        {step === 'form' && (
          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Checkout Order</h2>
              <p className="text-slate-500 text-xs">
                Surigao del Sur Provincial Marketplace Delivery & Pickup
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buyer Contact & Location Fields */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Delivery Destination</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipality (SDS) *</label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden font-medium"
                  >
                    {SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} {m.isCity ? '(City)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay *</label>
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complete Street / Purok Address *</label>
                <input
                  type="text"
                  placeholder="House number, Purok, Street landmark"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes to Seller (Optional)</label>
                <input
                  type="text"
                  placeholder="Special instructions or landmark"
                  value={notesToSeller}
                  onChange={(e) => setNotesToSeller(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>

            {/* STRICT PAYMENT SELECTION CARD (REQUIREMENT 21) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-extrabold text-slate-900 tracking-wide text-xs uppercase">
                SELECT PAYMENT METHOD
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {/* Button 1: GCash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`py-3 px-2 rounded-xl font-bold text-center border-2 transition-all flex flex-col items-center justify-center space-y-1 shadow-2xs ${
                    paymentMethod === 'gcash'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    G
                  </span>
                  <span className="text-xs">GCash</span>
                </button>

                {/* Button 2: Maya */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('maya')}
                  className={`py-3 px-2 rounded-xl font-bold text-center border-2 transition-all flex flex-col items-center justify-center space-y-1 shadow-2xs ${
                    paymentMethod === 'maya'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    M
                  </span>
                  <span className="text-xs">Maya</span>
                </button>

                {/* Button 3: Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-3 px-2 rounded-xl font-bold text-center border-2 transition-all flex flex-col items-center justify-center space-y-1 shadow-2xs ${
                    paymentMethod === 'cod'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    ₱
                  </span>
                  <span className="text-[11px] leading-tight">Cash on Delivery</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure local marketplace payments</span>
              </p>
            </div>

            {/* ORDER FINANCIAL BREAKDOWN */}
            <div className="bg-slate-100/80 rounded-2xl p-4 space-y-2 border border-slate-200">
              <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-600">
                Order Financial Breakdown
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Product Subtotal</span>
                  <span className="font-bold">₱{(cartSubtotal ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Delivery Fee ({activeDistanceKm} km)</span>
                  <span className="font-bold">₱{(activeDeliveryFee ?? 0).toFixed(2)}</span>
                </div>
                {fulfillmentType === 'delivery' && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Grab PH Rate: {deliveryCalc.breakdownText} (100% to Rider)
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-blue-950">
                  <span>Total Paid</span>
                  <span>₱{(activeTotalPaid ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-500 space-y-0.5">
                <div className="flex justify-between text-slate-500">
                  <span>Platform Commission — 3% (Server Deducted on Product only)</span>
                  <span>-₱{commissionPreview.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Seller Net Product Amount</span>
                  <span>₱{sellerNetPreview.toFixed(2)}</span>
                </div>
                {fulfillmentType === 'delivery' && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Rider Fee Earnings (0% commission charged)</span>
                    <span>₱{activeDeliveryFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-3 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : 'CONFIRM & PLACE ORDER'}
            </button>
          </form>
        )}

        {/* ======================================= */}
        {/* STEP 2: GCASH / MAYA PAYMENT FLOW */}
        {/* ======================================= */}
        {step === 'payment_instructions' && (
          <div className="space-y-4 text-xs">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-black text-white text-lg mb-2 ${paymentMethod === 'gcash' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {paymentMethod === 'gcash' ? 'G' : 'M'}
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Complete {paymentMethod.toUpperCase()} Payment
              </h2>
              <p className="text-slate-500">
                Order ID: <span className="font-mono font-bold text-slate-800">#{createdOrderId}</span>
              </p>
            </div>

            {/* Seller Account Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Seller Payment Information
              </span>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Account Name:</span>
                <span className="font-extrabold text-slate-900">
                  {sellerPayInfo?.accountName || 'VERIFIED LOCAL SELLER'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">{paymentMethod.toUpperCase()} Number:</span>
                <span className="font-mono font-extrabold text-blue-900">
                  {sellerPayInfo?.maskedMobile || '0917 ••• ••67'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-600">Amount to Send:</span>
                <span className="font-black text-sm text-blue-950">
                  ₱{(cartTotal ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Step-by-step external instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-blue-950 space-y-1.5">
              <p className="font-bold flex items-center space-x-1 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Payment Instructions:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900">
                <li>Open your external {paymentMethod.toUpperCase()} app on your mobile phone.</li>
                <li>Send ₱{(cartTotal ?? 0).toLocaleString()} to the seller account details above.</li>
                <li>Copy the Reference Number from your receipt and enter it below.</li>
              </ol>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Enter {paymentMethod.toUpperCase()} Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 902834718293"
                value={paymentRefNumber}
                onChange={(e) => setPaymentRefNumber(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden font-mono text-sm"
              />
            </div>

            <button
              onClick={handleConfirmElectronicPayment}
              disabled={loading}
              className="w-full bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold py-3 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Submitting Reference...' : 'SUBMIT PAYMENT REFERENCE'}</span>
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* STEP 3: ORDER CONFIRMED */}
        {/* ======================================= */}
        {step === 'confirmed' && (
          <div className="text-center py-6 space-y-4 text-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-slate-500 mt-1">
                Order <span className="font-mono font-bold text-slate-900">#{createdOrderId}</span> has been transmitted to the seller.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-900 uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment:</span>
                <span className="font-bold text-slate-900 capitalize">{fulfillmentType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-black text-blue-950">₱{(cartTotal ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="bg-blue-950 hover:bg-blue-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all text-xs"
            >
              VIEW MY ORDERS & TRACKING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
