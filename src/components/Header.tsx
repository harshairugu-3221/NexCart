import { useState } from 'react';
import { Search, ShoppingCart, Sun, Moon, Globe, LogIn, LogOut, User as UserIcon, Bell, Menu, X, Sparkles, ArrowLeftRight, ChevronDown, Sliders } from 'lucide-react';
import { Language, translations } from '../localization';
import { User, CartItem, Notification } from '../types';

interface HeaderProps {
  currentLang: Language;
  onChangeLang: (lang: Language) => void;
  theme: 'light' | 'dark' | 'night';
  onToggleTheme: () => void;
  user: User | null;
  cart: CartItem[];
  notifications: Notification[];
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectPage: (page: string) => void;
  currentPage: string;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  selectedCategory: string;
  onChangeCategory: (cat: string) => void;
  onMarkNotificationsRead: () => void;
  onToggleFilters?: () => void;
}

export default function Header({
  currentLang,
  onChangeLang,
  theme,
  onToggleTheme,
  user,
  cart,
  notifications,
  onOpenCart,
  onOpenAuth,
  onLogout,
  onSelectPage,
  currentPage,
  searchQuery,
  onChangeSearch,
  selectedCategory,
  onChangeCategory,
  onMarkNotificationsRead,
  onToggleFilters
}: HeaderProps) {
  const t = translations[currentLang];

  const themeTooltipTitle = {
    en: {
      light: 'Switch to Dark Mode',
      dark: 'Switch to Night Mode',
      night: 'Switch to Light Mode'
    },
    es: {
      light: 'Cambiar a Modo Oscuro',
      dark: 'Cambiar a Modo Nocturno',
      night: 'Cambiar a Modo Claro'
    },
    fr: {
      light: 'Passer en Mode Sombre',
      dark: 'Passer en Mode Nuit',
      night: 'Passer en Mode Clair'
    },
    de: {
      light: 'In den Dunkelmodus wechseln',
      dark: 'In den Nachtmodus wechseln',
      night: 'In den Lichtmodus wechseln'
    },
    ja: {
      light: 'ダークモードに切り替え',
      dark: 'ナイトモードに切り替え',
      night: 'ライトモードに切り替え'
    },
    te: {
      light: 'డార్క్ మోడ్‌కి మారండి',
      dark: 'నైట్ మోడ్‌కి మారండి',
      night: 'లైట్ మోడ్‌కి మారండి'
    },
    hi: {
      light: 'डार्क मोड पर स्विच करें',
      dark: 'नाइट मोड पर स्विच करें',
      night: 'लाइट मोड पर स्विच करें'
    },
    ta: {
      light: 'டார்க் பயன்முறைக்கு மாற்றவும்',
      dark: 'இரவு பயன்முறைக்கு மாற்றவும்',
      night: 'லைட் பயன்முறைக்கு மாற்றவும்'
    }
  }[currentLang] || {
    light: 'Switch to Dark Mode',
    dark: 'Switch to Night Mode',
    night: 'Switch to Light Mode'
  };

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const productShowcaseLabel = {
    en: '🛒 Product Showcase',
    es: '🛒 Catálogo de productos',
    fr: '🛒 Catalogue de produits',
    de: '🛒 Produktkatalog',
    ja: '🛒 商品一覧',
    te: '🛒 ఉత్పత్తుల ప్రదర్శన',
    hi: '🛒 उत्पाद शोकेस',
    ta: '🛒 தயாரிப்புகள் கண்காட்சி'
  }[currentLang] || '🛒 Product Showcase';

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.read);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = ['All', 'Laptops', 'Smartphones', 'Audio', 'Home', 'Cameras'];

  const languagesList: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-slate-200 dark:border-zinc-805 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onSelectPage('products'); setMobileMenuOpen(false); }}>
            <div className="relative group flex items-center justify-center select-none">
              <svg
                viewBox="0 0 100 100"
                className="h-9 w-9 drop-shadow-[0_2px_8px_rgba(59,130,246,0.25)] transition-all duration-300 group-hover:scale-105 active:scale-95"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Modern Squircle Backdrop with subtle glow */}
                <rect
                  x="6"
                  y="6"
                  width="88"
                  height="88"
                  rx="24"
                  fill="url(#logo-bg-grad)"
                  stroke="url(#logo-border-grad)"
                  strokeWidth="2"
                />
                
                {/* Interlocking N & C */}
                {/* N Component */}
                <path
                  d="M32 70V30L52 56V30"
                  stroke="url(#n-accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* C/Cart Loop Component */}
                <path
                  d="M68 30H56C42 30 38 42 38 50C38 58 42 70 56 70H68"
                  stroke="url(#c-accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Accent tech-nodes / dots representing intelligence and connectivity */}
                <circle cx="68" cy="30" r="4.5" fill="#60a5fa" />
                <circle cx="68" cy="70" r="4.5" fill="#38bdf8" />
                <circle cx="32" cy="30" r="4.5" fill="#ffffff" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="logo-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1e1b4b" />
                    <stop offset="0.5" stopColor="#0f172a" />
                    <stop offset="1" stopColor="#020617" />
                  </linearGradient>
                  <linearGradient id="logo-border-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#06b6d4" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="n-accent" x1="32" y1="30" x2="52" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient id="c-accent" x1="38" y1="30" x2="68" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.6" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                {t.brand}
              </span>
              <span className="hidden sm:inline font-mono text-[9px] tracking-wider text-slate-400 dark:text-zinc-500 uppercase">{t.tagline}</span>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="w-full rounded-md border-none bg-slate-100 dark:bg-zinc-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>

          {/* Actions & Settings Drawer */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Dynamic Pages */}
            <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 relative">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                    currentPage === 'products' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''
                  }`}
                >
                  <span>{selectedCategory === 'All' ? t.allCategories : selectedCategory}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 shadow-xl py-1.5 z-50 animate-fade-in">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onChangeCategory(cat);
                          onSelectPage('products');
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                          selectedCategory === cat ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/10' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {cat === 'All' ? t.allCategories : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters toggle button beside it */}
              <button
                onClick={() => {
                  if (onToggleFilters) {
                    onToggleFilters();
                  }
                  onSelectPage('products');
                }}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400`}
                title="Toggle Product Filters"
              >
                <Sliders className="h-3.5 w-3.5 text-blue-500" />
                <span>{t.filters}</span>
              </button>
              
              <button
                onClick={() => onSelectPage('compare')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${currentPage === 'compare' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Compare
              </button>
              
              {user && (
                <>
                  <button
                    onClick={() => onSelectPage('dashboard')}
                    className={`px-3 py-2 rounded-lg transition-all ${currentPage === 'dashboard' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                  >
                    {t.dashboard}
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => onSelectPage('analytics')}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1.5 border border-amber-500/10 text-amber-600 dark:text-amber-400 transition-all ${currentPage === 'analytics' ? 'bg-amber-500/10' : 'hover:bg-amber-500/5'}`}
                    >
                      🛡️ {t.analytics}
                    </button>
                  )}
                </>
              )}
            </nav>

            <span className="hidden lg:inline h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 ml-1 mr-1" />

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowNotifications(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                title={t.languageLabel}
              >
                <Globe className="h-4.5 w-4.5" />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 animate-fade-in">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${currentLang === lang.code ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                    >
                      {lang.label}
                      {currentLang === lang.code && <span className="text-blue-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visual Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 transition-all duration-200"
              title={
                theme === 'light' 
                  ? themeTooltipTitle.light 
                  : theme === 'dark' 
                    ? themeTooltipTitle.dark 
                    : themeTooltipTitle.night
              }
            >
              {theme === 'light' ? (
                <Sun className="h-4.5 w-4.5 animate-pulse text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400" />
              ) : (
                <Sparkles className="h-4.5 w-4.5 animate-bounce text-violet-400" />
              )}
            </button>

            {/* Real-time Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowLangMenu(false); }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 relative"
                  title={t.notifications}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-50 p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-3">
                      <h4 className="font-sans text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t.notifications}</h4>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={() => { onMarkNotificationsRead(); }}
                          className="font-mono text-[9px] text-blue-600 hover:underline font-bold"
                        >
                          {t.markAllRead}
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center font-mono text-xs text-zinc-400 dark:text-zinc-600">{t.noNotifications}</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={`p-2.5 rounded-xl border transition-all ${n.read ? 'bg-zinc-50/50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-850' : 'bg-blue-50/20 border-blue-100 dark:bg-blue-950/10 dark:border-blue-950'}`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200">{n.title}</span>
                              <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-600">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans leading-normal">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart Box */}
            <button
              onClick={onOpenCart}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              title={t.cart}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white animate-scale-up">{cartCount}</span>
              ) : (
                <span className="hidden sm:inline font-mono text-[10px] text-zinc-400 dark:text-zinc-500">0</span>
              )}
            </button>

            {/* Auth Block */}
            {user ? (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => onSelectPage('dashboard')}
                  className="hidden sm:flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 px-3 select-none text-slate-800 dark:text-slate-300 font-semibold"
                >
                  <UserIcon className="h-3 w-3 text-slate-500 mr-0.5" />
                  <span className="font-sans text-xs font-bold max-w-[80px] truncate">{user.name}</span>
                  {user.role === 'admin' && <span className="font-mono text-[8px] bg-amber-500 text-white font-black px-1 rounded ml-1">ADMIN</span>}
                </button>
                <button
                  onClick={onLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-zinc-500 dark:text-zinc-400"
                  title={t.logout}
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 ml-1 shadow-md"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.login}</span>
              </button>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Sub-header */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50/50 dark:border-zinc-900 dark:bg-zinc-950/30 transition-all">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="w-full rounded-md border-none bg-white py-1.5 pl-8 pr-4 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-150 bg-white/95 py-4 px-4 shadow-xl dark:border-zinc-900 dark:bg-zinc-950/95 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <button
              onClick={() => { onSelectPage('products'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${currentPage === 'products' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              {productShowcaseLabel}
            </button>
            <button
              onClick={() => { onSelectPage('compare'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${currentPage === 'compare' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              🔄 Compare Products
            </button>
            {user && (
              <>
                <button
                  onClick={() => { onSelectPage('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${currentPage === 'dashboard' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  👤 {t.dashboard}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { onSelectPage('analytics'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${currentPage === 'analytics' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    🛡️ {t.analytics}
                  </button>
                )}
              </>
            )}
          </div>
          
          {user && (
            <div className="border-t border-zinc-150 dark:border-zinc-850 pt-3">
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase select-none">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{user.name}</div>
                  <div className="text-[10px] text-zinc-400">{user.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
