import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, CheckCircle2, TrendingDown, RefreshCcw, Handshake } from 'lucide-react';

export default function BargainBotModal({ isOpen, onClose, product, onApplyAgreedPrice }) {
  if (!isOpen || !product) return null;

  const currentPrice = Number(product.price) || 0;
  const currency = product.currency || 'UZS';

  const [offerPrice, setOfferPrice] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Assalomu alaykum! Men "${product.title}" sotuvchisining AI yordamchisiman. Mahsulotimiz narxi hozirda ${currentPrice.toLocaleString()} ${currency}. Qancha narxga olmoqchisiz? Bemalol savdolashing!`
    }
  ]);
  const [dealAgreed, setDealAgreed] = useState(false);
  const [agreedAmount, setAgreedAmount] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleMakeOffer = (e) => {
    e?.preventDefault();
    const offered = Number(offerPrice);
    if (!offered || offered <= 0) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: `Mening taklifim: ${offered.toLocaleString()} ${currency}`
    };
    setMessages(prev => [...prev, userMsg]);
    setOfferPrice('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const ratio = offered / currentPrice;

      if (ratio >= 0.92) {
        // Accept immediately
        setDealAgreed(true);
        setAgreedAmount(offered);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `🎉 Ajoyib! Barakasini bersin! Siz aytgan ${offered.toLocaleString()} ${currency} narxiga kelishdik! Rasmiy savdo chekini shakllantirishingiz va sotuvchi bilan bog'lanishingiz mumkin.`,
            isDeal: true
          }
        ]);
      } else if (ratio >= 0.75) {
        // Counter-offer
        const counter = Math.round((currentPrice + offered) / 2);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Taklifingiz uchun rahmat! Lekin ${offered.toLocaleString()} ${currency} biroz kamlik qiladi. Keling, ikkalamizga ham ma'qul bo'lishi uchun ${counter.toLocaleString()} ${currency} ga kelishamiz, nima deysiz?`
          }
        ]);
      } else if (ratio >= 0.50) {
        // Low offer
        const counter = Math.round(currentPrice * 0.88);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Aka, bu narx juda past bo'lib ketdi. Mahsulotimiz holati a'lo darajada. Eng kami ${counter.toLocaleString()} ${currency} qilib berishim mumkin. Qani yana ozgina ko'taring!`
          }
        ]);
      } else {
        // Unrealistic offer
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Bunday arzon narxga imkonsiz! Hatto tannarxiga ham to'g'ri kelmaydi. Haqiqiy va munosib taklif bildiring.`
          }
        ]);
      }
    }, 900);
  };

  const handleQuickPercent = (pct) => {
    const discounted = Math.round(currentPrice * (1 - pct / 100));
    setOfferPrice(String(discounted));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-wide">AI Savdolashish Bot</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                  Jonli Savdo
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 truncate max-w-xs">{product.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product preview ribbon */}
        <div className="p-3 bg-emerald-50/70 dark:bg-slate-800/80 border-b border-emerald-100/80 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={product.primary_image}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20"
            />
            <div>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold block">
                Boshlang'ich narxi:
              </span>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {currentPrice.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {dealAgreed && (
            <div className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kelishildi: {agreedAmount?.toLocaleString()} {currency}</span>
            </div>
          )}
        </div>

        {/* Chat message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] max-h-[360px] bg-gray-50/50 dark:bg-slate-950/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : m.isDeal
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-bl-xs font-medium'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200/80 dark:border-slate-700 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 italic px-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>AI sotuvchi o'ylanmoqda...</span>
            </div>
          )}
        </div>

        {/* Quick discount buttons */}
        {!dealAgreed && (
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
            <span className="text-gray-400 shrink-0">Tezkor taklif:</span>
            {[5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-gray-700 dark:text-slate-300 hover:text-emerald-600 border border-gray-200 dark:border-slate-700 cursor-pointer shrink-0 transition-colors"
              >
                -{pct}% ({Math.round(currentPrice * (1 - pct / 100)).toLocaleString()})
              </button>
            ))}
          </div>
        )}

        {/* Input box / Apply deal button */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          {dealAgreed ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (agreedAmount) onApplyAgreedPrice?.(agreedAmount);
                  onClose();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Handshake className="w-4 h-4" />
                <span>Ushbu kelishilgan narxni qabul qilish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDealAgreed(false);
                  setAgreedAmount(null);
                  setMessages(prev => [
                    ...prev,
                    { id: Date.now(), sender: 'bot', text: 'Savdoni yangitdan boshlaymiz. Qancha taklif qilasiz?' }
                  ]);
                }}
                className="px-3.5 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer"
                title="Qayta savdolashish"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleMakeOffer} className="flex gap-2">
              <input
                type="number"
                min="1"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder={`Taklif narxini kiriting (${currency})...`}
                className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!offerPrice || isTyping}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yuborish</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
