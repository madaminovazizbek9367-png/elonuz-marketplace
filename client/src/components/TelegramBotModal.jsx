import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Bell, 
  CheckCircle, 
  Sparkles, 
  Smartphone, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  Layers, 
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TelegramBotModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'simulator' | 'code'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Assalomu alaykum! E'lonUZ rasmiy Telegram botiga xush kelibsiz.\n\nUshbu bot orqali saytdagi yangi xabarlar, e'lonlaringizga sharhlar va savdolashish takliflaridan darhol xabardor bo'lasiz.\n\nBuyruqlar:\n/start - Botni ishga tushirish\n/elonlar - Sizning faol e'lonlaringiz\n/statistika - Ko'rishlar va qiziqishlar soni\n/qidiruv - Mahsulotlarni qidirish",
      time: '12:00'
    }
  ]);
  const [inputCmd, setInputCmd] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [tgConnected, setTgConnected] = useState(Boolean(user?.telegram_username));

  const [savedBotUsername, setSavedBotUsername] = useState(() => localStorage.getItem('elonuz_tg_bot_username') || 'ElonUz_Bozor_Bot');
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(savedBotUsername);

  if (!isOpen) return null;

  const botUsername = savedBotUsername.replace('@', '');
  const connectCode = user ? `ELON-${user.id.toString().slice(-4)}` : "ELON-7788";

  const handleSaveBotUsername = (e) => {
    e.preventDefault();
    const clean = tempUsername.trim().replace('@', '');
    if (clean) {
      setSavedBotUsername(clean);
      localStorage.setItem('elonuz_tg_bot_username', clean);
      setEditingUsername(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`/connect ${connectCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputCmd('');
    setIsBotTyping(true);

    setTimeout(() => {
      let botReply = '';
      const lower = cmd.toLowerCase();

      if (lower.startsWith('/start')) {
        botReply = `🌟 E'lonUZ Botiga xush kelibsiz!\nSizning hisobingiz: ${user ? user.username : 'Mehmon'}\n\nBog'lanish uchun /connect ${connectCode} buyrug'ini yuboring.`;
      } else if (lower.startsWith('/connect')) {
        botReply = `✅ TABRIKLAYMIZ! Hisobingiz (${user ? user.username : 'Sotuvchi'}) muvaffaqiyatli ulandi!\nEndi saytdagi barcha xabarlar va sharhlar Telegramingizga keladi.`;
        setTgConnected(true);
      } else if (lower.startsWith('/elonlar')) {
        botReply = `📋 Sizning e'lonlaringiz:\n1. iPhone 15 Pro Max - 12,850,000 UZS (👁️ 142 ko'rish)\n2. Chevrolet Cobalt 2024 - 135,000,000 UZS (👁️ 890 ko'rish)\n\nBarcha e'lonlar faol holatda!`;
      } else if (lower.startsWith('/statistika')) {
        botReply = `📊 Barcha e'lonlaringiz statistikasi:\n👁️ Ko'rishlar: 1,032 ta\n❤️ Sevimlilar: 48 ta\n💬 Suhbatlar: 14 ta\n⭐ Reyting: 5.0 (18 ta sharh)`;
      } else if (lower.startsWith('/qidiruv')) {
        botReply = `🔍 Qidiruv natijalari:\nTopilgan e'lonlar: 12 ta eng yangi taklif.\nBatafsil ko'rish uchun saytga kiring: https://elonuz-bozor.surge.sh`;
      } else {
        botReply = `🤖 Bot buyrug'i qabul qilindi: "${cmd}"\n\nYordam uchun quyidagi buyruqlarni yuboring:\n/start, /connect, /elonlar, /statistika, /qidiruv`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsBotTyping(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 w-full max-w-4xl h-[88vh] max-h-[750px] rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white p-5 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  E'lonUZ Telegram Bot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 uppercase tracking-wide">
                  24/7 Avtomatlashtirilgan
                </span>
              </div>
              <p className="text-xs text-sky-100">
                E'lonlar, yangi xabarlar va savdoni Telegramingiz orqali boshqaring
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-850 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Botga ulanish</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Bot Simulyatori (Jonli sinov)</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Imkoniyatlar</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-950/60">
          
          {/* TAB 1: Connect to Bot */}
          {activeTab === 'connect' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Connection Status Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/30 dark:border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30">
                    <Send className="w-6 h-6 ml-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        Telegram Bot: @{botUsername}
                      </h3>
                      <button
                        onClick={() => setEditingUsername(!editingUsername)}
                        className="text-[11px] text-sky-500 hover:underline font-semibold cursor-pointer"
                      >
                        {editingUsername ? "Bekor qilish" : "O'zgartirish"}
                      </button>
                    </div>
                    {editingUsername ? (
                      <form onSubmit={handleSaveBotUsername} className="flex gap-2 mt-1.5">
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          placeholder="bot_username"
                          className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-xl border border-sky-400 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 text-xs bg-sky-500 text-white font-bold rounded-xl"
                        >
                          Saqlash
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Holat: {tgConnected ? (
                          <span className="text-emerald-600 font-bold">🟢 Ulangan ({user?.telegram_username || '@Mdmnv_77'})</span>
                        ) : (
                          <span className="text-amber-500 font-bold">🟡 Ulanmagan</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Telegramda ochish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Step Guide */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Hisobingizni botga ulash uchun 3 ta oddiy qadam:
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-200">Telegramda botni toping va ishga tushiring</p>
                      <p className="text-gray-500 dark:text-slate-400 mt-0.5">
                        Telegram qidiruvidan <strong className="text-sky-500">@{botUsername}</strong> yoki administrator <strong className="text-sky-500">@Mdmnv_77</strong> ga kiring va <code>/start</code> yozing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-slate-200">Shaxsiy ulash kodini nusxalang</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <code className="px-3 py-1.5 bg-gray-200 dark:bg-slate-950 rounded-xl font-mono text-sky-600 dark:text-sky-400 font-bold text-xs select-all">
                          /connect {connectCode}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-200">Kodni botga yuboring</p>
                      <p className="text-gray-500 dark:text-slate-400 mt-0.5">
                        Kodni botga yuborganingizdan so'ng, saytdagi hisobingiz avtomatik ravishda tasdiqlanadi va jonli bildirishnomalar faollashadi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Commands Reference */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                  Asosiy Bot Buyruqlari:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                    <code className="font-bold text-sky-500">/start</code>
                    <span className="text-gray-500 dark:text-slate-400">Botni qayta ishga tushirish</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                    <code className="font-bold text-sky-500">/elonlar</code>
                    <span className="text-gray-500 dark:text-slate-400">E'lonlaringiz ro'yxati</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                    <code className="font-bold text-sky-500">/statistika</code>
                    <span className="text-gray-500 dark:text-slate-400">Ko'rishlar va reyting</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                    <code className="font-bold text-sky-500">/qidiruv [nom]</code>
                    <span className="text-gray-500 dark:text-slate-400">Mahsulotlarni qidirish</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Interactive Telegram Simulator */}
          {activeTab === 'simulator' && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col h-[520px]">
              
              {/* Simulator Header */}
              <div className="bg-slate-800 text-white p-3.5 px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    E'lonUZ Rasmiy Bot
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                  </h4>
                  <p className="text-[11px] text-slate-300">bot • botfather tasdiqlagan</p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#38bdf8_0.5px,transparent_0.5px)] [background-size:12px_12px] bg-slate-100 dark:bg-slate-950/80">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs whitespace-pre-line shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-sky-500 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200/80 dark:border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                      <span className={`block text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-sky-100' : 'text-gray-400'
                      }`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-xs w-20 border border-gray-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Fast action pills */}
              <div className="p-2 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setInputCmd('/start')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-sky-500 transition-colors shrink-0 cursor-pointer"
                >
                  /start
                </button>
                <button
                  type="button"
                  onClick={() => setInputCmd(`/connect ${connectCode}`)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-sky-500 transition-colors shrink-0 cursor-pointer"
                >
                  /connect
                </button>
                <button
                  type="button"
                  onClick={() => setInputCmd('/elonlar')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-sky-500 transition-colors shrink-0 cursor-pointer"
                >
                  /elonlar
                </button>
                <button
                  type="button"
                  onClick={() => setInputCmd('/statistika')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-sky-500 transition-colors shrink-0 cursor-pointer"
                >
                  /statistika
                </button>
              </div>

              {/* Input bar */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inputCmd}
                  onChange={(e) => setInputCmd(e.target.value)}
                  placeholder="Buyruq yozing (masalan: /statistika)..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  disabled={!inputCmd.trim()}
                  className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Features description */}
          {activeTab === 'features' && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Tezkor Bildirishnomalar</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Saytga kirmagan bo'lsangiz ham, xaridor xabar yozishi bilanoq Telegramingizga to'g'ridan-to'g'ri xabarnoma boradi.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Avtomatik Kanalga Joylash</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Har bir VIP va Shoshilinch e'lon saytdan @{channelUsername} kanaliga chiroyli formatda va rasmlari bilan avtomat joylanadi.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Telegram orqali Savdolashish</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Xaridor bergan narx taklifini Telegramdagi tugma orqali "Qabul qilish" yoki "Rad etish" mumkin.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Xavfsiz va Tasdiqlangan</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Telegramingiz ulangan profillarda "Tasdiqlangan sotuvchi" ko'k belgisi chiqadi, bu xaridorlarda ishonchni 3 barobar oshiradi.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
