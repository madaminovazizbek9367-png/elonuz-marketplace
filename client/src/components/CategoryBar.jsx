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
import { useLanguage } from '../context/LanguageContext';

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

const CATEGORY_NAMES_I18N = {
  1: { uz: "Ko'chmas mulk", ru: "Недвижимость", en: "Real Estate" },
  2: { uz: "Transport", ru: "Транспорт", en: "Vehicles" },
  3: { uz: "Telefonlar", ru: "Телефоны", en: "Phones" },
  4: { uz: "Kompyuterlar", ru: "Компьютеры", en: "Computers" },
  5: { uz: "Maishiy texnika", ru: "Бытовая техника", en: "Appliances" },
  6: { uz: "Mebel", ru: "Мебель", en: "Furniture" },
  7: { uz: "Kiyim-kechak", ru: "Одежда и обувь", en: "Clothing" },
  8: { uz: "Sport va xobbi", ru: "Спорт и хобби", en: "Sports & Hobbies" },
  9: { uz: "Bolalar dunyosi", ru: "Детский мир", en: "Kids World" },
  10: { uz: "Uy hayvonlari", ru: "Животные", en: "Pets" },
  11: { uz: "Qishloq xo'jaligi", ru: "Сельское хозяйство", en: "Agriculture" },
  12: { uz: "Xizmatlar", ru: "Услуги", en: "Services" },
  13: { uz: "Ish o'rinlari", ru: "Работа", en: "Jobs" }
};

export default function CategoryBar({ categories = [], selectedCategory, onSelectCategory }) {
  const { lang, t } = useLanguage();

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
            <span>{t('allCategories')}</span>
          </button>

          {/* Individual categories */}
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Package;
            const isSelected = selectedCategory === cat.id;
            const catName = CATEGORY_NAMES_I18N[cat.id]?.[lang] || cat.name;

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
                <span>{catName}</span>
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
