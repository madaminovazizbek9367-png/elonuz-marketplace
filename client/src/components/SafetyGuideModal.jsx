import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  PackageCheck, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  PhoneCall, 
  HelpCircle 
} from 'lucide-react';

export default function SafetyGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const safetyRules = [
    {
      icon: <CreditCard className="w-6 h-6 text-rose-500" />,
      title: "Plastik karta va SMS kodini sir saqlang!",
      desc: "Hech kimga, hatto o'zini 'bank xodimi' yoki 'xaridor' deb tanishtirganlarga ham plastik kartangizning amal qilish muddati va telefonga kelgan 6 xonali SMS tasdiqlash kodini aytmang.",
      warning: "Banklar yoki marketplace hech qachon SMS kod so'ramaydi!"
    },
    {
      icon: <PackageCheck className="w-6 h-6 text-amber-500" />,
      title: "Oldindan pul (zakalad) to'lamang!",
      desc: "Mahsulotni shaxsan o'zingiz ko'rib, barcha funksiyalarini tekshirib ko'rmasdan turib oldindan Click, Payme yoki bank orqali pul o'tkazmang.",
      warning: "Shubhali 'arzon' narx va tezda zakalad so'rash — firibgarlik belgisi!"
    },
    {
      icon: <MapPin className="w-6 h-6 text-emerald-500" />,
      title: "Xavfsiz va gavjum joylarda uchrashing",
      desc: "Uchrashuv va tovar almashish uchun metro bekatlari, savdo markazlari yoki ko'cha kabi yorug' va odam gavjum jamoat joylarini tanlang. Tunda begona xilvat joylarga bormang.",
      warning: "Qimmatbaho mulklarni do'st yoki yaqiningiz bilan birga ko'ring."
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-500" />,
      title: "Soxta havolalar (Fiting) ga kirmang",
      desc: "Telegram yoki SMS orqali 'Tovarni yetkazib berish uchun to'lov qiling' deb jo'natilgan begona havolalarga (masalan: click-uz-pay.xyz kabi soxta saytlarga) karta ma'lumotlaringizni kiritmang.",
      warning: "Barcha to'lovlarni faqat rasmiy ilovalar orqali bajaring."
    },
    {
      icon: <PhoneCall className="w-6 h-6 text-teal-500" />,
      title: "Sotuvchi va xaridor profilini tekshiring",
      desc: "Saytimizdagi ko'k tasdiqlangan belgi (✅ Verified) va boshqa xaridorlar qoldirgan yulduzli sharhlar/reytinglarga e'tibor qarating.",
      warning: "Yangi ochilgan va shubhali akkauntlar bilan ehtiyotkor bo'ling."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Xavfsiz Savdo Qoidalari</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Firibgarlardan himoyalanish va xavfsiz xarid qilish bo'yicha muhim eslatmalar
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Eslatma:</strong> E'lonUZ platformasi orqali savdo qilayotganda ushbu oddiy 5 ta qoidaga amal qilsangiz, mablag'ingiz va asablaringiz 100% xavfsiz bo'ladi.
            </p>
          </div>

          <div className="space-y-3.5">
            {safetyRules.map((rule, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-2xs shrink-0">
                  {rule.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>{idx + 1}.</span>
                    <span>{rule.title}</span>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                    {rule.desc}
                  </p>
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{rule.warning}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Tushundim, rahmat!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
