import React, { useState } from 'react';
import { X, Truck, Package, Clock, ShieldCheck, MapPin, Calculator, CheckCircle2 } from 'lucide-react';

const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Farg\'ona',
  'Andijon',
  'Namangan',
  'Buxoro',
  'Qashqadaryo',
  'Surxondaryo',
  'Xorazm',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  'Qoraqalpog\'iston'
];

export default function DeliveryCalcModal({ isOpen, onClose, productOrigin = 'Toshkent' }) {
  if (!isOpen) return null;

  const [destination, setDestination] = useState('Samarqand');
  const [weightKg, setWeightKg] = useState(2);
  const [selectedService, setSelectedService] = useState('bts');

  // Realistic shipping rate calculation
  const isSameRegion = destination.toLowerCase().includes(productOrigin.toLowerCase());
  const baseRate = isSameRegion ? 18000 : 32000;
  const weightExtra = Math.max(0, weightKg - 1) * 6000;

  const services = [
    {
      id: 'express',
      name: 'E\'lonUZ Tezkor Kuryer',
      time: isSameRegion ? 'Bugun (3-5 soat)' : '24 soat ichida (Eshikkacha)',
      cost: baseRate + weightExtra + 20000,
      icon: Truck,
      badge: 'Eng tezkor'
    },
    {
      id: 'bts',
      name: 'BTS / Fargo Express Pochta',
      time: isSameRegion ? 'Ertagayoq' : '1-2 ish kuni',
      cost: baseRate + weightExtra,
      icon: Package,
      badge: 'Eng ommabop'
    },
    {
      id: 'taxi',
      name: 'Viloyatlararo Yo\'lovchi / Taksi',
      time: 'Shu kunning o\'zida (Vokzal/Pochta)',
      cost: baseRate + weightExtra + 10000,
      icon: Clock,
      badge: 'Qulay narx'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide">Viloyatlararo Yetkazib Berish</h3>
              <p className="text-[11px] text-blue-100/90">Xavfsiz kuryerlik va pochta tariflari kalkulyatori</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Route selector */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Jo'natuvchi (Sotuvchi):</span>
              <p className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{productOrigin}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Qabul qiluvchi viloyat:</span>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full font-bold text-blue-700 dark:text-blue-400 bg-transparent focus:outline-none cursor-pointer text-xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="text-gray-900 bg-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-700 dark:text-slate-300">Taxminiy og'irligi:</span>
              <span className="text-blue-600 dark:text-blue-400">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="30"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0.5 kg (hujjat, telefon)</span>
              <span>10 kg (maishiy texnika)</span>
              <span>30 kg</span>
            </div>
          </div>

          {/* Service options */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
              Mavjud yetkazib berish xizmatlari:
            </span>

            {services.map((svc) => {
              const Icon = svc.icon;
              const isSelected = selectedService === svc.id;

              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{svc.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {svc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">{svc.time}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {svc.cost.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safe delivery guarantee guarantee banner */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-tight">
              <strong>100% Sug'urtalangan:</strong> Jo'natma shikastlansa yoki yo'qolsa, to'liq qiymati qoplab beriladi.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
          >
            Tushunarli, saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
