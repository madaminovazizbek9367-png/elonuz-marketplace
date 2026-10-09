import React from 'react';
import { ShoppingBag, ShieldCheck, Heart, Send, PhoneCall } from 'lucide-react';

export default function Footer({ onSelectCategory, categories = [] }) {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-20 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                E'lon<span className="text-emerald-400">UZ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O'zbekistondagi eng qulay va zamonaviy e'lonlar platformasi. Uy-joy, avtomobil, elektronika va boshqa turdagi mahsulotlarni tez va xavfsiz sotib oling yoki soting.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Xavfsiz va ishonchli savdo</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Ommabop kategoriyalar</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.id)}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platforma Imkoniyatlari</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>🤖 Telegram Bot: <strong className="text-sky-400 font-bold">@Elon_Uz_009_bot</strong></li>
              <li>🗺️ O'zbekiston E'lonlar Xaritasi</li>
              <li>📊 Sotuvchi Statistikasi & Analytics</li>
              <li>💬 Jonli Chat & Ovozli Xabarlar</li>
              <li>🚚 Viloyatlararo Yetkazib berish Kalkulyatori</li>
            </ul>
          </div>

          {/* Contacts & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Qo'llab-quvvatlash</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>+998 (90) 123-45-67</span>
              </div>
              <a 
                href="https://t.me/Mdmnv_77" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Telegram: @Mdmnv_77</span>
              </a>
              <p className="text-[11px] pt-1 text-slate-400">
                Admin: <a href="https://t.me/Mdmnv_77" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">@Mdmnv_77</a> (24/7 onlayn)
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 E'lonUZ Marketplace. Barcha huquqlar himoyalangan.</p>
          <p className="flex items-center gap-1">
            <span>Yaratildi</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>bilan O'zbekiston uchun</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
