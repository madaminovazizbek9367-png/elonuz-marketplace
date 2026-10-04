import React from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Scale, 
  MapPin, 
  Sparkles, 
  Check, 
  Clock, 
  Eye, 
  Star 
} from 'lucide-react';

export default function CompareModal({
  isOpen,
  onClose,
  compareItems = [],
  onRemoveItem,
  onClearAll,
  onSelectProduct
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative border border-gray-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>E'lonlarni Taqqoslash</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  {compareItems.length} ta
                </span>
              </h2>
              <span className="text-xs text-gray-400">Mahsulotlarning narxi va parametrlarini yonma-yon solishtiring</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareItems.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tozalash</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-auto p-6">
          {compareItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Scale className="w-14 h-14 mx-auto text-gray-300 dark:text-slate-700" />
              <h3 className="text-base font-bold text-gray-700 dark:text-slate-300">Taqqoslash uchun e'lon tanlanmagan</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                E'lon kartasidagi yoki ichidagi <strong>"⚖️ Taqqoslash"</strong> tugmasini bosib, 2 yoki undan ortiq mahsulotni bu yerga qo'shing.
              </p>
            </div>
          ) : (
            <div className="min-w-[650px]">
              <div className="grid grid-cols-5 gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  Parametrlar
                </div>
                {compareItems.map(item => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md cursor-pointer"
                      title="O'chirish"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                      <img 
                        src={item.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {item.is_vip ? (
                        <span className="absolute top-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-yellow-500 text-white">
                          VIP
                        </span>
                      ) : null}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(item);
                      }}
                      className="mt-2 w-full py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ko'rish</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                
                {/* Narx */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Narxi</span>
                  {compareItems.map(item => (
                    <div key={item.id}>
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('uz-UZ').format(item.price)} {item.currency === 'USD' ? '$' : 'so\'m'}
                      </span>
                      {item.old_price && (
                        <span className="block text-[10px] text-gray-400 line-through">
                          {new Intl.NumberFormat('uz-UZ').format(item.old_price)} {item.currency === 'USD' ? '$' : 'so\'m'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Holati */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Holati</span>
                  {compareItems.map(item => (
                    <div key={item.id}>
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        item.condition === 'new'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Joylashuv */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Joylashuv</span>
                  {compareItems.map(item => (
                    <div key={item.id} className="flex items-center gap-1 text-gray-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item.location || 'O\'zbekiston'}</span>
                    </div>
                  ))}
                </div>

                {/* Sotuvchi reytingi */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Sotuvchi reytingi</span>
                  {compareItems.map(item => (
                    <div key={item.id} className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.seller_rating ? item.seller_rating : '5.0'}</span>
                      {item.seller_verified ? (
                        <span className="text-[10px] text-blue-500 ml-1">✅ Verified</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Video bormi */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Video sharh</span>
                  {compareItems.map(item => (
                    <div key={item.id}>
                      {item.video_url ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Bor
                        </span>
                      ) : (
                        <span className="text-gray-400">Yo'q</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ko'rishlar soni */}
                <div className="grid grid-cols-5 gap-4 py-3 items-center">
                  <span className="font-bold text-gray-500 dark:text-slate-400">Ko'rishlar</span>
                  {compareItems.map(item => (
                    <div key={item.id} className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.views || 0} marta</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
