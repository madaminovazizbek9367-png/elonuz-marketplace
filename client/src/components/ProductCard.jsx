import React from 'react';
import { Heart, MapPin, Eye, Phone, Calendar, CheckCircle2, Star, Video, Zap, Sparkles, Scale } from 'lucide-react';
import PriceAnalyticsBadge from './PriceAnalyticsBadge';

export default function ProductCard({
  product,
  onSelect,
  onToggleFavorite,
  onCallSeller,
  isFavorited,
  onToggleCompare,
  isCompared
}) {
  const formatPrice = (price, currency) => {
    const formatted = new Intl.NumberFormat('uz-UZ').format(price);
    return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  return (
    <div 
      onClick={() => onSelect(product)}
      className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer relative ${
        product.is_vip
          ? 'border-amber-400 dark:border-amber-500 shadow-md shadow-amber-500/15 hover:shadow-xl hover:shadow-amber-500/25 ring-1 ring-amber-400/40'
          : product.is_urgent
          ? 'border-rose-300 dark:border-rose-900/60 shadow-xs hover:border-rose-500 hover:shadow-xl'
          : 'border-gray-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-xl'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-slate-800">
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges on top left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[70%]">
          {product.is_vip ? (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/30">
              <Sparkles className="w-3 h-3 fill-current" />
              VIP
            </span>
          ) : null}

          {product.is_urgent ? (
            <span className="text-[10px] font-black px-2 py-1 rounded-xl bg-rose-600 text-white flex items-center gap-0.5 shadow-md shadow-rose-600/30 animate-pulse">
              <Zap className="w-3 h-3 fill-current" />
              SHOSHILINCH
            </span>
          ) : null}

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-md shadow-xs ${
            product.condition === 'new'
              ? 'bg-emerald-600/90 text-white'
              : 'bg-gray-900/80 text-gray-100'
          }`}>
            {product.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}
          </span>
        </div>

        {/* Video indicator badge */}
        {product.video_url && (
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[10px] font-bold text-white bg-red-600/90 backdrop-blur-xs px-2 py-0.5 rounded-lg shadow-sm">
            <Video className="w-3 h-3" />
            <span>Video</span>
          </div>
        )}

        {/* Compare Button */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            title={isCompared ? "Taqqoslashdan olib tashlash" : "Taqqoslashga qo'shish"}
            className={`absolute top-3 right-12 p-2 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              isCompared
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 scale-105'
                : 'bg-white/85 dark:bg-slate-900/85 text-gray-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          title="Sevimlilarga qo'shish"
          className={`absolute top-3 right-3 p-2 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-xs ${
            isFavorited || product.is_favorited
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
              : 'bg-white/85 dark:bg-slate-900/85 text-gray-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited || product.is_favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Views count badge */}
        {product.views_count !== undefined && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg">
            <Eye className="w-3 h-3" />
            <span>{product.views_count}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Discounts */}
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatPrice(product.price, product.currency)}
            </span>
            {discountPercent > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 line-through">
                  {formatPrice(product.old_price, product.currency)}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  -{discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Market Price Indicator */}
          <div className="mb-2">
            <PriceAnalyticsBadge price={product.price} oldPrice={product.old_price} isCompact={true} />
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-3">
            {product.title}
          </h3>
        </div>

        {/* Location & Date */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-slate-300 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
              {product.location}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-0.5 shrink-0">
              <Calendar className="w-3 h-3" />
              {formatDate(product.created_at)}
            </span>
          </div>

          {/* Seller preview, verified badge, rating & call button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={product.seller_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${product.seller_username}`}
                alt={product.seller_username}
                className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[85px]">
                  {product.seller_username}
                </span>
                {product.seller_is_verified ? (
                  <span title="Tasdiqlangan ishonchli sotuvchi" className="shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                  </span>
                ) : null}
              </div>

              {product.seller_rating && product.seller_rating > 0 ? (
                <div className="hidden sm:flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md ml-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>{product.seller_rating}</span>
                </div>
              ) : null}
            </div>

            {product.seller_phone && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCallSeller(product.seller_phone);
                }}
                title={`Qo'ng'iroq qilish: ${product.seller_phone}`}
                className="p-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Aloqa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
