import React from 'react';
import { Star, ShieldCheck, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import ProductImage from './ProductImage';
import { Language, translations } from '../localization';

interface ProductCardProps {
  key?: any;
  product: Product;
  currentLang: Language;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  theme?: 'light' | 'dark' | 'night';
  comparedProducts?: Product[];
  onToggleCompare?: (p: Product) => void;
}

export default function ProductCard({ 
  product, 
  currentLang, 
  onAddToCart, 
  onSelectProduct,
  theme = 'light',
  comparedProducts = [],
  onToggleCompare
}: ProductCardProps) {
  const t = translations[currentLang];
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isCompared = comparedProducts.some(p => p.id === product.id);

  // Custom classes for different themes
  const cardThemeStyles = {
    light: 'bg-white border-zinc-200/80 shadow-sm hover:shadow-xl hover:shadow-zinc-300/30 hover:border-blue-500/30 text-zinc-900',
    dark: 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/30 hover:shadow-xl hover:shadow-black/50 hover:border-zinc-800 text-zinc-100',
    night: 'bg-[#050508] border-zinc-900 hover:bg-black hover:shadow-[0_0_20px_rgba(59,130,246,0.12)] hover:border-blue-550/40 text-zinc-200'
  };

  const stageThemeStyles = {
    light: 'bg-zinc-50 border-b border-zinc-100/50',
    dark: 'bg-zinc-900 border-b border-zinc-850/50',
    night: 'bg-black border-b border-zinc-900/65'
  };

  const ratingThemeStyles = {
    light: 'bg-zinc-100/70 text-amber-500',
    dark: 'bg-zinc-900 text-amber-400',
    night: 'bg-black border border-zinc-900 text-amber-400'
  };

  const inlineSpecStyles = {
    light: 'text-zinc-500',
    dark: 'text-zinc-500',
    night: 'text-zinc-600'
  };

  const footerBorderStyles = {
    light: 'border-zinc-100',
    dark: 'border-zinc-850/50',
    night: 'border-zinc-900/60'
  };

  const selectTheme = theme === 'night' ? 'night' : theme === 'dark' ? 'dark' : 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover="hover"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1.5 ${cardThemeStyles[selectTheme]}`}
    >
      
      {/* Product Image Stage */}
      <div 
        className={`relative aspect-video w-full cursor-pointer overflow-hidden ${stageThemeStyles[selectTheme]}`} 
        onClick={() => onSelectProduct(product)}
      >
        <motion.div
          className="h-full w-full flex items-center justify-center"
          variants={{
            hover: { scale: 1.08 }
          }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <ProductImage
            src={product.image}
            name={product.name}
            category={product.category}
            productId={product.id}
            className="h-full w-full object-contain p-4"
          />
        </motion.div>
        
        {/* Category Label */}
        <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold text-white uppercase backdrop-blur-md dark:bg-zinc-800/80">
          {product.category}
        </span>

        {/* Compare Toggle Button */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute left-3 bottom-3 flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold text-white uppercase backdrop-blur-md transition-all border ${
              isCompared
                ? 'bg-blue-600/95 border-blue-500 shadow-md scale-105'
                : 'bg-zinc-900/60 border-zinc-700/40 hover:bg-zinc-900/85 hover:scale-105'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        )}

        {/* Real-time Inventory Status Badges */}
        {isOutOfStock ? (
          <span className="absolute right-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-black tracking-wide text-white uppercase shadow-lg shadow-rose-500/20 animate-pulse">
            ⚠️ {t.outOfStock}
          </span>
        ) : isLowStock ? (
          <span className="absolute right-3 top-3 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-black tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 flex items-center gap-1 animate-pulse">
            <AlertCircle className="h-3 w-3" />
            {t.onlyLeft} {product.stock}!
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-black tracking-wide text-white uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-0.5">
            ✓ {t.inStock} ({product.stock})
          </span>
        )}
      </div>

      {/* Content Details */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Title & Ratings */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-sans text-sm font-bold tracking-tight line-clamp-1 hover:text-blue-600 cursor-pointer"
          >
            {product.name}
          </h3>
          <div className={`flex items-center gap-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${ratingThemeStyles[selectTheme]}`}>
            <Star className="h-3 w-3 fill-amber-500 shrink-0" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="font-sans text-xs line-clamp-2 leading-relaxed mb-3 opacity-90">
          {product.description}
        </p>

        {/* Bullet Specs Row */}
        <div className="mb-4 space-y-1">
          {product.features.slice(0, 2).map((feat, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-[10px] font-mono ${inlineSpecStyles[selectTheme]}`}>
              <span className="text-blue-600 font-bold">•</span>
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>

        {/* Footer actions: Price & Add To Cart Button */}
        <div className={`mt-auto flex items-center justify-between gap-2 pt-3 border-t w-full ${footerBorderStyles[selectTheme]}`}>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-widest uppercase font-bold opacity-60">PRICE</span>
            <span className="font-mono text-base font-extrabold text-blue-650 dark:text-blue-400">
              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 ${isOutOfStock ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95'}`}
          >
            {isOutOfStock ? t.outOfStock : t.addToCart}
          </button>
        </div>

      </div>

    </motion.div>
  );
}
