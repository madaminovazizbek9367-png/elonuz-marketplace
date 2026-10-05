import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Eye, 
  Phone, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Check,
  Send,
  QrCode,
  DollarSign,
  Maximize2,
  Star,
  Video,
  Zap,
  Sparkles,
  CheckCircle2,
  Calculator,
  MessageCircle,
  Scale
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailModal({
  productId,
  onClose,
  onToggleFavorite,
  onOpenChat,
  onEditProduct,
  onDeleteProduct,
  onSelectSimilarProduct,
  onToggleCompare,
  isCompared,
  onOpenSafetyGuide,
  onOpenBargainBot,
  onOpenReceipt,
  onOpenDelivery
}) {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('images'); // 'images' | 'video'

  // Review System
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ total_reviews: 0, avg_rating: 5.0 });

  // OLX-dan farqli qo'shimcha funksiyalar:
  // 1. Narx taklif qilish (Savdolashish)
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerSending, setOfferSending] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  // 2. Valyuta kalkulyatori (USD <-> UZS)
  const [showCurrencyCalc, setShowCurrencyCalc] = useState(false);
  const USD_RATE = 12850; // Joriy taqribiy kurs

  // 3. Muddatli to'lov (Nasiya) kalkulyatori
  const [showInstallmentCalc, setShowInstallmentCalc] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState(6);

  // 4. QR Kod ko'rsatish
  const [showQrModal, setShowQrModal] = useState(false);

  const loadSellerReviews = (sellerId) => {
    if (!sellerId) return;
    api.getSellerReviews(sellerId)
      .then(res => {
        setSellerReviews(res.reviews || []);
        setReviewsStats({ total_reviews: res.total_reviews, avg_rating: res.avg_rating });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setShowOfferInput(false);
    setOfferSuccess(false);
    setShowCurrencyCalc(false);
    setShowQrModal(false);
    setPhoneRevealed(false);
    setActiveMediaTab('images');

    api.getProductById(productId)
      .then(res => {
        setProduct(res.product);
        setActiveImageIndex(0);
        if (res.product?.seller_id) {
          loadSellerReviews(res.product.seller_id);
        }
      })
      .catch(err => {
        console.error('Error fetching product detail:', err);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const formatPrice = (price, currency) => {
    if (!price) return '0';
    const formatted = new Intl.NumberFormat('uz-UZ').format(price);
    return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('uz-UZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const images = product?.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : [product?.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'];

  const isOwner = user && product && (user.id === product.user_id || user.role === 'admin');

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Send price bargain offer to seller via chat
  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerPrice || !user || !product) return;
    setOfferSending(true);

    try {
      const offerMsg = `🤝 Narx taklifi: Men "${product.title}" mahsulotingizni ${formatPrice(offerPrice, product.currency)} ga sotib olishga tayyorman. Kelishamizmi?`;
      await api.sendMessage({
        receiver_id: product.seller_id,
        product_id: product.id,
        message: offerMsg
      });
      setOfferSuccess(true);
      setTimeout(() => {
        setShowOfferInput(false);
        setOfferSuccess(false);
      }, 2500);
    } catch (err) {
      alert(err.message || 'Taklif yuborishda xatolik yuz berdi');
    } finally {
      setOfferSending(false);
    }
  };

  // Submit review for seller (Feature 2)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product?.seller_id || !user) return;
    if (!reviewComment.trim()) {
      alert('Sharh matnini kiriting');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.submitReview({
        seller_id: product.seller_id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setShowReviewModal(false);
      setReviewComment('');
      loadSellerReviews(product.seller_id);
      alert('Rahmat! Sharhingiz muvaffaqiyatli saqlandi.');
    } catch (err) {
      alert(err.message || 'Sharh qoldirishda xatolik yuz berdi');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Currency converted value
  const getConvertedPrice = () => {
    if (!product) return '';
    if (product.currency === 'USD') {
      const inUzs = product.price * USD_RATE;
      return `≈ ${new Intl.NumberFormat('uz-UZ').format(Math.round(inUzs))} so'm (1$ = ${USD_RATE} so'm)`;
    } else {
      const inUsd = product.price / USD_RATE;
      return `≈ $${inUsd.toFixed(2)} USD (1$ = ${USD_RATE} so'm)`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">E'lon yuklanmoqda...</p>
          </div>
        ) : !product ? (
          <div className="p-12 text-center">
            <p className="text-base text-gray-600 dark:text-slate-300">E'lon topilmadi yoki o'chirilgan bo'lishi mumkin.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
            >
              Yopish
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-8 space-y-8">
            
            {/* Banner for VIP / Urgent */}
            {product.is_vip ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 flex items-center justify-between text-amber-900 dark:text-amber-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xs sm:text-sm font-black tracking-wide uppercase">⭐ VIP E'LON — Ushbu e'lon yuqori darajada tavsiya etiladi!</span>
                </div>
              </div>
            ) : null}

            {product.is_urgent ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 flex items-center justify-between text-rose-700 dark:text-rose-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-600 fill-rose-600 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black tracking-wide uppercase">🔥 SHOSHILINCH SOTILADI (Narx sezilarli darajada tushirilgan!)</span>
                </div>
              </div>
            ) : null}

            {/* Top Grid: Gallery & Main Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Column: Image Gallery & Video (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                
                {/* Media Switcher Tab (if video available) */}
                {product.video_url && (
                  <div className="flex items-center gap-2 pb-1">
                    <button
                      onClick={() => setActiveMediaTab('images')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeMediaTab === 'images'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                      }`}
                    >
                      📸 Rasmlar ({images.length})
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMediaTab === 'video'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>🎥 Video ko'rish</span>
                    </button>
                  </div>
                )}

                {/* Main Media Player / Image Display */}
                {activeMediaTab === 'video' && product.video_url ? (
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center">
                    {product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') ? (
                      <iframe
                        src={product.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title="Product Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={product.video_url} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 group">
                    <img
                      src={images[activeImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-gray-800 dark:text-slate-100 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-gray-800 dark:text-slate-100 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/65 backdrop-blur-md rounded-xl text-xs font-bold text-white">
                      {activeImageIndex + 1} / {images.length} ta rasm
                    </div>
                  </div>
                )}

                {/* Thumbnails */}
                {images.length > 1 && activeMediaTab === 'images' && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          idx === activeImageIndex
                            ? 'border-emerald-600 ring-2 ring-emerald-600/30 scale-102'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Key Details & Seller Box (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div>
                  
                  {/* Category and Condition */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {product.category_name}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      product.condition === 'new'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {product.condition === 'new' ? 'Yangi holatda' : 'Ishlatilgan'}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                    {product.title}
                  </h1>

                  {/* Price Box with Currency Converter Tool */}
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Narxi:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowInstallmentCalc(!showInstallmentCalc)}
                          className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Bo'lib to'lash</span>
                        </button>
                        <span className="text-gray-300 dark:text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={() => setShowCurrencyCalc(!showCurrencyCalc)}
                          className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Valyuta kursi</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      {product.old_price && product.old_price > product.price ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-gray-400 line-through">
                            {formatPrice(product.old_price, product.currency)}
                          </span>
                          <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
                            Chegirma: -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {showCurrencyCalc && (
                      <div className="pt-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 border-t border-emerald-200 dark:border-emerald-800">
                        {getConvertedPrice()}
                      </div>
                    )}

                    {showInstallmentCalc && (
                      <div className="pt-3 border-t border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                            Muddatli to'lov (Nasiya hisobi):
                          </span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Boshlang'ich to'lovsiz</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[3, 6, 12, 24].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setInstallmentMonths(m)}
                              className={`py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                installmentMonths === m
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-indigo-100'
                              }`}
                            >
                              {m} oy
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-indigo-200/50 dark:border-indigo-800 text-xs">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">Oylik to'lov:</span>
                          <span className="font-black text-sm text-indigo-700 dark:text-indigo-300">
                            ≈ {new Intl.NumberFormat('uz-UZ').format(Math.round(product.price / installmentMonths))} {product.currency === 'USD' ? '$' : 'so\'m'} / oyiga
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom category attributes if provided */}
                  {product.extra_details && typeof product.extra_details === 'object' && Object.keys(product.extra_details).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(product.extra_details).map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <span className="text-gray-400 capitalize">{k}:</span>
                          <span className="font-bold text-gray-800 dark:text-slate-200">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-gray-700 dark:text-slate-300">{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Joylashtirilgan: {formatDate(product.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Ko'rishlar soni: {product.views_count} marta</span>
                    </div>
                  </div>
                </div>

                {/* Seller Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Sotuvchi ma'lumotlari
                    </p>
                    {product.seller_is_verified ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                        Tasdiqlangan
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.seller_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${product.seller_username}`}
                        alt={product.seller_username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{product.seller_username}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{reviewsStats.avg_rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">({reviewsStats.total_reviews} ta sharh)</span>
                        </div>
                      </div>
                    </div>

                    {user && user.id !== product.seller_id && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        ⭐ Sharh qoldirish
                      </button>
                    )}
                  </div>

                  {/* Actions: Call, Telegram, Chat & Make an Offer (Savdolashish) */}
                  <div className="flex flex-col gap-2">
                    
                    {/* Call button */}
                    <button
                      onClick={() => setPhoneRevealed(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {phoneRevealed ? (
                        <a href={`tel:${product.seller_phone}`} className="hover:underline">
                          {product.seller_phone}
                        </a>
                      ) : (
                        <span>Raqamni ko'rsatish ({product.seller_phone ? product.seller_phone.slice(0, 7) + '...' : 'Ko\'rsatish'})</span>
                      )}
                    </button>

                    {/* Telegram direct contact button (Feature 1) */}
                    {(product.seller_telegram || product.seller_phone) && (
                      <a
                        href={product.seller_telegram ? `https://t.me/${product.seller_telegram.replace('@', '')}` : `https://t.me/+${product.seller_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegramda yozish {product.seller_telegram ? `(@${product.seller_telegram})` : ''}</span>
                      </a>
                    )}

                    {/* Chat button */}
                    {(!user || user.id !== product.seller_id) && (
                      <button
                        onClick={() => onOpenChat(product.seller_id, product)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-semibold text-xs border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Sotuvchiga xabar yozish</span>
                      </button>
                    )}

                    {/* Savdolashish / Narx taklif qilish */}
                    {(!user || user.id !== product.seller_id) && (
                      <div>
                        {!showOfferInput ? (
                          <button
                            onClick={() => setShowOfferInput(true)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                          >
                            <span>🤝 Savdolashish (O'z narxingizni taklif qiling)</span>
                          </button>
                        ) : (
                          <form onSubmit={handleSendOffer} className="p-3 bg-amber-50/80 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2 animate-in fade-in">
                            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                              Sotuvchiga o'z narxingizni yozing:
                            </span>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                required
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                placeholder={`Taklif narx (${product.currency})`}
                                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-700 focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={offerSending}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                {offerSending ? '...' : 'Yuborish'}
                              </button>
                            </div>
                            {offerSuccess && (
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✅ Taklifingiz sotuvchining xabarlariga yuborildi!
                              </p>
                            )}
                          </form>
                        )}
                      </div>
                    )}

                    {/* SMS button */}
                    {product.seller_phone && (
                      <a
                        href={`sms:${product.seller_phone}?body=Assalomu alaykum, E'lonUZ dagi "${encodeURIComponent(product.title)}" bo'yicha yozyapman`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        <span>SMS yuborish ({product.seller_phone})</span>
                      </a>
                    )}

                    {/* 🤖 AI BARGAIN BOT */}
                    {(!user || user.id !== product.seller_id) && (
                      <button
                        onClick={() => onOpenBargainBot?.(product)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                      >
                        <span>🤖</span>
                        <span>AI Bot bilan savdolashish (Narx tushirish)</span>
                      </button>
                    )}

                    {/* 🧾 RASMIY XARID CHEKI */}
                    <button
                      onClick={() => onOpenReceipt?.(product)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      <span>🧾</span>
                      <span>Rasmiy xarid cheki (Print / PDF)</span>
                    </button>

                    {/* 🚚 YETKAZIB BERISH */}
                    <button
                      onClick={() => onOpenDelivery?.(product.location)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
                    >
                      <span>🚚</span>
                      <span>Yetkazib berish narxini hisoblash</span>
                    </button>

                    {/* Telegram & Social Share Section */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        E'lonni ulashish:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://elonuz-bozor.surge.sh')}&text=${encodeURIComponent('🔥 ' + product.title + '\n💰 Narxi: ' + formatPrice(product.price, product.currency) + '\n📍 Joylashuv: ' + (product.location || 'O\'zbekiston'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 font-bold text-[11px] border border-sky-200 dark:border-sky-800 transition-colors"
                          title="Telegramda ulashish"
                        >
                          <Send className="w-3 h-3 text-sky-500" />
                          <span>Telegram</span>
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent('🔥 ' + product.title + ' - ' + formatPrice(product.price, product.currency) + ' ' + (typeof window !== 'undefined' ? window.location.origin : ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition-colors"
                          title="WhatsApp orqali ulashish"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-500" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(window.location.origin);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Havolani nusxalash"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                          <span>{copiedLink ? 'Nusxalandi!' : 'Havola'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Compare & Safety Guide buttons */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
                      {onToggleCompare && (
                        <button
                          type="button"
                          onClick={() => onToggleCompare(product)}
                          className={`w-full py-2 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                            isCompared
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isCompared ? '✅ Taqqoslashdan olib tashlash' : '⚖️ E\'lonni Taqqoslashga qo\'shish'}</span>
                        </button>
                      )}

                      {onOpenSafetyGuide && (
                        <button
                          type="button"
                          onClick={onOpenSafetyGuide}
                          className="w-full py-1.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>🛡️ Xavfsiz savdo bo'yicha maslahatlar</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Secondary Actions: Favorite, Share, QR code, Owner actions */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleFavorite(product.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        product.is_favorited
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${product.is_favorited ? 'fill-current' : ''}`} />
                      <span>{product.is_favorited ? 'Saqlangan' : 'Saqlash'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedLink ? 'Nusxalandi!' : 'Ulashish'}</span>
                    </button>

                    {/* QR Code toggle */}
                    <button
                      onClick={() => setShowQrModal(!showQrModal)}
                      className="p-2 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 cursor-pointer"
                      title="QR Kodni ko'rish"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit/Delete if Owner or Admin */}
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        title="E'lonni tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                        title="E'lonni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* QR Modal preview if clicked */}
                {showQrModal && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 text-center space-y-2 animate-in fade-in">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      Ushbu e'lonning tezkor QR kodi:
                    </p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                      alt="QR Code"
                      className="mx-auto rounded-xl p-2 bg-white"
                    />
                    <p className="text-[10px] text-gray-400">Telefon kamerangiz orqali skanerlang</p>
                  </div>
                )}

              </div>
            </div>

            {/* Description Section */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Batafsil tavsif</h2>
              <div className="bg-gray-50/70 dark:bg-slate-800/50 p-5 rounded-3xl border border-gray-200/70 dark:border-slate-800">
                <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Seller Reviews Section (Feature 2) */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sotuvchi haqida fikrlar
                  </h2>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {reviewsStats.avg_rating} ({reviewsStats.total_reviews} ta sharh)
                  </span>
                </div>
                {user && user.id !== product.seller_id && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    ⭐ Sharh qoldirish
                  </button>
                )}
              </div>

              {sellerReviews.length === 0 ? (
                <div className="p-6 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-200/60 dark:border-slate-800 text-center">
                  <p className="text-xs text-gray-400">Ushbu sotuvchi haqida hali sharh qoldirilmagan. Birinchi bo'lib fikr bildiring!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellerReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200/70 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.reviewer_username}`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-slate-600"
                          />
                          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{rev.reviewer_username}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Input Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Sotuvchiga baho va sharh bering
                    </h3>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1">
                        Baho (1 dan 5 gacha yulduzcha):
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="p-1.5 cursor-pointer text-amber-400 hover:scale-120 transition-transform"
                          >
                            <Star className={`w-7 h-7 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                          </button>
                        ))}
                        <span className="text-sm font-bold text-amber-500 ml-2">{reviewRating} / 5</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1">
                        Sharhingiz va fikringiz:
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Masalan: Mahsulot tavsifga to'liq mos keladi, sotuvchi xushmuomala va ishonchli."
                        className="w-full p-3 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      >
                        {submittingReview ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Similar Products */}
            {product.similar && product.similar.length > 0 && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shu toifadagi boshqa e'lonlar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {product.similar.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilarProduct(sim.id)}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-gray-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col group"
                    >
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 mb-2">
                        <img
                          src={sim.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
                          alt={sim.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(sim.price, sim.currency)}
                      </span>
                      <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                        {sim.title}
                      </p>
                      <span className="text-[11px] text-gray-400 mt-1">{sim.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
