import React from 'react';
import { TrendingDown, CheckCircle, Flame } from 'lucide-react';

export default function PriceAnalyticsBadge({ price, oldPrice, isCompact = false }) {
  const current = Number(price) || 0;
  const old = Number(oldPrice) || 0;

  // If old_price is provided, calculate actual discount
  if (old > current) {
    const pct = Math.round(((old - current) / old) * 100);
    return (
      <div className={`inline-flex items-center gap-1 font-bold rounded-lg ${
        isCompact
          ? 'px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60'
          : 'px-2.5 py-1 text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
      }`}>
        <Flame className="w-3 h-3 text-rose-600 fill-current shrink-0 animate-pulse" />
        <span>Bozor narxidan {pct}% arzon</span>
      </div>
    );
  }

  // Fair market price indicator
  return (
    <div className={`inline-flex items-center gap-1 font-medium rounded-lg ${
      isCompact
        ? 'px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60'
        : 'px-2.5 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
    }`}>
      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
      <span>Adolatli bozor narxi</span>
    </div>
  );
}
