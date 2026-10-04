import React from 'react';
import { 
  Home, 
  Car, 
  Smartphone, 
  Laptop, 
  Tv, 
  Armchair, 
  Shirt, 
  Headphones, 
  Package,
  Layers,
  PawPrint,
  Wheat,
  Wrench,
  Briefcase
} from 'lucide-react';

const iconMap = {
  Home,
  Car,
  Smartphone,
  Laptop,
  Tv,
  Armchair,
  Shirt,
  Headphones,
  Package,
  PawPrint,
  Wheat,
  Wrench,
  Briefcase
};

export default function CategoryBar({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {/* All categories button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCategory === null
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${selectedCategory === null ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-700'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <span>Barchasi</span>
          </button>

          {/* Individual categories */}
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Package;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400'}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span>{cat.name}</span>
                {cat.product_count !== undefined && cat.product_count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                  }`}>
                    {cat.product_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
