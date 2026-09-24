import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  MapPin,
  Star,
  ShieldCheck,
  MessageSquare,
  Package,
  Flag,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SellerProfile, Product, Review } from '../../types';
import { api } from '../../services/api';

export const SellerStorefrontModal: React.FC = () => {
  const {
    storefrontSellerId,
    setStorefrontSellerId,
    setProductDetailId,
    setChatRecipient,
    setReportModal
  } = useApp();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storefrontSellerId) {
      setSeller(null);
      return;
    }

    setLoading(true);
    api.getSeller(storefrontSellerId)
      .then((res) => setSeller(res.seller))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getProducts({ sellerId: storefrontSellerId })
      .then((res) => setProducts(res.products || []))
      .catch(console.error);

    api.getReviews({ sellerId: storefrontSellerId })
      .then((res) => setReviews(res.reviews || []))
      .catch(console.error);
  }, [storefrontSellerId]);

  if (!storefrontSellerId || !seller) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative my-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setStorefrontSellerId(null)}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Storefront Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center text-amber-400 text-2xl font-black shrink-0">
                {seller.profilePhoto ? (
                  <img src={seller.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-white">{seller.shopName}</h1>
                  {seller.verified && (
                    <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center shadow-xs">
                      Verified Seller ✓
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1 flex items-center space-x-2">
                  <span className="flex items-center text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                    {seller.rating ? seller.rating.toFixed(1) : '5.0'} ({seller.reviewCount || 0} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 mr-1" />
                    {seller.municipality}, Surigao del Sur
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setChatRecipient({ id: seller.id, name: seller.shopName, role: 'seller' });
                }}
                className="bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>

              <button
                onClick={() => setReportModal({
                  targetType: 'seller',
                  targetId: seller.id,
                  targetTitle: seller.shopName
                })}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-xs transition-colors"
                title="Report Store"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'products' ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'reviews' ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'about' ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shop Information</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {/* Products Grid */}
          {activeTab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  This seller has no active products listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setProductDetailId(p.id)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                    >
                      <div className="aspect-square bg-slate-100 overflow-hidden relative">
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-amber-600 font-bold uppercase">{p.category}</span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                            {p.name}
                          </h4>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-extrabold text-blue-950 text-sm">
                            ₱{((p.discountPrice || p.price) || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Stock: {p.stock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No reviews recorded yet for this shop.
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{r.buyerName}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Shop Information */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">About the Store</h3>
                <p className="text-slate-600 leading-relaxed">{seller.shopDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Address</span>
                    <span className="text-slate-800 font-medium">{seller.businessAddress}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Member Since</span>
                    <span className="text-slate-800 font-medium">{new Date(seller.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
