import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  ShoppingCart, 
  Star, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Check, 
  Scale, 
  Plus, 
  Eye, 
  Activity,
  Heart,
  FileSpreadsheet
} from 'lucide-react';
import { Product } from '../types';
import { Language, translations } from '../localization';
import ProductImage from './ProductImage';

interface ProductComparisonProps {
  comparedProducts: Product[];
  allProducts: Product[];
  currentLang: Language;
  onRemoveCompared: (id: string) => void;
  onClearCompared: () => void;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onAddCompared?: (p: Product) => void;
}

export default function ProductComparison({
  comparedProducts,
  allProducts,
  currentLang,
  onRemoveCompared,
  onClearCompared,
  onAddToCart,
  onSelectProduct,
  onAddCompared
}: ProductComparisonProps) {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'all' | 'Smartphones' | 'Laptops' | 'Others'>('all');
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);

  // Filter compared products by active category tab
  const displayedProducts = comparedProducts.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'Smartphones') return p.category === 'Smartphones';
    if (activeTab === 'Laptops') return p.category === 'Laptops';
    return p.category !== 'Smartphones' && p.category !== 'Laptops';
  });

  // Hot suggestions to compare if compared list is empty/low
  const suggestionProducts = allProducts
    .filter(p => !comparedProducts.some(comp => comp.id === p.id))
    .slice(0, 4);

  // Group all possible spec keys from displaying products
  const allSpecKeys = Array.from(
    new Set(displayedProducts.flatMap(p => Object.keys(p.specs || {})))
  );

  // Group all possible features for side-by-side comparison
  const maxFeaturesCount = Math.max(...displayedProducts.map(p => p.features?.length || 0), 0);

  // Helper to find the best price (lowest)
  const lowestPrice = displayedProducts.length > 1 
    ? Math.min(...displayedProducts.map(p => p.price)) 
    : null;

  // Helper to find the highest rating
  const highestRating = displayedProducts.length > 1 
    ? Math.max(...displayedProducts.map(p => p.rating)) 
    : null;

  // Helper to verify if a spec value is different across displaying products
  const isSpecDifferent = (key: string) => {
    if (displayedProducts.length <= 1) return false;
    const firstVal = displayedProducts[0].specs?.[key];
    return displayedProducts.some(p => p.specs?.[key] !== firstVal);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850">
        
        {/* Category Specific Compare Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            📋 All Products ({comparedProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('Smartphones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'Smartphones' 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobiles ({comparedProducts.filter(p => p.category === 'Smartphones').length})
          </button>
          <button
            onClick={() => setActiveTab('Laptops')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'Laptops' 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            Laptops ({comparedProducts.filter(p => p.category === 'Laptops').length})
          </button>
          <button
            onClick={() => setActiveTab('Others')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Others' 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            🔌 Others ({comparedProducts.filter(p => p.category !== 'Smartphones' && p.category !== 'Laptops').length})
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {displayedProducts.length > 1 && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 outline-none focus:ring-0 dark:border-zinc-800"
              />
              <span className="font-sans text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                Highlight Differences
              </span>
            </label>
          )}

          {comparedProducts.length > 0 && (
            <button
              onClick={onClearCompared}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      {/* Main Table Panel */}
      {displayedProducts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 max-w-4xl mx-auto p-6 space-y-4">
          <Scale className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-sans text-sm font-bold text-zinc-800 dark:text-zinc-200">No products added for comparison</h4>
            <p className="font-sans text-xs text-zinc-400 dark:text-zinc-500 max-w-md mx-auto">
              Select multiple products from the catalogue using the "Compare" checkbox to contrast technical parameters side-by-side.
            </p>
          </div>

          {/* Quick Suggestions to add to comparison */}
          {suggestionProducts.length > 0 && onAddCompared && (
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6 space-y-3">
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                ⚡ Quick Add Suggestions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {suggestionProducts.map(p => (
                  <div 
                    key={p.id}
                    className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="h-14 w-full relative mb-2">
                      <ProductImage 
                        src={p.image} 
                        name={p.name} 
                        category={p.category} 
                        productId={p.id} 
                        className="h-full w-full rounded-md object-contain" 
                      />
                    </div>
                    <span className="font-sans text-[10px] font-bold line-clamp-1 text-zinc-850 dark:text-zinc-200 text-center w-full">
                      {p.name}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400 mb-2">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onAddCompared(p)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold transition-all flex items-center gap-0.5"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Add to Compare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full table-fixed min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-850">
                {/* Parameter column header */}
                <th className="w-48 p-4 font-sans text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-r border-zinc-100 dark:border-zinc-850">
                  Tech Parameter
                </th>

                {/* Displayed product column headers */}
                {displayedProducts.map(p => (
                  <th key={p.id} className="p-4 relative border-r border-zinc-100 dark:border-zinc-850">
                    
                    {/* Delete comparison element */}
                    <button
                      onClick={() => onRemoveCompared(p.id)}
                      className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-rose-500 dark:text-zinc-650 dark:hover:text-rose-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="space-y-2">
                      <div className="h-24 w-full relative">
                        <ProductImage 
                          src={p.image} 
                          name={p.name} 
                          category={p.category} 
                          productId={p.id} 
                          className="h-full w-full rounded-lg object-contain" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                          {p.category}
                        </span>
                        <h5 
                          onClick={() => onSelectProduct(p)}
                          className="font-sans text-xs font-bold text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2"
                        >
                          {p.name}
                        </h5>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-sans">
              
              {/* Row 1: Pricing */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                <td className="p-4 font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5">
                  Retail Price
                </td>
                {displayedProducts.map(p => {
                  const isBest = lowestPrice && p.price === lowestPrice;
                  return (
                    <td key={p.id} className="p-4 border-r border-zinc-100 dark:border-zinc-850">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-mono text-sm font-extrabold ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-650 dark:text-blue-400'}`}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {isBest && (
                          <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-0.5">
                            ★ Cheapest Value
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Customer Rating */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                <td className="p-4 font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5">
                  Customer Score
                </td>
                {displayedProducts.map(p => {
                  const isBest = highestRating && p.rating === highestRating;
                  return (
                    <td key={p.id} className="p-4 border-r border-zinc-100 dark:border-zinc-850">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded text-amber-500 text-[10px] font-bold">
                          <Star className="h-3 w-3 fill-amber-500 shrink-0" />
                          <span>{p.rating} / 5</span>
                        </div>
                        {isBest && (
                          <span className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-0.5">
                            🏆 Top Rated
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Stock Levels */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                <td className="p-4 font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5">
                  Stock Availability
                </td>
                {displayedProducts.map(p => (
                  <td key={p.id} className="p-4 border-r border-zinc-100 dark:border-zinc-850">
                    {p.stock === 0 ? (
                      <span className="text-rose-500 font-bold uppercase text-[10px]">Out of Stock</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">{p.stock} units left</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Technical Specifications Blocks (Mapped dynamically) */}
              {allSpecKeys.map(key => {
                const different = isSpecDifferent(key);
                return (
                  <tr 
                    key={key} 
                    className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors ${
                      highlightDifferences && different ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
                    }`}
                  >
                    <td className="p-4 border-r border-zinc-100 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-500 dark:text-zinc-400">{key}</span>
                        {highlightDifferences && different && (
                          <span className="text-[8px] font-semibold text-blue-500 uppercase tracking-widest mt-0.5">
                            Differs
                          </span>
                        )}
                      </div>
                    </td>
                    {displayedProducts.map(p => {
                      const specVal = p.specs?.[key] || '—';
                      return (
                        <td key={p.id} className="p-4 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 border-r border-zinc-100 dark:border-zinc-850 leading-relaxed">
                          {specVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Key Features side-by-side list comparison */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                <td className="p-4 font-bold text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5 align-top">
                  Highlights & Features
                </td>
                {displayedProducts.map(p => (
                  <td key={p.id} className="p-4 border-r border-zinc-100 dark:border-zinc-850 align-top space-y-1.5">
                    {p.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-450 leading-relaxed">
                        <Check className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    )) || '—'}
                  </td>
                ))}
              </tr>

              {/* Row: Add to cart / Action drawer footer */}
              <tr className="bg-zinc-50/30 dark:bg-zinc-900/10">
                <td className="p-4 border-r border-zinc-100 dark:border-zinc-855"></td>
                {displayedProducts.map(p => (
                  <td key={p.id} className="p-4 border-r border-zinc-100 dark:border-zinc-850">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onAddToCart(p)}
                        disabled={p.stock === 0}
                        className="w-full cursor-pointer py-2 px-3 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {p.stock === 0 ? t.outOfStock : 'Buy / Add to Cart'}
                      </button>
                      
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="w-full py-2 px-3 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Full Specs
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

      {/* Suggestive FAQ / Compare advice section */}
      {displayedProducts.length > 0 && (
        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 p-5 space-y-2.5">
          <h4 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> 
            Smart Side-by-Side Advisor
          </h4>
          <p className="font-sans text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
            Comparing high-spec items such as {displayedProducts.slice(0, 3).map(p => p.name).join(', ')}. 
            Look for differences in <strong>{allSpecKeys.slice(0, 3).join(', ')}</strong> highlighted above in blue to find the product that matches your exact operational needs.
          </p>
        </div>
      )}

    </div>
  );
}
