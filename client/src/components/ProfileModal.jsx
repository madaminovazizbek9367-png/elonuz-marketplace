import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  Heart, 
  Edit3, 
  Trash2, 
  Key, 
  Save, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Send,
  BadgeCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({
  isOpen,
  onClose,
  initialTab = 'profile',
  onEditProduct,
  onSelectProduct
}) {
  const { user, updateUserState, refreshCounts } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showCurrPwd, setShowCurrPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || !user) return;

    setUsername(user.username || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatar_url || '');
    setTelegramUsername(user.telegram_username || '');
    setCurrentPassword('');
    setNewPassword('');
    setProfileMessage({ text: '', type: '' });

    if (activeTab === 'my-listings') {
      loadMyListings();
    } else if (activeTab === 'favorites') {
      loadFavorites();
    }
  }, [isOpen, user, activeTab]);

  const loadMyListings = async () => {
    setLoadingListings(true);
    try {
      const res = await api.getProducts({ user_id: user.id, limit: 100 });
      setMyListings(res.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingListings(false);
    }
  };

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const res = await api.getFavorites();
      setFavorites(res.favorites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFavorites(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ text: '', type: '' });

    try {
      const payload = {
        username: username.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        telegram_username: telegramUsername.trim() || undefined
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.updateProfile(payload);
      updateUserState(res.user);
      setProfileMessage({ text: 'Profil muvaffaqiyatli saqlandi!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setProfileMessage({ text: err.message || 'Xatolik yuz berdi', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm('Haqiqatan ham bu e\'lonni o\'chirmoqchimisiz?')) return;
    try {
      await api.deleteProduct(productId);
      setMyListings(prev => prev.filter(p => p.id !== productId));
      refreshCounts();
    } catch (err) {
      alert(err.message || 'E\'lonni o\'chirishda xatolik');
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await api.toggleFavorite(productId);
      setFavorites(prev => prev.filter(f => f.id !== productId));
      refreshCounts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-emerald-500/30"
            />
            <div>
              <h2 className="text-base font-bold">{user.username}</h2>
              <span className="text-xs text-gray-400 capitalize">{user.role} hisobi</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-850 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Shaxsiy ma'lumotlar</span>
          </button>

          <button
            onClick={() => setActiveTab('my-listings')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my-listings'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mening e'lonlarim</span>
            <span className="text-[10px] bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-gray-700 dark:text-slate-300">
              {myListings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Sevimlilar</span>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-full">
              {favorites.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: Profile Edit */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="max-w-xl mx-auto space-y-5">
              {profileMessage.text && (
                <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-slate-300">
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800/50 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-slate-300">
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-slate-300">
                  Profil rasmi URL manzili
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Telegram Username */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  Telegram username (ixtiyoriy)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-sky-500 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Xaridorlar sizga Telegram orqali murojaat qila oladi</p>
              </div>

              {/* Verified Badge (Admin only) */}
              {user.role === 'admin' && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4" />
                        Tasdiqlangan Foydalanuvchi
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Admin tomonidan tasdiqlash belgisi</p>
                    </div>
                    <button
                      type="button"
                      disabled={verifyLoading}
                      onClick={async () => {
                        setVerifyLoading(true);
                        try {
                          const res = await api.toggleVerifyBadge(user.id);
                          updateUserState({ ...user, is_verified: res.is_verified });
                          setProfileMessage({ text: res.is_verified ? '✅ Tasdiqlangan belgisi qo\'yildi!' : 'Belgi olib tashlandi', type: 'success' });
                        } catch(e) {
                          setProfileMessage({ text: e.message, type: 'error' });
                        } finally {
                          setVerifyLoading(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        user.is_verified
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300'
                      }`}
                    >
                      {verifyLoading ? '...' : user.is_verified ? '✅ Tasdiqlangan' : 'Tasdiqlash'}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-gray-900 dark:text-white">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  Parolni o'zgartirish (ixtiyoriy)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Joriy parol
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrPwd ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 pr-10 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrPwd(!showCurrPwd)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showCurrPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                      Yangi parol
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 pr-10 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: My Listings */}
          {activeTab === 'my-listings' && (
            <div>
              {loadingListings ? (
                <div className="py-12 text-center text-gray-400 text-xs">E'lonlaringiz yuklanmoqda...</div>
              ) : myListings.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm font-bold text-gray-600 dark:text-slate-300">Sizda hali e'lonlar mavjud emas</p>
                  <p className="text-xs text-gray-400 mt-1">O'zingiz xohlagan mahsulotni sotuvga qo'ying!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myListings.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-4/3 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
                          <img 
                            src={p.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-white">
                            {p.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}
                          </span>
                        </div>
                        <div className="p-3">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency === 'USD' ? '$' : 'so\'m'}
                          </span>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mt-1">{p.title}</h4>
                          <span className="text-[11px] text-gray-400 block mt-0.5">{p.location}</span>
                        </div>
                      </div>

                      <div className="p-3 pt-0 border-t border-gray-100 dark:border-slate-700 mt-2 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ko'rish
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              onEditProduct(p);
                            }}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(p.id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Favorites */}
          {activeTab === 'favorites' && (
            <div>
              {loadingFavorites ? (
                <div className="py-12 text-center text-gray-400 text-xs">Saqlanganlar yuklanmoqda...</div>
              ) : favorites.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Heart className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm font-bold text-gray-600 dark:text-slate-300">Sevimlilar ro'yxati bo'sh</p>
                  <p className="text-xs text-gray-400 mt-1">Sizga yoqqan e'lonlarni ❤️ orqali saqlang</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((fav) => (
                    <div 
                      key={fav.id} 
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div 
                        onClick={() => {
                          onClose();
                          onSelectProduct(fav);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="aspect-4/3 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
                          <img 
                            src={fav.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(fav.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-white shadow-xs cursor-pointer"
                            title="Sevimlilardan o'chirish"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <div className="p-3">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat('uz-UZ').format(fav.price)} {fav.currency === 'USD' ? '$' : 'so\'m'}
                          </span>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mt-1">{fav.title}</h4>
                          <span className="text-[11px] text-gray-400 block mt-0.5">{fav.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
