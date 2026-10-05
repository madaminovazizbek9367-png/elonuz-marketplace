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
    <div className="w-full bg-slate-900 border-b border-slate-800 text-white px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 text-xs shadow-sm">
      {/* Left Label */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest hidden sm:inline">
          {t('deviceSwitcher')}
        </span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Saytni turli qurilmalarda sinab ko'rish:
        </span>
      </div>

      {/* Device Mode Switcher Buttons */}
      <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => setDeviceMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'desktop'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Kompyuter (To'liq ekran)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{t('desktop')}</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('tablet')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'tablet'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Planshet (iPad)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>{t('tablet')}</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            deviceMode === 'mobile'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Telefon (iPhone)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t('mobile')}</span>
        </button>
      </div>

      {/* Extra controls when tablet/mobile mode is active */}
      {deviceMode !== 'desktop' ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLandscape(!isLandscape)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isLandscape
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Aylantirish (Vertikal / Gorizontal)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isLandscape ? 'Gorizontal' : 'Vertikal'}</span>
          </button>

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.05))}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 text-xs cursor-pointer"
            title="Kichraytirish"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale(prev => Math.min(1.2, prev + 0.05))}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 text-xs cursor-pointer"
            title="Kattalashtirish"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDeviceMode('desktop');
              setIsLandscape(false);
              setScale(0.85);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold cursor-pointer ml-1"
            title="Kompyuter rejimiga qaytish"
          >
            <X className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span>⚡ Har qanday ekran o'lchamiga mos</span>
          <span>•</span>
          <a href="https://t.me/Mdmnv_77" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            Telegram: @Mdmnv_77
          </a>
        </div>
      )}
    </div>
  );
}
