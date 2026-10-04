import React, { useState } from 'react';
import { X, MapPin, Navigation, Eye, Heart, ArrowRight } from 'lucide-react';

const REGIONS_DATA = [
  { name: 'Toshkent', x: 78, y: 32, count: 0 },
  { name: 'Samarqand', x: 58, y: 55, count: 0 },
  { name: 'Buxoro', x: 45, y: 52, count: 0 },
  { name: 'Andijon', x: 92, y: 40, count: 0 },
  { name: 'Farg\'ona', x: 88, y: 48, count: 0 },
  { name: 'Namangan', x: 85, y: 35, count: 0 },
  { name: 'Qarshi', x: 55, y: 68, count: 0 },
  { name: 'Termiz', x: 62, y: 85, count: 0 },
  { name: 'Navoiy', x: 48, y: 42, count: 0 },
  { name: 'Jizzax', x: 68, y: 44, count: 0 },
  { name: 'Urganch', x: 26, y: 38, count: 0 },
  { name: 'Nukus', x: 18, y: 25, count: 0 }
];

export default function MapModal({
  isOpen,
  onClose,
  products = [],
  onSelectProduct
}) {
  const [selectedRegion, setSelectedRegion] = useState('Barchasi');

  if (!isOpen) return null;

  // Calculate count per region
  const regionCounts = {};
  products.forEach(p => {
    if (p.location) {
      regionCounts[p.location] = (regionCounts[p.location] || 0) + 1;
    }
  });

  const filteredProducts = selectedRegion === 'Barchasi'
    ? products
    : products.filter(p => p.location && p.location.toLowerCase().includes(selectedRegion.toLowerCase()));

  const formatPrice = (price, currency) => {
    const formatted = new Intl.NumberFormat('uz-UZ').format(price);
    return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-5xl h-[88vh] max-h-[750px] overflow-hidden shadow-2xl flex flex-col relative border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                O'zbekiston E'lonlar Xaritasi
              </h2>
              <p className="text-xs text-gray-400">
                Hududlar bo'yicha e'lonlarni toping va qulay xarid qiling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Map on Top, Listings Grid on Bottom */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Interactive Map Canvas Container (Left / Top) */}
          <div className="md:w-7/12 p-4 flex flex-col bg-slate-50 dark:bg-slate-950/60 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 relative select-none">
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                📍 Hududni tanlang:
              </span>
              <button
                onClick={() => setSelectedRegion('Barchasi')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRegion === 'Barchasi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                }`}
              >
                Barcha hududlar ({products.length})
              </button>
            </div>

            {/* Stylized Visual Map */}
            <div className="flex-1 relative rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-500/20 overflow-hidden flex items-center justify-center p-4">
              
              {/* Decorative grid pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Pins for regions */}
              <div className="w-full h-full relative">
                {REGIONS_DATA.map((reg) => {
                  const count = regionCounts[reg.name] || 0;
                  const isSelected = selectedRegion === reg.name;

                  return (
                    <button
                      key={reg.name}
                      onClick={() => setSelectedRegion(reg.name)}
                      style={{ left: `${reg.x}%`, top: `${reg.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 z-10 ${
                        isSelected ? 'scale-125 z-20' : 'hover:scale-115'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl shadow-lg border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/20'
                          : count > 0
                          ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-emerald-500/50 hover:border-emerald-500'
                          : 'bg-white/80 dark:bg-slate-900/80 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-800'
                      }`}>
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : count > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span className="text-[11px] font-bold">{reg.name}</span>
                        {count > 0 && (
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info corner badge */}
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-800 text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                🇺🇿 Tanlangan: <strong className="text-emerald-600 dark:text-emerald-400">{selectedRegion}</strong> ({filteredProducts.length} ta e'lon)
              </div>
            </div>
          </div>

          {/* Listings List (Right / Bottom) */}
          <div className="md:w-5/12 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                E'lonlar ro'yxati ({filteredProducts.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-300">Bu hududda hozircha e'lonlar yo'q</p>
                  <p className="text-[11px] text-gray-400">Boshqa hududni tanlang yoki e'lon joylang</p>
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex gap-3 group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 shrink-0">
                      <img
                        src={p.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {formatPrice(p.price, p.currency)}
                          </span>
                          {p.is_vip ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950">
                              VIP
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                          {p.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {p.location}
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                          Ko'rish <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
