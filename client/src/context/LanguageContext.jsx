import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  uz: {
    searchPlaceholder: "Mahsulotlar, mashinalar, telefonlar, uylar qidirish...",
    categories: "Kategoriyalar",
    postAd: "E'lon berish",
    favorites: "Sevimlilar",
    messages: "Xabarlar",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    admin: "Admin",
    allRegions: "Barcha viloyatlar",
    safety: "Xavfsizlik",
    compare: "Taqqoslash",
    currency: "Valyuta",
    delivery: "Yetkazib berish",
    bargain: "AI bilan savdolashish",
    receipt: "Xarid cheki",
    priceAnalytics: "Bozor analitikasi",
    filterTitle: "Filtrlar",
    resetFilters: "Filtrlarni tozalash",
    priceAsc: "Avval arzonlari",
    priceDesc: "Avval qimmatlari",
    viewsDesc: "Eng ommabop",
    newest: "Eng yangilari",
    conditionNew: "Yangi",
    conditionUsed: "Ishlatilgan",
    allConditions: "Barchasi",
    deviceSwitcher: "Qurilma rejimi",
    desktop: "Kompyuter",
    tablet: "Planshet",
    mobile: "Telefon",
    rotate: "Aylantirish",
    voiceSearchListening: "🎙️ Tinglanmoqda... Mahsulot nomini ayting",
    voiceSearchPrompt: "Ovozli qidiruv",
    fairPrice: "Adolatli bozor narxi",
    goodDeal: "Bozor narxidan arzon",
    vipBadge: "VIP E'LON",
    urgentBadge: "SHOSHILINCH",
  },
  ru: {
    searchPlaceholder: "Поиск товаров, авто, телефонов, квартир...",
    categories: "Категории",
    postAd: "Подать объявление",
    favorites: "Избранное",
    messages: "Сообщения",
    login: "Вход",
    register: "Регистрация",
    admin: "Админ",
    allRegions: "Все регионы",
    safety: "Безопасность",
    compare: "Сравнение",
    currency: "Валюта",
    delivery: "Доставка",
    bargain: "Торговаться с ИИ",
    receipt: "Товарный чек",
    priceAnalytics: "Аналитика цен",
    filterTitle: "Фильтры",
    resetFilters: "Сбросить фильтры",
    priceAsc: "Сначала дешевые",
    priceDesc: "Сначала дорогие",
    viewsDesc: "Популярные",
    newest: "Сначала новые",
    conditionNew: "Новый",
    conditionUsed: "Б/у",
    allConditions: "Все",
    deviceSwitcher: "Режим устройства",
    desktop: "Компьютер",
    tablet: "Планшет",
    mobile: "Телефон",
    rotate: "Повернуть",
    voiceSearchListening: "🎙️ Слушаю... Назовите товар",
    voiceSearchPrompt: "Голосовой поиск",
    fairPrice: "Справедливая рыночная цена",
    goodDeal: "Выгодная цена ниже рынка",
    vipBadge: "VIP ОБЪЯВЛЕНИЕ",
    urgentBadge: "СРОЧНО",
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('marketplace_lang') || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('marketplace_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'uz' ? 'ru' : 'uz');
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['uz']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
