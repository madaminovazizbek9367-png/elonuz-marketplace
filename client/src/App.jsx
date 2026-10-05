import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { api } from './api';

import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CreateProductModal from './components/CreateProductModal';
import AuthModal from './components/AuthModal';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import AdminPanelModal from './components/AdminPanelModal';
import MapModal from './components/MapModal';
import SafetyGuideModal from './components/SafetyGuideModal';
import CompareModal from './components/CompareModal';
import CurrencyConverterModal from './components/CurrencyConverterModal';
import Footer from './components/Footer';
import DeviceSimulatorToolbar from './components/DeviceSimulatorToolbar';
import BargainBotModal from './components/BargainBotModal';
import ReceiptModal from './components/ReceiptModal';
import DeliveryCalcModal from './components/DeliveryCalcModal';

import { 
  SlidersHorizontal, 
  Search, 
  Sparkles, 
  RotateCcw, 
  ArrowUpDown, 
  PlusCircle,
  PackageOpen,
  Camera,
  Layers,
  MapPin,
  Star,
  Zap,
  Video
} from 'lucide-react';

const LOCATIONS = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Farg\'ona',
  'Namangan',
  'Qarshi',
  'Termiz',
  'Navoiy',
  'Jizzax',
  'Urganch',
  'Nukus'
];

