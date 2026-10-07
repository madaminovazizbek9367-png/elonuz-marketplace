import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Eye, Heart, MessageCircle, Star, Package, Award, Activity, Users } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SellerStatsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Try dedicated getSellerStats API first
        try {
          const statsRes = await api.getSellerStats(user.id);
          if (statsRes && statsRes.totalProducts !== undefined) {
            setStats({
              products: statsRes.products || [],
              totalProducts: statsRes.totalProducts || 0,
              totalViews: statsRes.totalViews || 0,
              totalFavorites: statsRes.totalFavorites || 0,
              totalMessages: statsRes.totalMessages || 0,
              totalReviews: statsRes.totalReviews || 0,
              averageRating: statsRes.averageRating || 0,
              topViewed: statsRes.viewsPerProduct || [],
              categories: statsRes.categoryStats || {},
              ratingDist: statsRes.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
              recentReviews: statsRes.recentReviews || [],
              recentMessages: []
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Dedicated stats failed, using fallback:", e);
        }

        const [productsRes, reviewsRes, convRes, favRes] = await Promise.all([
          api.getProducts({ user_id: user.id }),
          api.getSellerReviews(user.id),
          api.getConversations(),
          api.getFavorites()
        ]);

        const products = productsRes?.products || productsRes?.data || [];
        const reviews = reviewsRes?.reviews || reviewsRes?.data || [];
        const conversations = convRes?.conversations || convRes?.data || [];
        
        const totalProducts = products.length;
        const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
        
        const totalFavorites = products.reduce((acc, p) => acc + (p.favs || p.favorites_count || 0), 0);
        const totalMessages = conversations.length;
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1) 
          : 0;

        // Top 5 viewed products
        const topViewed = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

        // Products by category
        const categories = {};
        products.forEach(p => {
          const cat = p.category_name || p.category || 'Boshqa';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        // Rating distribution
        const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) {
            ratingDist[r.rating]++;
          }
        });

        setStats({
          products,
          totalProducts,
          totalViews,
          totalFavorites,
          totalMessages,
          totalReviews,
          averageRating,
          topViewed,
          categories,
          ratingDist,
          recentReviews: reviews.slice(0, 5),
          recentMessages: conversations.slice(0, 5)
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Sotuvchi Statistikasi</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-950">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : !stats ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              Ma'lumot topilmadi
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Package} label="E'lonlar" value={stats.totalProducts} color="blue" />
                <StatCard icon={Eye} label="Ko'rishlar" value={stats.totalViews} color="emerald" />
                <StatCard icon={Heart} label="Saralangan" value={stats.totalFavorites} color="rose" />
                <StatCard icon={MessageCircle} label="Xabarlar" value={stats.totalMessages} color="indigo" />
                <StatCard icon={Star} label="O'rtacha baho" value={stats.averageRating} color="yellow" />
                <StatCard icon={Award} label="Sharhlar" value={stats.totalReviews} color="purple" />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bar Chart: Views per product */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Eng ko'p ko'rilgan e'lonlar
                  </h3>
                  <div className="space-y-4">
                    {stats.topViewed.map((p, i) => {
                      const maxViews = Math.max(...stats.topViewed.map(v => v.views || 0), 1);
                      const percent = ((p.views || 0) / maxViews) * 100;
                      return (
                        <div key={p.id || i} className="relative">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{p.title}</span>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{p.views || 0}</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {stats.topViewed.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Hozircha ma'lumot yo'q</div>
                    )}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Baholar taqsimoti
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = stats.ratingDist[stars];
                      const total = stats.totalReviews || 1;
                      const percent = (count / total) * 100;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12 text-sm text-gray-600 dark:text-gray-400">
                            {stars} <Star className="w-3 h-3 fill-current text-yellow-500" />
                          </div>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <div className="w-8 text-right text-xs text-gray-500 dark:text-gray-400">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Product Performance Table */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-500" />
                    E'lonlar ko'rsatkichlari
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3 font-medium">Sarlavha</th>
                        <th className="px-6 py-3 font-medium">Ko'rishlar</th>
                        <th className="px-6 py-3 font-medium">Saralangan</th>
                        <th className="px-6 py-3 font-medium">Narx</th>
                        <th className="px-6 py-3 font-medium">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                      {stats.products.map((p, i) => (
                        <tr key={p.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium">{p.title}</td>
                          <td className="px-6 py-4">{p.views || 0}</td>
                          <td className="px-6 py-4">{p.favorites_count || 0}</td>
                          <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                            {p.price?.toLocaleString()} {p.currency}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              p.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {p.status === 'active' ? 'Faol' : 'Nofaol'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {stats.products.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            E'lonlar topilmadi
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    So'nggi sharhlar
                  </h3>
                  <div className="space-y-4">
                    {stats.recentReviews.map((r, i) => (
                      <div key={i} className="flex gap-4 items-start border-b border-gray-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{r.author_name || 'Foydalanuvchi'}</span>
                            <div className="flex items-center text-yellow-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs ml-1">{r.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                    {stats.recentReviews.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Sharhlar yo'q</div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    So'nggi xabarlar
                  </h3>
                  <div className="space-y-4">
                    {stats.recentMessages.map((m, i) => (
                      <div key={m.id || i} className="flex gap-4 items-start border-b border-gray-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                            {m.participant_name || 'Foydalanuvchi'}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-sm">
                            {m.last_message || 'Xabar matni...'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {stats.recentMessages.length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Xabarlar yo'q</div>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  );
}
