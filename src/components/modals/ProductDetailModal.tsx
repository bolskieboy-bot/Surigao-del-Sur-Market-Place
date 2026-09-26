import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Truck,
  Package,
  ShoppingCart,
  Zap,
  MessageSquare,
  Flag,
  ChevronRight,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Review } from '../../types';
import { api } from '../../services/api';

export const ProductDetailModal: React.FC = () => {
  const {
    productDetailId,
    setProductDetailId,
    addToCart,
    setCheckoutOpen,
    setChatRecipient,
    setStorefrontSellerId,
    setReportModal
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productDetailId) {
      setProduct(null);
      return;
    }

    setLoading(true);
    api.getProduct(productDetailId)
      .then((res) => {
        setProduct(res.product);
        setSelectedPhotoIdx(0);
        setQuantity(1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getReviews({ productId: productDetailId })
      .then((res) => setReviews(res.reviews || []))
      .catch(console.error);
  }, [productDetailId]);

  if (!productDetailId || !product) return null;

  const currentPrice = product.discountPrice || product.price;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setProductDetailId(null);
    setCheckoutOpen(true);
  };

  const handleMessageSeller = () => {
    setChatRecipient({
      id: product.sellerId,
      name: product.sellerShopName,
      role: 'seller'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative my-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setProductDetailId(null)}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Photos Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
              <img
                src={product.photos[selectedPhotoIdx] || product.photos[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discountPrice && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-sm">
                  SAVE ₱{((product.price - product.discountPrice) || 0).toLocaleString()}
                </div>
              )}
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.photos.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {product.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhotoIdx(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedPhotoIdx === i ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Municipality Location Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Seller Location</span>
                  <span className="font-bold text-slate-900">{product.municipality}, Surigao del Sur</span>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-md">
                Local Origin
              </span>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 leading-snug">
                {product.name}
              </h1>

              {/* Ratings & Orders */}
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <div className="flex items-center space-x-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount || 0} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  {product.orderCount || 0} orders completed
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-950">
                ₱{(currentPrice ?? 0).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ₱{(product.price ?? 0).toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-slate-500 ml-auto font-medium">
                Stock:{' '}
                {product.stock <= 0 ? (
                  <strong className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Out of Stock
                  </strong>
                ) : (
                  <strong className="text-slate-900">{product.stock} available</strong>
                )}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Fulfillment Options */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${product.deliveryAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <Truck className="w-4 h-4" />
                <span className="font-semibold">{product.deliveryAvailable ? 'Delivery Available' : 'No Delivery'}</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${product.pickupAvailable ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <Package className="w-4 h-4" />
                <span className="font-semibold">{product.pickupAvailable ? 'Store Pickup Available' : 'No Pickup'}</span>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div
                onClick={() => {
                  setStorefrontSellerId(product.sellerId);
                  setProductDetailId(null);
                }}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-900">
                      {product.sellerShopName}
                    </span>
                    {product.sellerVerified && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-sm flex items-center">
                        Verified ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {product.sellerMunicipality} • ★ {product.sellerRating || 4.9}
                  </p>
                </div>
              </div>

              <button
                onClick={handleMessageSeller}
                className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-semibold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  disabled={product.stock <= 0 || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-3 py-1 font-bold text-slate-900 bg-white">
                  {product.stock <= 0 ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={product.stock <= 0 || quantity >= product.stock}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {product.stock > 0 && quantity >= product.stock && (
                <span className="text-[10px] text-amber-600 font-semibold">Max stock reached</span>
              )}
            </div>

            {/* Actions: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={product.stock <= 0}
                onClick={() => addToCart(product, quantity)}
                className={`py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-1.5 shadow-xs font-bold ${
                  product.stock <= 0
                    ? 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-50 border-2 border-blue-950 text-blue-950'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                disabled={product.stock <= 0}
                onClick={handleBuyNow}
                className={`py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-1.5 shadow-md font-bold ${
                  product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-950 hover:bg-blue-900 text-amber-400'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{product.stock <= 0 ? 'Unavailable' : 'Buy Now'}</span>
              </button>
            </div>

            {/* Report Listing Button */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setReportModal({
                  targetType: 'product',
                  targetId: product.id,
                  targetTitle: product.name
                })}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center space-x-1 ml-auto"
              >
                <Flag className="w-3 h-3" />
                <span>Report this listing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center space-x-2">
            <span>Customer Reviews</span>
            <span className="text-xs font-normal text-slate-500">({reviews.length})</span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reviews yet for this product. Be the first to order and review!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{r.buyerName}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600">{r.comment}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