export default function App() {
  const { user, loading: authLoading, refreshCounts } = useAuth();
  const { isDark } = useTheme();

  // Categories & Products state
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [condition, setCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [isFirstVisitAuth, setIsFirstVisitAuth] = useState(false);

  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [detailProductId, setDetailProductId] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState(null);
  const [chatProductContext, setChatProductContext] = useState(null);

  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [filterVip, setFilterVip] = useState(false);
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterVideo, setFilterVideo] = useState(false);

  // New features: Safety, Compare, Currency Converter
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareItems, setCompareItems] = useState([]);

  // Device Simulator
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isLandscape, setIsLandscape] = useState(false);
  const [deviceScale, setDeviceScale] = useState(0.85);

  // Bargain Bot
  const [bargainBotOpen, setBargainBotOpen] = useState(false);
  const [bargainBotProduct, setBargainBotProduct] = useState(null);

  // Receipt / Invoice
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptProduct, setReceiptProduct] = useState(null);
  const [receiptAgreedPrice, setReceiptAgreedPrice] = useState(null);

  // Delivery Calculator
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryOrigin, setDeliveryOrigin] = useState('Toshkent');

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleCompare = (prod) => {
    setCompareItems((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      if (exists) {
        showToast('E\'lon taqqoslashdan olib tashlandi');
        return prev.filter((p) => p.id !== prod.id);
      }
      if (prev.length >= 4) {
        showToast('Ko\'pi bilan 4 ta mahsulotni taqqoslashingiz mumkin!');
        return prev;
      }
      showToast('E\'lon taqqoslashga qo\'shildi!');
      return [...prev, prod];
    });
  };

  const handleRemoveCompareItem = (prodId) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== prodId));
    showToast('Taqqoslashdan olib tashlandi');
  };

  const handleClearCompare = () => {
    setCompareItems([]);
    showToast('Taqqoslash ro\'yxati tozalandi');
  };

  // Fetch categories
  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch products with active filters
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = {
        search: appliedSearch || undefined,
        category_id: selectedCategory || undefined,
        location: selectedLocation || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        currency: currency || undefined,
        condition: condition !== 'all' ? condition : undefined,
        sort: sortBy,
        limit: 48,
        is_vip: filterVip ? 1 : undefined,
        is_urgent: filterUrgent ? 1 : undefined,
        has_video: filterVideo ? 1 : undefined
      };
      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setTotalCount(res.pagination ? res.pagination.total : res.products.length);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [appliedSearch, selectedCategory, selectedLocation, currency, condition, sortBy, filterVip, filterUrgent, filterVideo]);

  const handleSearchSubmit = () => {
    setAppliedSearch(searchTerm);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setSelectedCategory(null);
    setSelectedLocation('');
    setMinPrice('');
    setMaxPrice('');
    setCurrency('');
    setCondition('all');
    setSortBy('newest');
    setFilterVip(false);
    setFilterUrgent(false);
    setFilterVideo(false);
  };

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleToggleFavorite = async (prodId) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(prodId);
      showToast(res.message);
      setProducts(prev => prev.map(p => {
        if (p.id === prodId) {
          return {
            ...p,
            is_favorited: res.favorited ? 1 : 0
          };
        }
        return p;
      }));
      refreshCounts();
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleOpenChatFromProduct = (sellerId, product) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setChatTargetUserId(sellerId);
    setChatProductContext(product);
    setDetailProductId(null);
    setChatModalOpen(true);
  };

  const handleCallSeller = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setDetailProductId(null);
    setCreateProductOpen(true);
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Haqiqatan ham bu e\'lonni o\'chirmoqchimisiz?')) return;
    try {
      await api.deleteProduct(prodId);
      showToast('E\'lon muvaffaqiyatli o\'chirildi');
      setDetailProductId(null);
      loadProducts();
      refreshCounts();
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik');
    }
  };

  const activeFiltersCount = [
    appliedSearch,
    selectedCategory,
    selectedLocation,
    minPrice,
    maxPrice,
    currency,
    condition !== 'all' ? condition : null,
    filterVip ? 'vip' : null,
    filterUrgent ? 'urgent' : null,
    filterVideo ? 'video' : null
  ].filter(Boolean).length;

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  // If mobile or tablet preview mode is selected on the main window, render inside real device frame!
  if (!isInsideIframe && deviceMode !== 'desktop') {
    const iframeUrl = window.location.origin + window.location.pathname;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start overflow-y-auto p-4 pt-16 relative">
        {/* Device Switcher Toolbar */}
        <DeviceSimulatorToolbar
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          isLandscape={isLandscape}
          setIsLandscape={setIsLandscape}
          scale={deviceScale}
          setScale={setDeviceScale}
        />

        {/* Ambient Glow */}
        <div className="fixed top-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Real Hardware Frame with actual live responsive viewport */}
        <div
          className="relative transition-all duration-300 my-auto shadow-2xl"
          style={{
            transform: `scale(${deviceScale})`,
            transformOrigin: 'top center',
            width: deviceMode === 'mobile'
              ? (isLandscape ? '844px' : '390px')
              : (isLandscape ? '1024px' : '768px'),
            height: deviceMode === 'mobile'
              ? (isLandscape ? '440px' : '844px')
              : (isLandscape ? '768px' : '980px'),
            borderRadius: deviceMode === 'mobile' ? '54px' : '32px',
            border: deviceMode === 'mobile' ? '12px solid #1e293b' : '14px solid #1e293b',
            boxShadow: '0 0 0 2px #475569, 0 35px 90px rgba(0,0,0,0.85)',
            background: '#020617',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Dynamic Island on Phone */}
          {deviceMode === 'mobile' && !isLandscape && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full pointer-events-none flex items-center justify-between px-3 border border-slate-900 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
          )}

          {/* Front Camera on Tablet */}
          {deviceMode === 'tablet' && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-2.5 h-2.5 bg-black rounded-full pointer-events-none border border-slate-800" />
          )}

          {/* The Live Responsive Website */}
          <iframe
            src={iframeUrl}
            title="E'lonUZ Live Device Preview"
            className="w-full h-full border-none flex-1 bg-white dark:bg-slate-950"
          />

          {/* iPhone Home indicator bar */}
          {deviceMode === 'mobile' && !isLandscape && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 w-32 h-1 bg-white/40 rounded-full pointer-events-none" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 📱 Device Simulator Toolbar — only rendered on parent desktop view */}
      {!isInsideIframe && (
        <DeviceSimulatorToolbar
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          isLandscape={isLandscape}
          setIsLandscape={setIsLandscape}
          scale={deviceScale}
          setScale={setDeviceScale}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        onOpenAuth={(mode) => {
          setIsFirstVisitAuth(false);
          setAuthMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onOpenCreateProduct={() => {
          setEditingProduct(null);
          setCreateProductOpen(true);
        }}
        onOpenFavorites={() => {
          setProfileInitialTab('favorites');
          setProfileModalOpen(true);
        }}
        onOpenMessages={() => {
          setChatTargetUserId(null);
          setChatProductContext(null);
          setChatModalOpen(true);
        }}
        onOpenProfile={(tab) => {
          setProfileInitialTab(tab || 'profile');
          setProfileModalOpen(true);
        }}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenSafetyGuide={() => setIsSafetyOpen(true)}
        onOpenCurrencyConverter={() => setIsCurrencyOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenDelivery={() => setDeliveryOpen(true)}
        compareCount={compareItems.length}
        locations={LOCATIONS}
      />

      {/* Categories Bar */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Banner */}
        {!appliedSearch && !selectedCategory && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-10 mb-8 shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                O'zbekistondagi eng erkin va qulay e'lonlar platformasi
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Xohlagan narsangizni soting va xarid qiling!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Telefon, mashina, kvartira, kompyuter yoki kiyim-kechak. Kamida 3 ta sifatli rasm joylang va sotuvni boshlang.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (!user) {
                      setIsFirstVisitAuth(false);
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    } else {
                      setEditingProduct(null);
                      setCreateProductOpen(true);
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-black text-xs sm:text-sm hover:bg-emerald-50 shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>+ E'lon joylashtirish (3 ta rasm bilan)</span>
                </button>
              </div>
            </div>

            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Filter Bar & Sorting */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs mb-6 space-y-3 transition-colors">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {totalCount} ta e'lon topildi
              </span>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Tozalash ({activeFiltersCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Quick filter pills: Map, VIP, Urgent, Video */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  🗺️ Xarita
                </button>
                <button
                  onClick={() => setFilterVip(!filterVip)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    filterVip
                      ? 'bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-500/25'
                      : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  ⭐ VIP
                </button>
                <button
                  onClick={() => setFilterUrgent(!filterUrgent)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    filterUrgent
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  🔥 Shoshilinch
                </button>
                <button
                  onClick={() => setFilterVideo(!filterVideo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    filterVideo
                      ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/25'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  🎥 Videoli
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap" />
            <div className="flex items-center gap-3 flex-wrap">
              {/* Condition Filter */}
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCondition('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    condition === 'all' 
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-2xs' 
                      : 'text-gray-600 dark:text-slate-400'
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setCondition('new')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    condition === 'new' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold' 
                      : 'text-gray-600 dark:text-slate-400'
                  }`}
                >
                  Yangi
                </button>
                <button
                  onClick={() => setCondition('used')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    condition === 'used' 
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-2xs font-bold' 
                      : 'text-gray-600 dark:text-slate-400'
                  }`}
                >
                  Ishlatilgan
                </button>
              </div>

              {/* Currency */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-gray-100 dark:bg-slate-800 border-none text-xs font-bold text-gray-700 dark:text-slate-300 px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Barcha valyutalar</option>
                <option value="UZS">UZS (so'm)</option>
                <option value="USD">USD ($)</option>
              </select>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="newest" className="dark:bg-slate-800">Eng yangilari</option>
                  <option value="price_asc" className="dark:bg-slate-800">Eng arzon</option>
                  <option value="price_desc" className="dark:bg-slate-800">Eng qimmat</option>
                  <option value="views" className="dark:bg-slate-800">Eng ko'p ko'rilgan</option>
                </select>
              </div>

              {/* Filter drawer toggle button */}
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  showFilterDrawer
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Narx filtri</span>
              </button>
            </div>
          </div>

          {/* Expandable Price Filter Box */}
          {showFilterDrawer && (
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
              <form onSubmit={handleApplyPriceFilter} className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">Narx oralig'i:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Qo'llash
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Product Grid / Listings */}
        {loadingProducts ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400">E'lonlar qidirilmoqda...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-10 sm:p-16 text-center my-6 space-y-4 shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <PackageOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Hozircha saytda yangi e'lonlar yo'q
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                Barcha eski namunalar tozalab tashlandi. Birinchi bo'lib o'zingiz sotmoqchi bo'lgan narsangizni (masalan: telefon, mashina, kvartira) <strong>kamida 5 ta rasm</strong> bilan sotuvga qo'ying!
              </p>
            </div>
            
            <button
              onClick={() => {
                if (!user) {
                  setIsFirstVisitAuth(false);
                  setAuthMode('login');
                  setAuthModalOpen(true);
                } else {
                  setEditingProduct(null);
                  setCreateProductOpen(true);
                }
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              <span>+ Birinchi bo'lib e'lon joylashtirish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={product.is_favorited === 1}
                onSelect={(prod) => setDetailProductId(prod.id)}
                onToggleFavorite={handleToggleFavorite}
                onCallSeller={handleCallSeller}
                onToggleCompare={handleToggleCompare}
                isCompared={compareItems.some((c) => c.id === product.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODALS */}
      {/* 1. Auth Modal (Shows on 1st visit if not logged in) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        isMandatory={isFirstVisitAuth}
        onClose={() => {
          setAuthModalOpen(false);
          setIsFirstVisitAuth(false);
        }}
      />

      {/* 2. Create Product Modal (Enforces min 5 images) */}
      <CreateProductModal
        isOpen={createProductOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => {
          setCreateProductOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          showToast(editingProduct ? 'E\'lon yangilandi!' : 'Yangi e\'loningiz barcha foydalanuvchilarga ko\'rindi!');
          loadProducts();
          loadCategories();
          refreshCounts();
        }}
      />

      {/* 3. Product Detail Modal with Bargain, QR, Converter & Installments */}
      <ProductDetailModal
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
        onToggleFavorite={handleToggleFavorite}
        onOpenChat={handleOpenChatFromProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onSelectSimilarProduct={(simId) => setDetailProductId(simId)}
        onToggleCompare={handleToggleCompare}
        isCompared={compareItems.some((c) => c.id === detailProductId)}
        onOpenSafetyGuide={() => setIsSafetyOpen(true)}
        onOpenBargainBot={(p) => {
          setBargainBotProduct(p);
          setBargainBotOpen(true);
        }}
        onOpenReceipt={(p) => {
          setReceiptProduct(p);
          setReceiptOpen(true);
        }}
        onOpenDelivery={(origin) => {
          setDeliveryOrigin(origin || 'Toshkent');
          setDeliveryOpen(true);
        }}
      />

      {/* 4. User Profile */}
      <ProfileModal
        isOpen={profileModalOpen}
        initialTab={profileInitialTab}
        onClose={() => setProfileModalOpen(false)}
        onEditProduct={handleEditProduct}
        onSelectProduct={(p) => setDetailProductId(p.id)}
      />

      {/* 5. Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        initialTargetUserId={chatTargetUserId}
        initialProduct={chatProductContext}
        onClose={() => {
          setChatModalOpen(false);
          setChatTargetUserId(null);
          setChatProductContext(null);
        }}
      />

      {/* 6. Admin Panel */}
      <AdminPanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSelectProduct={(p) => setDetailProductId(p.id)}
      />

      {/* 7. Map Modal */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setIsMapOpen(false);
          setDetailProductId(p.id);
        }}
      />

      {/* 8. Safety & Anti-Scam Guide Modal */}
      <SafetyGuideModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {/* 9. Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareItems={compareItems}
        onRemoveItem={handleRemoveCompareItem}
        onClearAll={handleClearCompare}
        onSelectProduct={(p) => {
          setIsCompareOpen(false);
          setDetailProductId(p.id);
        }}
      />

      {/* 10. Currency Converter Modal */}
      <CurrencyConverterModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
      />

      {/* 11. AI Bargain Bot Modal */}
      <BargainBotModal
        isOpen={bargainBotOpen}
        onClose={() => {
          setBargainBotOpen(false);
          setBargainBotProduct(null);
        }}
        product={bargainBotProduct}
        onApplyAgreedPrice={(newPrice) => {
          setReceiptAgreedPrice(newPrice);
          showToast(`Kelishilgan narx saqlandi: ${newPrice.toLocaleString()} ${bargainBotProduct?.currency || ''}`);
        }}
      />

      {/* 12. Official Receipt & Warranty Modal */}
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptProduct(null);
        }}
        product={receiptProduct}
        agreedPrice={receiptAgreedPrice}
        currentUser={user}
      />

      {/* 13. Delivery Calculator Modal */}
      <DeliveryCalcModal
        isOpen={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        productOrigin={deliveryOrigin}
      />

    </div>
  );
}
