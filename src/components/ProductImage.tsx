import React, { useState } from 'react';
import { Laptop, Smartphone, Headphones, Watch, Tv, Speaker, Camera, HelpCircle } from 'lucide-react';

interface ProductImageProps {
  src: string;
  name: string;
  category: string;
  className?: string;
  productId?: string;
}

export default function ProductImage({ src, name, category, className = '', productId = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Return the appropriate Lucide icon component based on product traits
  const getIcon = () => {
    const nameLower = name.toLowerCase();
    const catLower = category.toLowerCase();

    if (productId === 'prod-6' || nameLower.includes('watch') || nameLower.includes('wearable')) {
      return Watch;
    }
    if (productId === 'prod-9' || nameLower.includes('speaker') || nameLower.includes('hub')) {
      return Speaker;
    }
    if (catLower === 'laptops' || nameLower.includes('laptop') || nameLower.includes('book')) {
      return Laptop;
    }
    if (catLower === 'smartphones' || nameLower.includes('phone') || nameLower.includes('fold')) {
      return Smartphone;
    }
    if (catLower === 'audio' || nameLower.includes('earbuds') || nameLower.includes('headset') || nameLower.includes('sound')) {
      return Headphones;
    }
    if (catLower === 'home' || nameLower.includes('tv') || nameLower.includes('screen')) {
      return Tv;
    }
    if (catLower === 'cameras' || nameLower.includes('camera') || nameLower.includes('lens')) {
      return Camera;
    }
    return HelpCircle;
  };

  const IconComponent = getIcon();

  // Pick an elegant, subtle background color accent depending on the category
  const getBgClass = () => {
    const catLower = category.toLowerCase();
    if (catLower === 'laptops') return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    if (catLower === 'smartphones') return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
    if (catLower === 'audio') return 'bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400 border-violet-100 dark:border-violet-900/30';
    if (catLower === 'home') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    if (catLower === 'cameras') return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    return 'bg-slate-50 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 border-slate-100 dark:border-zinc-800';
  };

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center border ${getBgClass()} ${className} transition-all duration-300 select-none p-4`}>
        <div className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-900/50 shadow-sm border border-zinc-100/50 dark:border-zinc-800/30 transition-transform duration-300 group-hover:scale-110">
          <IconComponent className="h-8 w-8 transition-transform duration-500 hover:rotate-12" />
        </div>
        <span className="mt-3 font-sans text-[10px] font-bold uppercase tracking-widest opacity-60 text-center leading-tight max-w-[80%] truncate">
          {name}
        </span>
      </div>
    );
  }

  const hasObjectFit = className.includes('object-cover') || className.includes('object-contain') || className.includes('object-fill') || className.includes('object-none') || className.includes('object-scale-down');
  const fitClass = hasObjectFit ? '' : 'object-cover object-center';

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} ${fitClass} transition-all duration-300`}
    />
  );
}
