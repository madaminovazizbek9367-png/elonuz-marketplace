import React from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DeviceSimulatorToolbar({
  deviceMode,
  setDeviceMode,
  isLandscape,
  setIsLandscape,
  scale,
  setScale
}) {
  const { t } = useLanguage();

  return (
    <header 
      role="banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-1 pr-2 border-r border-slate-700/80">
        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('deviceSwitcher')}
        </span>
      </div>

      {/* Device Buttons */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
        <button
          type="button"
          onClick={() => setDeviceMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'desktop'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Kompyuter (100% To'liq ekran)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('desktop')}</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('tablet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'tablet'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Planshet (iPad Pro 768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('tablet')}</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'mobile'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Telefon (iPhone 390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('mobile')}</span>
        </button>
      </div>

      {/* Rotate & Zoom for Mobile/Tablet */}
      {deviceMode !== 'desktop' && (
        <div className="flex items-center gap-1 pl-2 border-l border-slate-700/80">
          <button
            type="button"
            onClick={() => setIsLandscape(!isLandscape)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLandscape
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Aylantirish (Vertikal / Gorizontal)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out / In */}
          <button
            type="button"
            onClick={() => setScale(prev => Math.max(0.6, prev - 0.1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
            title="Kichraytirish"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono text-slate-400 px-1">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setScale(prev => Math.min(1.2, prev + 0.1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
            title="Kattalashtirish"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDeviceMode('desktop');
              setIsLandscape(false);
              setScale(0.9);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 text-xs cursor-pointer ml-1"
            title="Oddiy rejimga qaytish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
