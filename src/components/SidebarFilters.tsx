import React, { useMemo } from 'react';
import { Filter, Star, RotateCcw, Laptop, Smartphone, Headphones, Home, Camera, Sliders, ChevronRight } from 'lucide-react';
import { Language, translations } from '../localization';
import { Product } from '../types';

interface SidebarFiltersProps {
  currentLang: Language;
  products: Product[];
  
  // Category Selection
  selectedCategory: string;
  onChangeCategory: (cat: string) => void;

  // Price Filters
  priceRange: [number, number];
  onChangePriceRange: (range: [number, number]) => void;

  // Brand Filters
  selectedBrands: string[];
  onChangeBrands: (brands: string[]) => void;

  // Rating Filter
  minRating: number;
  onChangeMinRating: (rating: number) => void;

  // Reset Trigger
  onResetFilters: () => void;
}

export default function SidebarFilters({
  currentLang,
  products,
  selectedCategory,
  onChangeCategory,
  priceRange,
  onChangePriceRange,
  selectedBrands,
  onChangeBrands,
  minRating,
  onChangeMinRating,
  onResetFilters
}: SidebarFiltersProps) {
  const t = translations[currentLang];

  // List of all base categories
  const categoriesList = ['All', 'Laptops', 'Smartphones', 'Audio', 'Home', 'Cameras'];

  // Helper to extract brand dynamically
  const getProductBrand = (p: Product) => {
    const name = p.name.trim();
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('dji')) return 'DJI';
    if (lowerName.startsWith('gopro')) return 'GoPro';
    if (lowerName.startsWith('sony')) return 'Sony';
    if (lowerName.startsWith('apple')) return 'Apple';
    if (lowerName.startsWith('hp')) return 'HP';
    if (lowerName.startsWith('dell')) return 'Dell';
    if (lowerName.startsWith('samsung')) return 'Samsung';
    if (lowerName.startsWith('lg')) return 'LG';
    if (lowerName.startsWith('asus')) return 'ASUS';
    if (lowerName.startsWith('bose')) return 'Bose';
    return name.split(' ')[0];
  };

  // 1. Compute dynamic brand counts
  const brandData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const brand = getProductBrand(p);
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  // 2. Compute category counts based on current list of all products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Handle checking/unchecking a brand
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      onChangeBrands([...selectedBrands, brand]);
    } else {
      onChangeBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Laptops': return <Laptop className="h-4 w-4" />;
      case 'Smartphones': return <Smartphone className="h-4 w-4" />;
      case 'Audio': return <Headphones className="h-4 w-4" />;
      case 'Home': return <Home className="h-4 w-4" />;
      case 'Cameras': return <Camera className="h-4 w-4" />;
      default: return <Sliders className="h-4 w-4" />;
    }
  };

  const getLocalizedCategory = (cat: string) => {
    const categoryMap: Record<Language, Record<string, string>> = {
      en: { All: 'All Electronics', Laptops: 'Laptops', Smartphones: 'Smartphones', Audio: 'Audio', Home: 'Home Appliances', Cameras: 'Cameras' },
      es: { All: 'Todo lo Electrónico', Laptops: 'Portátiles', Smartphones: 'Teléfonos Inteligentes', Audio: 'Audio', Home: 'Hogar', Cameras: 'Cámaras' },
      fr: { All: 'Tous Électronique', Laptops: 'Ordinateurs Portables', Smartphones: 'Smartphones', Audio: 'Audio', Home: 'Maison', Cameras: 'Appareils Photo' },
      de: { All: 'Alle Elektronik', Laptops: 'Laptops', Smartphones: 'Smartphones', Audio: 'Audio-Geräte', Home: 'Haushalt', Cameras: 'Kameras' },
      ja: { All: 'すべての電子機器', Laptops: 'ノートパソコン', Smartphones: 'スマートフォン', Audio: 'オーディオ器具', Home: 'ホーム家電', Cameras: 'カメラ' },
      te: { All: 'అన్ని ఎలక్ట్రానిక్స్', Laptops: 'ల్యాప్‌టాప్స్', Smartphones: 'స్మార్ట్‌ఫోన్‌లు', Audio: 'ఆడియో గేర్', Home: 'గృహోపకరణాలు', Cameras: 'కెమెరాలు' },
      hi: { All: 'सभी इलेक्ट्रॉनिक्स', Laptops: 'लैपटॉप', Smartphones: 'स्मार्टफोन', Audio: 'ऑडियो सामान', Home: 'घरेलू उपकरण', Cameras: 'कैमरे' },
      ta: { All: 'அனைத்து மின்னணு சாதனங்கள்', Laptops: 'லேப்டாப்கள்', Smartphones: 'ஸ்மார்ட்போன்கள்', Audio: 'ஆடியோ சாதனங்கள்', Home: 'வீட்டு உபயோக பொருட்கள்', Cameras: 'கேமராக்கள்' }
    };
    return categoryMap[currentLang]?.[cat] || cat;
  };

  const priceRangeLabel = {
    en: 'Price Range',
    es: 'Rango de precios',
    fr: 'Fourchette de prix',
    de: 'Preisspanne',
    ja: '価格帯',
    te: 'ధర పరిధి',
    hi: 'मूल्य सीमा',
    ta: 'விலை வரம்பு'
  }[currentLang] || 'Price Range';

  const resetTooltip = {
    en: 'Reset all filters',
    es: 'Restablecer todos los filtros',
    fr: 'Réinitialiser tous les filtres',
    de: 'Alle Filter zurücksetzen',
    ja: 'すべてのフィルターをリセット',
    te: 'అన్ని ఫిల్టర్‌లను రీసెట్ చేయండి',
    hi: 'सभी फ़िल्टर रीसेट करें',
    ta: 'அனைத்து வடிகட்டிகளையும் மீட்டமைக்கவும்'
  }[currentLang] || 'Reset all filters';

  // Determine pricing absolute bounds in products list
  const maxProductPriceInCatalog = useMemo(() => {
    if (products.length === 0) return 300000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  return (
    <div className="w-full space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-950">
      
      {/* Header section with Reset */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-sans text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.filters}
          </h4>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 font-mono text-[10px] font-black tracking-wider text-zinc-400 hover:text-blue-600 dark:text-zinc-650 dark:hover:text-blue-400 transition-colors uppercase cursor-pointer"
          title={resetTooltip}
        >
          <RotateCcw className="h-3 w-3" />
          {t.reset}
        </button>
      </div>

      {/* 1. Category Filtering - Rendered as modern horizontal flex pills */}
      <div className="space-y-2">
        <h5 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-600">
          {t.productCategory}
        </h5>
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((cat) => {
            const count = cat === 'All' ? products.length : (categoryCounts[cat] || 0);
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onChangeCategory(cat)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{getLocalizedCategory(cat)}</span>
                <span className={`font-mono text-[9px] rounded px-1.5 py-0.5 ${
                  isSelected 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-zinc-200/60 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid for Filters: Horizontal on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        
        {/* 2. Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-600">
              {priceRangeLabel}
            </h5>
            <span className="font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
              INR
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={maxProductPriceInCatalog}
                step={1000}
                value={Math.min(priceRange[1], maxProductPriceInCatalog)}
                onChange={(e) => onChangePriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-blue-600 dark:accent-blue-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-650">
                <span>₹0</span>
                <span>Max: ₹{maxProductPriceInCatalog.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-sans text-[9px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-650 block mb-0.5">{t.minPrice}</label>
                <input
                  type="number"
                  min={0}
                  max={Math.min(priceRange[1], maxProductPriceInCatalog)}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    onChangePriceRange([val, priceRange[1]]);
                  }}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2 py-1 font-mono text-[10px] text-zinc-800 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-850 dark:bg-zinc-900/50 dark:text-zinc-200 dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-sans text-[9px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-650 block mb-0.5">{t.maxPrice}</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={maxProductPriceInCatalog}
                  value={Math.min(priceRange[1], maxProductPriceInCatalog)}
                  onChange={(e) => {
                    const val = Math.min(maxProductPriceInCatalog, parseInt(e.target.value) || 0);
                    onChangePriceRange([priceRange[0], val]);
                  }}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2 py-1 font-mono text-[10px] text-zinc-800 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-850 dark:bg-zinc-900/50 dark:text-zinc-200 dark:focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Brand Filtering */}
        <div className="space-y-3">
          <h5 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-600">
            {t.filterByBrand}
          </h5>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1 border border-zinc-100 dark:border-zinc-900 rounded-lg p-1.5 bg-zinc-50/30 dark:bg-zinc-950/30">
            {brandData.map((brand) => {
              const isChecked = selectedBrands.includes(brand.name);
              return (
                <label
                  key={brand.name}
                  className="flex items-center justify-between rounded px-2 py-1 text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleBrandChange(brand.name, e.target.checked)}
                      className="h-3 w-3 rounded border-zinc-300 text-blue-600 outline-none focus:ring-0 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                    <span className="font-sans font-medium text-zinc-700 dark:text-zinc-300">
                      {brand.name}
                    </span>
                  </div>
                  <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.2 rounded">
                    {brand.count}
                  </span>
                </label>
              );
            })}
            {brandData.length === 0 && (
              <p className="font-mono text-[9px] text-zinc-400 py-1 px-2">{t.noBrandsFound}</p>
            )}
          </div>
        </div>

        {/* 4. Rating Filter */}
        <div className="space-y-3">
          <h5 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider dark:text-zinc-600">
            {t.minimumRating}
          </h5>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {[4, 3, 2, 0].map((ratingVal) => {
              const isSelected = minRating === ratingVal;
              return (
                <button
                  key={ratingVal}
                  onClick={() => onChangeMinRating(ratingVal)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {ratingVal === 0 ? (
                        <span className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400">{t.allRatings}</span>
                      ) : (
                        <>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3 w-3 ${
                                idx < ratingVal ? 'fill-amber-500 text-amber-500' : 'text-zinc-200 dark:text-zinc-800'
                              }`}
                            />
                          ))}
                        </>
                      )}
                    </div>
                    {ratingVal > 0 && <span className="font-sans text-[11px]">{t.andUp}</span>}
                  </div>
                  {isSelected && (
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-[10px]">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
