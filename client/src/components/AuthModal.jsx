import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Image as ImageIcon, AlertCircle, ShieldAlert, KeyRound, Send, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'register', isMandatory = false }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'register' | 'login' | 'admin'
  
  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin secret login state
  const [adminPassword, setAdminPassword] = useState('');

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+998 ');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regTelegram, setRegTelegram] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password visibility states
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showAdminPwd, setShowAdminPwd] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginIdentifier, loginPassword);
      onClose();
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login('admin', adminPassword.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Maxfiy admin paroli noto\'g\'ri! Faqat administrator ruxsatiga ega.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        avatar_url: regAvatar || undefined,
        telegram_username: regTelegram.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-gray-100 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (only if not strictly mandatory initial welcome) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Welcome Banner */}
        <div className="pt-6 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            BozorUZ ga Xush Kelibsiz!
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            E'lonlarni ko'rish va o'zingiz xohlagan narsani sotuvga qo'yish uchun ro'yxatdan o'ting yoki kiring
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 p-1.5 m-5 mb-0 bg-gray-100 dark:bg-slate-800 rounded-2xl text-[11px] font-bold">
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => { setMode('admin'); setError(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              mode === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: User Registration */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Foydalanuvchi nomi (username) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Masalan: jasur_99"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Email manzil *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jasur@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Telefon raqami (xaridorlar sizga qo'ng'iroq qiladi) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Parol (kamida 6 belgi) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPwd(!showRegPwd)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Telegram username (ixtiyoriy)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500 font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    value={regTelegram}
                    onChange={(e) => setRegTelegram(e.target.value.replace('@', ''))}
                    placeholder="telegram_username"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Xaridorlar Telegram orqali ham murojaat qila oladi</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish va Boshlash'}
              </button>
            </form>
          )}

          {/* TAB 2: User Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-slate-300">
                  Email yoki Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Emailingiz yoki foydalanuvchi nomingiz"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-slate-300">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </button>
            </form>
          )}

          {/* TAB 3: Secret Admin Login */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-300 text-xs">
                🛡️ <strong>Maxsus Administrator Esdaligi:</strong> Bu bo'lim faqat sayt egasi/admin uchun. Maxfiy kodni kiriting.
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-700 dark:text-slate-300">
                  Maxfiy Admin Paroli (Kodi)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPwd ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Maxfiy admin parolini kiriting"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPwd(!showAdminPwd)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showAdminPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Tekshirilmoqda...' : 'Admin sifatida kirish'}
              </button>
            </form>
          )}

          {/* Guest browsing link */}
          {isMandatory && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-center">
              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 underline cursor-pointer"
              >
                Mehmon sifatida ko'rish (keyinroq ro'yxatdan o'tish)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
