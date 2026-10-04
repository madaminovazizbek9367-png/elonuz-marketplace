import React, { useState } from 'react';
import { X, ArrowRightLeft, DollarSign, TrendingUp, RefreshCw, Calculator } from 'lucide-react';

export default function CurrencyConverterModal({ isOpen, onClose }) {
  const [rate, setRate] = useState(12850);
  const [usdAmount, setUsdAmount] = useState('100');
  const [uzsAmount, setUzsAmount] = useState((100 * 12850).toString());

  if (!isOpen) return null;

  const handleUsdChange = (val) => {
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setUzsAmount(Math.round(num * rate).toString());
    } else {
      setUzsAmount('');
    }
  };

  const handleUzsChange = (val) => {
    setUzsAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && rate > 0) {
      setUsdAmount((num / rate).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-gray-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Valyuta Konvertori</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Markaziy Bank kursi: 1 USD = {new Intl.NumberFormat('uz-UZ').format(rate)} so'm
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* USD input */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>AQSH Dollari (USD $)</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Valyuta</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-black text-emerald-600">$</span>
              <input
                type="number"
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="100"
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-base font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Swap icon */}
          <div className="flex justify-center -my-2">
            <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              <ArrowRightLeft className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* UZS input */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>O'zbekiston So'mi (UZS so'm)</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Milliy valyuta</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={uzsAmount}
                onChange={(e) => handleUzsChange(e.target.value)}
                placeholder="1 285 000"
                className="w-full pl-4 pr-16 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-base font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center font-bold text-xs text-gray-400">so'm</span>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="block text-xs font-semibold text-gray-500 mb-2">Tezkor hisoblash:</span>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {[50, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUsdChange(val.toString())}
                  className="py-2 bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
