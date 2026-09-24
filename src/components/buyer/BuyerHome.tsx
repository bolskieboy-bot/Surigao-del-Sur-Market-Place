import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Store,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, SellerProfile, Advertisement } from '../../types';
import { api } from '../../services/api';
import { MARKETPLACE_CATEGORIES, SURIGAO_DEL_SUR_MUNICIPALITIES } from '../../data/surigaoData';

export const BuyerHome: React.FC = () => {
  const {
    selectedMunicipality,
    setSelectedMunicipality,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setProductDetailId,
    setStorefrontSellerId,
    setBuyerTab,
    currentUser
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<SellerProfile[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine the effective municipality for "Near You"
  const activeMuni = selectedMunicipality !== 'All' ? selectedMunicipality : (currentUser?.municipality || 'Madrid');

  useEffect(() => {
    setLoading(true);
    api.getProducts({
      municipality: selectedMunicipality !== 'All' ? selectedMunicipality : undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: searchQuery || undefined
    })
      .then((res) => setProducts(res.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getSellers({ status: 'approved' })
      .then((res) => {
        const verified = (res.sellers || []).filter((s) => s.verified || s.featured);
        setFeaturedSellers(verified.slice(0, 6));
      })
      .catch(console.error);

    api.getAdvertisements()
      .then((res) => setAds((res.advertisements || []).filter((a) => a.active)))
      .catch(console.error);
  }, [selectedMunicipality, selectedCategory, searchQuery]);

  // Near You products (filtered by active municipality)
  const nearYouProducts = products.filter(
    (p) => p.municipality.toLowerCase() === activeMuni.toLowerCase()
  );

  // Trending products (high orders / ratings)
  const trendingProducts = [...products].sort(
    (a, b) => ((b.orderCount || 0) * 2 + (b.views || 0)) - ((a.orderCount || 0) * 2 + (a.views || 0))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Provincial Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-amber-500/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Exclusive Provincial Marketplace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Buy Local. Sell Local. <br />
            <span className="text-amber-400">Grow Surigao del Sur.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Empowering 19 municipalities & cities from Carrascal to Lingig. Support your local farmers, fisherfolk, and community entrepreneurs with 100% transparent local delivery and pickup.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-slate-300 font-semibold">Popular LGUs:</span>
            {['Madrid', 'Cantilan', 'Tandag City', 'Lanuza', 'Bislig City'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMunicipality(m)}
                className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
                  selectedMunicipality === m
                    ? 'bg-amber-400 text-blue-950 font-bold border-amber-400'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Categories Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Quick Categories</span>
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-blue-700 font-semibold hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl shrink-0 font-bold transition-all shadow-2xs ${
              selectedCategory === 'All'
                ? 'bg-blue-950 text-amber-400 shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl shrink-0 font-semibold transition-all shadow-2xs ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-amber-400 font-bold shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Local Advertisement Banner (if available) */}
      {ads.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-900">
          <img
            src={ads[0].image}
            alt={ads[0].businessName}
            className="w-full h-32 sm:h-40 object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/40 to-transparent flex items-center p-6 text-white">
            <div className="max-w-md">
              <span className="text-[10px] bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                Provincial Sponsored Partner
              </span>
              <h3 className="font-extrabold text-base sm:text-lg mt-1 text-white">
                {ads[0].businessName}
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Official local business partner supporting Surigao del Sur commerce.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* "Near You" Section based on Municipality */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Near You: Popular in {activeMuni}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Fresh items and merchandise directly from sellers in {activeMuni}
            </p>
          </div>

          <button
            onClick={() => setSelectedMunicipality(activeMuni)}
            className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center space-x-1"
          >
            <span>See more in {activeMuni}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nearYouProducts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No active products listed yet in {activeMuni}.</p>
            <p className="text-slate-400 mt-1">Be the first local merchant in {activeMuni} to list products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {nearYouProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onSelect={() => setProductDetailId(p.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Verified Sellers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center space-x-2">
              <Store className="w-4 h-4 text-amber-600" />
              <span>Featured Verified Sellers</span>
            </h2>
            <p className="text-xs text-slate-500">
              Trusted provincial stores with verified municipal permits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featuredSellers.map((s) => (
            <div
              key={s.id}
              onClick={() => setStorefrontSellerId(s.id)}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer flex items-center space-x-3.5 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                {s.profilePhoto ? (
                  <img src={s.profilePhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <Store className="w-6 h-6 m-4 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-900">
                    {s.shopName}
                  </h4>
                  {s.verified && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 rounded-sm shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {s.municipality}, Surigao del Sur
                </p>
                <div className="flex items-center space-x-1 mt-1 text-[11px] text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{s.rating ? s.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 font-normal">({s.reviewCount || 0} reviews)</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>Trending Products</span>
            </h2>
            <p className="text-xs text-slate-500">
              Most requested goods across all Surigao del Sur LGUs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trendingProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={() => setProductDetailId(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Product Card Component
export const ProductCard: React.FC<{ product: Product; onSelect: () => void }> = ({ product, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        <img
          src={product.photos[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {product.discountPrice && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
            SALE
          </span>
        )}
        <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
          {product.municipality}
        </span>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-amber-600 font-bold uppercase block">{product.category}</span>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 leading-snug">
            {product.name}
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {product.sellerShopName}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-blue-950 text-sm block">
              ₱{((product.discountPrice || product.price) || 0).toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                ₱{(product.price ?? 0).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-amber-600 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
