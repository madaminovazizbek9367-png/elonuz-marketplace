import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, QrCode, CheckCircle2, FileText, Download } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, product, agreedPrice = null, currentUser = null }) {
  if (!isOpen || !product) return null;

  const invoiceNo = `UZ-${new Date().getFullYear()}-${String(product.id).slice(-5)}`;
  const finalPrice = agreedPrice || product.price;
  const currency = product.currency || 'UZS';
  const currentDate = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in print:p-0 print:bg-white print:static">
      <div 
        className="bg-white text-gray-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative border border-gray-200 print:border-none print:shadow-none print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Rasmiy Xarid Kvitansiyasi / Chek</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Invoice Paper */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-gray-800 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-5 border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-700">E'lon<span className="text-gray-900">UZ</span></span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Rasmiy Chek
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">O'zbekistonning Yetakchi Xavfsiz Savdo Bozor Platformasi</p>
              <p className="text-[11px] text-gray-400">Veb-sayt: elonuz-bozor.surge.sh</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-gray-400 block uppercase">Hujjat raqami:</span>
              <span className="text-sm font-mono font-black text-gray-900">{invoiceNo}</span>
              <span className="text-[11px] text-gray-500 block mt-1">{currentDate}</span>
            </div>
          </div>

          {/* Product details */}
          <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <img
              src={product.primary_image}
              alt=""
              className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Tanlangan Mahsulot
              </span>
              <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">{product.title}</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <div>Holati: <strong className="text-gray-800">{product.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}</strong></div>
                <div>Joylashuv: <strong className="text-gray-800">{product.location || 'Toshkent'}</strong></div>
              </div>
            </div>
          </div>

          {/* Price & Summary Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase">
                <th className="py-2 text-left">Tavsif</th>
                <th className="py-2 text-center">Kafolat</th>
                <th className="py-2 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 font-semibold text-gray-900">{product.title}</td>
                <td className="py-3 text-center text-emerald-700 font-bold">100% Xavfsiz Savdo</td>
                <td className="py-3 text-right font-black text-sm text-gray-900">
                  {Number(finalPrice).toLocaleString()} {currency}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900 font-black text-sm">
                <td colSpan="2" className="pt-3 text-right text-gray-700">JAMI TO'LOV:</td>
                <td className="pt-3 text-right text-emerald-700 text-base">
                  {Number(finalPrice).toLocaleString()} {currency}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Parties: Seller & Buyer */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Sotuvchi ma'lumotlari:</span>
              <p className="font-bold text-gray-900 flex items-center gap-1">
                {product.seller_username || 'Foydalanuvchi'}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </p>
              <p className="text-gray-600">{product.seller_phone || '+998 90 123 45 67'}</p>
              {product.seller_telegram && (
                <p className="text-sky-600 font-semibold">@{product.seller_telegram}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Xaridor (Buyurtmachi):</span>
              <p className="font-bold text-gray-900">{currentUser?.username || 'E\'lonUZ Xaridori'}</p>
              <p className="text-gray-600">{currentUser?.phone || '+998 ** *** ** **'}</p>
              <p className="text-emerald-600 font-semibold">Holat: Tasdiqlangan kelishuv</p>
            </div>
          </div>

          {/* Stamp & QR & Legal Verification */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <QrCode className="w-10 h-10 text-gray-800" />
              </div>
              <div className="text-[10px] text-gray-500 leading-tight">
                <p className="font-bold text-gray-700">Elektron Haqiqiylik Kodu</p>
                <p>Ushbu hujjat E'lonUZ platformasi orqali shakllantirilgan va himoyalangan.</p>
              </div>
            </div>

            {/* Simulated Official Seal Stamp */}
            <div className="relative border-4 border-double border-emerald-700 rounded-full w-24 h-24 flex flex-col items-center justify-center text-emerald-700 rotate-[-12deg] p-1 text-center shrink-0">
              <span className="text-[7px] font-black uppercase tracking-wider">E'LONUZ BOZOR</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-700 my-0.5" />
              <span className="text-[6px] font-black uppercase tracking-tighter">TASDIQLANGAN SAVDO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
