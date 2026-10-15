import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  uz: {
    // Brand & header
    brandName: "E'lonUZ",
    brandSubtitle: "E'lonlar sayti",
    searchPlaceholder: "Mahsulotlar, mashinalar, telefonlar, uylar qidirish...",
    searchBtn: "Qidirish",
    allRegions: "Barcha viloyatlar",
    voiceSearchListening: "🎙️ Tinglanmoqda... Mahsulot nomini ayting",
    voiceSearchPrompt: "Ovozli qidiruv",
    
    // Quick tools & navbar
    categories: "Kategoriyalar",
    postAd: "E'lon berish",
    favorites: "Sevimlilar",
    messages: "Xabarlar",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    authButton: "Ro'yxatdan o'tish / Kirish",
    admin: "Admin",
    safety: "Xavfsizlik",
    compare: "Taqqoslash",
    currency: "Valyuta",
    delivery: "Yetkazib berish",
    bargain: "AI bilan savdolashish",
    receipt: "Xarid cheki",
    priceAnalytics: "Bozor analitikasi",
    sellerStats: "Sotuvchi Statistikasi",
    tgBot: "Telegram Bot",
    myProfile: "Mening profilim",
    myListings: "Mening e'lonlarim",
    adminPanel: "Admin Boshqaruv Paneli",
    logout: "Chiqish",
    allCategories: "Barchasi",
    
    // Hero banner
    heroBadge: "O'zbekistondagi eng erkin va qulay e'lonlar platformasi",
    heroTitle: "Xohlagan narsangizni soting va xarid qiling!",
    heroDesc: "Telefon, mashina, kvartira, kompyuter yoki kiyim-kechak. Kamida 3 ta sifatli rasm joylang va sotuvni boshlang.",
    heroPostBtn: "+ E'lon joylashtirish (3 ta rasm bilan)",
    
    // Filters & Sorting
    adsFound: "ta e'lon topildi",
    filterTitle: "Filtrlar",
    resetFilters: "Tozalash",
    mapView: "Xarita",
    statsView: "Statistika",
    vipBadge: "VIP",
    urgentBadge: "Shoshilinch",
    videoBadge: "Videoli",
    allConditions: "Barcha holat",
    conditionNew: "Yangi",
    conditionUsed: "Ishlatilgan",
    sortNewest: "Eng yangilari",
    sortPriceAsc: "Avval arzonlari",
    sortPriceDesc: "Avval qimmatlari",
    sortViewsDesc: "Eng ommabop",
    priceFrom: "Narx: dan",
    priceTo: "gacha",
    noAdsFound: "Hech qanday e'lon topilmadi",
    noAdsFoundDesc: "Qidiruv parametrlarini o'zgartirib ko'ring yoki barcha e'lonlarni ko'ring",
    viewAllAds: "Barcha e'lonlarni ko'rish",
    
    // Product details & cards
    som: "so'm",
    views: "ko'rishlar",
    callSeller: "Qo'ng'iroq qilish",
    showPhone: "Raqamni ko'rsatish",
    chatWithSeller: "Sotuvchi bilan yozishish",
    bargainWithAi: "AI bilan savdolashish",
    buyReceipt: "Chek chiqarish",
    deliveryCalc: "Yetkazib berish narxini hisoblash",
    description: "Tavsif",
    sellerInfo: "Sotuvchi haqida",
    memberSince: "A'zo bo'lgan sanasi",
    verifiedSeller: "Tasdiqlangan sotuvchi",
    location: "Joylashuv",
    date: "Sana",
    condition: "Holati",
    category: "Kategoriya",
    reviews: "Sharhlar",
    writeReview: "Sharh yozish",
    leaveReview: "Sotuvchiga baho va sharh qoldirish",
    similarAds: "O'xshash e'lonlar",
    share: "Ulashish",
    linkCopied: "Havola nusxalandi!",
    safetyTips: "Xavfsizlik eslatmalari: oldindan to'lov qilmang, shaxsiy uchrashuvda tekshiring.",
    editAd: "E'lonni tahrirlash",
    deleteAd: "E'lonni o'chirish",
    confirmDelete: "Haqiqatan ham ushbu e'lonni o'chirmoqchimisiz?",
    
    // Auth modal
    loginTitle: "Tizimga kirish",
    registerTitle: "Yangi hisob ochish",
    adminLoginTitle: "Administrator kirishi",
    username: "Foydalanuvchi nomi",
    email: "Email manzil",
    password: "Parol",
    phone: "Telefon raqam",
    telegramUsername: "Telegram username (masalan @Mdmnv_77)",
    haveAccount: "Hisobingiz bormi? Kirish",
    noAccount: "Hisobingiz yo'qmi? Ro'yxatdan o'tish",
    adminLoginLink: "Maxfiy admin paneli orqali kirish",
    userLoginLink: "Oddiy foydalanuvchi sifatida kirish",
    loggingIn: "Kirilmoqda...",
    registering: "Ro'yxatdan o'tilmoqda...",
    
    // Create/Edit product
    createAdTitle: "Yangi e'lon joylashtirish",
    editAdTitle: "E'lonni tahrirlash",
    adTitleLabel: "E'lon sarlavhasi",
    adCategoryLabel: "Kategoriya",
    adPriceLabel: "Narxi",
    adCurrencyLabel: "Valyuta",
    adConditionLabel: "Holati",
    adLocationLabel: "Hudud",
    adDescriptionLabel: "Batafsil ma'lumot (tavsif)",
    aiDescriptionBtn: "AI orqali matn yaratish",
    photosLabel: "Rasmlar (kamida 3 ta)",
    publishAdBtn: "E'lonni chop etish",
    savingAdBtn: "Saqlanmoqda...",
    
    // Footer
    footerDesc: "O'zbekistondagi eng qulay va zamonaviy e'lonlar platformasi. Uy-joy, avtomobil, elektronika va boshqa turdagi mahsulotlarni tez va xavfsiz sotib oling yoki soting.",
    footerTrust: "Xavfsiz va ishonchli savdo",
    popularCategories: "Ommabop kategoriyalar",
    platformFeatures: "Platforma Imkoniyatlari",
    support: "Qo'llab-quvvatlash",
    allRightsReserved: "Barcha huquqlar himoyalangan.",
    madeWithLove: "bilan O'zbekiston uchun yaratildi",
    
    // Bot Modal
    botModalTitle: "E'lonUZ Telegram Bot",
    botModalBadge: "24/7 Avtomatlashtirilgan",
    botModalDesc: "E'lonlar, yangi xabarlar va savdoni Telegramingiz orqali boshqaring",
    tabConnect: "Botga ulanish",
    tabSimulator: "Bot Simulyatori (Jonli sinov)",
    tabFeatures: "Imkoniyatlar",
    botStatusOnline: "🟢 Bot serverda faol va ulanishga tayyor",
    openTelegram: "Telegramda ochish",
    step1Title: "Telegramda botni toping va /start bosing",
    step2Title: "Shaxsiy ulash kodini oling",
    step3Title: "Kodni botga yuboring va hisobingiz ulanadi",
    copyCode: "Nusxalash",
    copied: "Nusxalandi!",
  },

  ru: {
    // Brand & header
    brandName: "E'lonUZ",
    brandSubtitle: "Доска объявлений",
    searchPlaceholder: "Поиск товаров, авто, телефонов, квартир...",
    searchBtn: "Найти",
    allRegions: "Все регионы",
    voiceSearchListening: "🎙️ Слушаю... Назовите товар",
    voiceSearchPrompt: "Голосовой поиск",
    
    // Quick tools & navbar
    categories: "Категории",
    postAd: "Подать объявление",
    favorites: "Избранное",
    messages: "Сообщения",
    login: "Вход",
    register: "Регистрация",
    authButton: "Регистрация / Вход",
    admin: "Админ",
    safety: "Безопасность",
    compare: "Сравнение",
    currency: "Валюта",
    delivery: "Доставка",
    bargain: "Торговаться с ИИ",
    receipt: "Товарный чек",
    priceAnalytics: "Аналитика цен",
    sellerStats: "Статистика продавца",
    tgBot: "Telegram Бот",
    myProfile: "Мой профиль",
    myListings: "Мои объявления",
    adminPanel: "Панель администратора",
    logout: "Выйти",
    allCategories: "Все",
    
    // Hero banner
    heroBadge: "Самая удобная и свободная площадка объявлений в Узбекистане",
    heroTitle: "Продавайте и покупайте всё, что пожелаете!",
    heroDesc: "Телефоны, автомобили, квартиры, компьютеры или одежда. Добавьте от 3-х качественных фото и начинайте продажи.",
    heroPostBtn: "+ Подать объявление (минимум 3 фото)",
    
    // Filters & Sorting
    adsFound: "объявлений найдено",
    filterTitle: "Фильтры",
    resetFilters: "Сбросить",
    mapView: "Карта",
    statsView: "Статистика",
    vipBadge: "VIP",
    urgentBadge: "Срочно",
    videoBadge: "С видео",
    allConditions: "Любое состояние",
    conditionNew: "Новый",
    conditionUsed: "Б/у",
    sortNewest: "Сначала новые",
    sortPriceAsc: "Сначала дешевые",
    sortPriceDesc: "Сначала дорогие",
    sortViewsDesc: "Популярные",
    priceFrom: "Цена: от",
    priceTo: "до",
    noAdsFound: "Объявления не найдены",
    noAdsFoundDesc: "Попробуйте изменить параметры поиска или посмотрите все объявления",
    viewAllAds: "Посмотреть все объявления",
    
    // Product details & cards
    som: "сум",
    views: "просмотров",
    callSeller: "Позвонить",
    showPhone: "Показать номер",
    chatWithSeller: "Написать продавцу",
    bargainWithAi: "Торговаться с ИИ",
    buyReceipt: "Создать товарный чек",
    deliveryCalc: "Калькулятор доставки",
    description: "Описание",
    sellerInfo: "О продавце",
    memberSince: "На сайте с",
    verifiedSeller: "Проверенный продавец",
    location: "Город / Регион",
    date: "Дата",
    condition: "Состояние",
    category: "Категория",
    reviews: "Отзывы",
    writeReview: "Написать отзыв",
    leaveReview: "Оставить отзыв и оценку продавцу",
    similarAds: "Похожие объявления",
    share: "Поделиться",
    linkCopied: "Ссылка скопирована!",
    safetyTips: "Правила безопасности: не переводите предоплату, проверяйте товар при встрече.",
    editAd: "Редактировать объявление",
    deleteAd: "Удалить объявление",
    confirmDelete: "Вы действительно хотите удалить это объявление?",
    
    // Auth modal
    loginTitle: "Вход в аккаунт",
    registerTitle: "Регистрация нового аккаунта",
    adminLoginTitle: "Вход для администратора",
    username: "Имя пользователя (Логин)",
    email: "Электронная почта (Email)",
    password: "Пароль",
    phone: "Номер телефона",
    telegramUsername: "Telegram никнейм (например @Mdmnv_77)",
    haveAccount: "Уже есть аккаунт? Войти",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    adminLoginLink: "Войти через панель администратора",
    userLoginLink: "Войти как обычный пользователь",
    loggingIn: "Вход...",
    registering: "Регистрация...",
    
    // Create/Edit product
    createAdTitle: "Подать новое объявление",
    editAdTitle: "Редактировать объявление",
    adTitleLabel: "Название объявления",
    adCategoryLabel: "Категория",
    adPriceLabel: "Цена",
    adCurrencyLabel: "Валюта",
    adConditionLabel: "Состояние",
    adLocationLabel: "Регион",
    adDescriptionLabel: "Подробное описание",
    aiDescriptionBtn: "Сгенерировать текст через ИИ",
    photosLabel: "Фотографии (минимум 3 фото)",
    publishAdBtn: "Опубликовать объявление",
    savingAdBtn: "Сохранение...",
    
    // Footer
    footerDesc: "Самая удобная и современная платформа объявлений в Узбекистане. Покупайте и продавайте недвижимость, автомобили, технику и многое другое быстро и безопасно.",
    footerTrust: "Безопасная и надежная торговля",
    popularCategories: "Популярные категории",
    platformFeatures: "Возможности платформы",
    support: "Служба поддержки",
    allRightsReserved: "Все права защищены.",
    madeWithLove: "создано для Узбекистана с",
    
    // Bot Modal
    botModalTitle: "Telegram Бот E'lonUZ",
    botModalBadge: "Автоматизация 24/7",
    botModalDesc: "Управляйте объявлениями, сообщениями и сделками прямо из Telegram",
    tabConnect: "Подключение к боту",
    tabSimulator: "Симулятор бота (Тест)",
    tabFeatures: "Возможности",
    botStatusOnline: "🟢 Бот активен на сервере и готов к подключению",
    openTelegram: "Открыть в Telegram",
    step1Title: "Найдите бота в Telegram и отправьте /start",
    step2Title: "Скопируйте персональный код подключения",
    step3Title: "Отправьте код боту для привязки аккаунта",
    copyCode: "Копировать",
    copied: "Скопировано!",
  },

  en: {
    // Brand & header
    brandName: "E'lonUZ",
    brandSubtitle: "Marketplace",
    searchPlaceholder: "Search products, cars, phones, apartments...",
    searchBtn: "Search",
    allRegions: "All regions",
    voiceSearchListening: "🎙️ Listening... Say product name",
    voiceSearchPrompt: "Voice search",
    
    // Quick tools & navbar
    categories: "Categories",
    postAd: "Post an Ad",
    favorites: "Favorites",
    messages: "Messages",
    login: "Log In",
    register: "Register",
    authButton: "Register / Log In",
    admin: "Admin",
    safety: "Safety",
    compare: "Compare",
    currency: "Currency",
    delivery: "Delivery",
    bargain: "AI Bargaining",
    receipt: "Receipt",
    priceAnalytics: "Price Analytics",
    sellerStats: "Seller Analytics",
    tgBot: "Telegram Bot",
    myProfile: "My Profile",
    myListings: "My Listings",
    adminPanel: "Admin Dashboard",
    logout: "Log Out",
    allCategories: "All",
    
    // Hero banner
    heroBadge: "The most convenient marketplace platform in Uzbekistan",
    heroTitle: "Buy and Sell Whatever You Want!",
    heroDesc: "Phones, cars, real estate, computers or clothing. Upload at least 3 quality photos and start selling today.",
    heroPostBtn: "+ Post an Ad (with 3 photos)",
    
    // Filters & Sorting
    adsFound: "ads found",
    filterTitle: "Filters",
    resetFilters: "Reset",
    mapView: "Map",
    statsView: "Analytics",
    vipBadge: "VIP",
    urgentBadge: "Urgent",
    videoBadge: "With Video",
    allConditions: "Any condition",
    conditionNew: "New",
    conditionUsed: "Used",
    sortNewest: "Newest First",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortViewsDesc: "Most Popular",
    priceFrom: "Price from",
    priceTo: "to",
    noAdsFound: "No listings found",
    noAdsFoundDesc: "Try adjusting your search filters or browse all listings",
    viewAllAds: "View all listings",
    
    // Product details & cards
    som: "UZS",
    views: "views",
    callSeller: "Call Seller",
    showPhone: "Show Phone",
    chatWithSeller: "Chat with Seller",
    bargainWithAi: "Bargain with AI",
    buyReceipt: "Generate Receipt",
    deliveryCalc: "Delivery Calculator",
    description: "Description",
    sellerInfo: "Seller Information",
    memberSince: "Member since",
    verifiedSeller: "Verified Seller",
    location: "Location",
    date: "Date",
    condition: "Condition",
    category: "Category",
    reviews: "Reviews",
    writeReview: "Write Review",
    leaveReview: "Leave feedback & rating for seller",
    similarAds: "Similar Listings",
    share: "Share",
    linkCopied: "Link copied!",
    safetyTips: "Safety note: Never send prepayment, always inspect items in person.",
    editAd: "Edit Listing",
    deleteAd: "Delete Listing",
    confirmDelete: "Are you sure you want to delete this listing?",
    
    // Auth modal
    loginTitle: "Log in to your account",
    registerTitle: "Create a new account",
    adminLoginTitle: "Administrator Login",
    username: "Username",
    email: "Email address",
    password: "Password",
    phone: "Phone number",
    telegramUsername: "Telegram username (e.g. @Mdmnv_77)",
    haveAccount: "Already have an account? Log in",
    noAccount: "Don't have an account? Register",
    adminLoginLink: "Log in via Admin Panel",
    userLoginLink: "Log in as Regular User",
    loggingIn: "Logging in...",
    registering: "Registering...",
    
    // Create/Edit product
    createAdTitle: "Post a New Listing",
    editAdTitle: "Edit Listing",
    adTitleLabel: "Listing Title",
    adCategoryLabel: "Category",
    adPriceLabel: "Price",
    adCurrencyLabel: "Currency",
    adConditionLabel: "Condition",
    adLocationLabel: "Region",
    adDescriptionLabel: "Detailed Description",
    aiDescriptionBtn: "Generate Description with AI",
    photosLabel: "Photos (at least 3 photos required)",
    publishAdBtn: "Publish Listing",
    savingAdBtn: "Saving...",
    
    // Footer
    footerDesc: "The premier modern marketplace platform in Uzbekistan. Buy and sell real estate, autos, tech and more quickly and securely.",
    footerTrust: "Safe and trusted trading",
    popularCategories: "Popular Categories",
    platformFeatures: "Platform Features",
    support: "Customer Support",
    allRightsReserved: "All rights reserved.",
    madeWithLove: "crafted for Uzbekistan with",
    
    // Bot Modal
    botModalTitle: "E'lonUZ Telegram Bot",
    botModalBadge: "24/7 Automation",
    botModalDesc: "Manage listings, instant chats and deals right inside Telegram",
    tabConnect: "Connect Bot",
    tabSimulator: "Bot Simulator (Live Test)",
    tabFeatures: "Features",
    botStatusOnline: "🟢 Bot is active on server and ready to connect",
    openTelegram: "Open in Telegram",
    step1Title: "Find bot in Telegram and press /start",
    step2Title: "Copy your personal connect code",
    step3Title: "Send code to bot to link your account",
    copyCode: "Copy Code",
    copied: "Copied!",
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
    setLang(prev => {
      if (prev === 'uz') return 'ru';
      if (prev === 'ru') return 'en';
      return 'uz';
    });
  };

  const setLanguage = (newLang) => {
    if (['uz', 'ru', 'en'].includes(newLang)) {
      setLang(newLang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['uz']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLanguage, toggleLanguage, t }}>
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
