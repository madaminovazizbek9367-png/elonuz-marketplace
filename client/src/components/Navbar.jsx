import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  PlusCircle, 
  LogOut, 
  ShieldAlert, 
  MapPin, 
  Menu, 
  X,
  ChevronDown,
  Sun,
  Moon,
  Send,
  Scale,
  ShieldCheck,
  Calculator
} from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onSearchSubmit,
  selectedLocation,
  setSelectedLocation,
  onOpenAuth,
  onOpenCreateProduct,
  onOpenFavorites,
  onOpenMessages,
  onOpenProfile,
  onOpenAdmin,
  onOpenSafetyGuide,
  onOpenCurrencyConverter,
  onOpenCompare,
  compareCount = 0,
  locations = []
}) {
  const { user, logout, favoriteCount, unreadMsgCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.location.reload(); }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  E'lon<span className="text-emerald-600">UZ</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 tracking-wider uppercase -mt-1">
                  E'lonlar sayti
                </span>
              </div>
            </a>
          </div>

          {/* Search bar & Location dropdown */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center bg-gray-100/90 dark:bg-slate-800/90 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-850 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all p-1.5">
            <div className="flex items-center pl-3 pr-2 text-gray-400 dark:text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Qidiruv (masalan: telefon, kvartira, mashina)..."
              className="w-full bg-transparent border-none text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-0 py-1.5"
            />
            
            {/* Location selector */}
            <div className="flex items-center border-l border-gray-200 dark:border-slate-700 pl-3 pr-1">
              <MapPin className="w-4 h-4 text-emerald-600 mr-1 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-4"
              >
                <option value="" className="dark:bg-slate-900">Barcha hududlar</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="dark:bg-slate-900">{loc}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onSearchSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ml-1"
            >
              Qidirish
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Valyuta Kursi & Konvertor */}
            <button
              onClick={onOpenCurrencyConverter}
              title="Valyuta konvertori: 1$ = 12,850 so'm"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-2xl transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800 text-xs font-bold"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>1$ = 12,850</span>
            </button>

            {/* Xavfsizlik yo'riqnomasi */}
            <button
              onClick={onOpenSafetyGuide}
              title="Xavfsiz savdo va firibgarlardan himoya qoidalari"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl transition-colors cursor-pointer text-xs font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Xavfsizlik</span>
            </button>

            {/* E'lonlarni Taqqoslash */}
            <button
              onClick={onOpenCompare}
              title="E'lonlarni taqqoslash jadvali"
              className="relative p-2.5 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Telegram Lichka: @Mdmnv_77 */}
            <a
              href="https://t.me/Mdmnv_77"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram: @Mdmnv_77 bilan bog'lanish"
              className="flex items-center gap-1.5 p-2 px-3 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-2xl transition-all cursor-pointer border border-sky-200 dark:border-sky-800 text-xs font-bold"
            >
              <Send className="w-4 h-4 text-sky-500" />
              <span className="hidden sm:inline">@Mdmnv_77</span>
            </a>

            {/* ☀️ / 🌙 Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Kunduzgi rejimga o'tish (Quyosh)" : "Tungi rejimga o'tish (Oy)"}
              className="p-2.5 text-gray-600 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer relative group"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Messages */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onOpenMessages();
              }}
              title="Xabarlar"
              className="relative p-2.5 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMsgCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadMsgCount}
                </span>
              )}
            </button>

            {/* Favorites */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onOpenFavorites();
              }}
              title="Sevimlilar"
              className="relative p-2.5 text-gray-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/30"
                  />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 hidden sm:inline max-w-[90px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-xs text-gray-400">Kirilgan hisob:</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile('profile');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Mening profilim
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile('my-listings');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      Mening e'lonlarim
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Admin Boshqaruv Paneli
                      </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
              >
                Ro'yxatdan o'tish / Kirish
              </button>
            )}

            {/* Post Ad Button */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth('login');
                } else {
                  onOpenCreateProduct();
                }
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">E'lon berish</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & filter */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-150">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKey}
                  placeholder="E'lonlarni qidirish..."
                  className="w-full bg-transparent border-none text-sm text-gray-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-semibold text-gray-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">Barcha hududlar</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  onSearchSubmit();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Qidirish
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
