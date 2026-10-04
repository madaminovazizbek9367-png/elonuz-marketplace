import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Ban, 
  Trash2, 
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanelModal({ isOpen, onClose, onSelectProduct }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [productsList, setProductsList] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isOpen || !user || user.role !== 'admin') return;
    loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'products') loadProducts();
  }, [isOpen, activeTab, user]);

  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      setStats(res.stats);
      setRecentProducts(res.recentProducts || []);
      setRecentUsers(res.recentUsers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAdminUsers({ search: userSearch });
      setUsersList(res.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getAdminProducts({ search: productSearch });
      setProductsList(res.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!isOpen || !user || user.role !== 'admin') return null;

  const handleToggleBlock = async (targetUserId) => {
    try {
      const res = await api.toggleUserBlock(targetUserId);
      setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, is_blocked: res.is_blocked } : u));
      loadStats();
    } catch (err) {
      alert(err.message || 'Foydalanuvchini bloklashda xatolik');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Admin sifatida ushbu e\'lonni butunlay o\'chirmoqchimisiz?')) return;
    try {
      await api.adminDeleteProduct(productId);
      setProductsList(prev => prev.filter(p => p.id !== productId));
      loadStats();
    } catch (err) {
      alert(err.message || 'E\'lonni o\'chirishda xatolik');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Admin Boshqaruv Markazi</h2>
              <p className="text-xs text-slate-400">Foydalanuvchilar, barcha e'lonlar va moderatsiya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            Statistika & Umumiy
          </button>
          <button
            onClick={() => { setActiveTab('users'); loadUsers(); }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            Foydalanuvchilar ({stats?.totalUsers || 0})
          </button>
          <button
            onClick={() => { setActiveTab('products'); loadProducts(); }}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            Barcha E'lonlar ({stats?.totalProducts || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* TAB 1: Stats */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Jami Foydalanuvchilar</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-black">{stats.totalUsers}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Faol E'lonlar</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black">{stats.activeProducts}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Xabarlar</span>
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-black">{stats.totalMessages}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Bloklanganlar</span>
                    <Ban className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-black text-rose-600">{stats.blockedUsers}</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                    Yangi qo'shilgan e'lonlar
                  </h3>
                  {recentProducts.length === 0 ? (
                    <p className="text-xs text-gray-400">Hozircha yangi e'lonlar yo'q</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {recentProducts.map((p) => (
                        <div key={p.id} className="py-2.5 flex items-center justify-between">
                          <div className="min-w-0 pr-3">
                            <p className="text-xs font-bold truncate">{p.title}</p>
                            <span className="text-[11px] text-gray-500">Sotuvchi: {p.seller_username}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 shrink-0">
                            {p.price} {p.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs">
                  <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                    Ro'yxatdan o'tganlar
                  </h3>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">{u.username}</p>
                          <span className="text-[11px] text-gray-400">{u.email}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-slate-800'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Users */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    placeholder="Username, email yoki telefon bo'yicha qidirish..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Qidirish
                </button>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Foydalanuvchi</th>
                      <th className="py-3 px-4">Aloqa</th>
                      <th className="py-3 px-4">Rol</th>
                      <th className="py-3 px-4">E'lonlar</th>
                      <th className="py-3 px-4">Holat</th>
                      <th className="py-3 px-4 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">Foydalanuvchilar yuklanmoqda...</td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">Foydalanuvchilar topilmadi</td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60">
                          <td className="py-3 px-4 flex items-center gap-2.5">
                            <img
                              src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                            />
                            <span className="font-bold">{u.username}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p>{u.phone}</p>
                            <span className="text-[11px] text-gray-400">{u.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-slate-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">{u.listing_count} ta</td>
                          <td className="py-3 px-4">
                            {u.is_blocked ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                                Bloklangan
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                                Faol
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleToggleBlock(u.id)}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                  u.is_blocked
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-200'
                                }`}
                              >
                                {u.is_blocked ? 'Faollashtirish' : 'Bloklash'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Products */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                    placeholder="E'lon nomi yoki sotuvchi bo'yicha qidirish..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <button
                  onClick={loadProducts}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Qidirish
                </button>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">E'lon</th>
                      <th className="py-3 px-4">Kategoriya</th>
                      <th className="py-3 px-4">Narxi</th>
                      <th className="py-3 px-4">Sotuvchi</th>
                      <th className="py-3 px-4">Joylashuv</th>
                      <th className="py-3 px-4 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">E'lonlar yuklanmoqda...</td>
                      </tr>
                    ) : productsList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">E'lonlar mavjud emas</td>
                      </tr>
                    ) : (
                      productsList.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.primary_image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold line-clamp-1 max-w-xs">{p.title}</p>
                              <span className="text-[10px] text-gray-400">ID: {p.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">
                              {p.category_name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {p.seller_username}
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-slate-400">
                            {p.location}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  onClose();
                                  onSelectProduct(p);
                                }}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                title="Ko'rish"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
