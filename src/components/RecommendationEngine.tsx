import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { Recommendation, Product } from '../types';
import ProductImage from './ProductImage';
import { Language, translations } from '../localization';

interface RecommendationEngineProps {
  currentLang: Language;
  browsingHistory: string[];
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onClearHistory: () => void;
  theme?: 'light' | 'dark' | 'night';
}

export default function RecommendationEngine({
  currentLang,
  browsingHistory,
  products,
  onSelectProduct,
  onClearHistory,
  theme = 'light'
}: RecommendationEngineProps) {
  const t = translations[currentLang];
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom theme classes
  const wrapperThemeStyles = {
    light: 'bg-white border-zinc-200 shadow-sm',
    dark: 'bg-zinc-950 border-zinc-850 shadow-sm text-zinc-100',
    night: 'bg-[#030305] border-zinc-900 shadow-none text-zinc-200'
  };

  const cardThemeStyles = {
    light: 'bg-white border-zinc-200 hover:border-blue-605 hover:shadow-md text-zinc-900',
    dark: 'bg-zinc-900 border-zinc-850 hover:border-blue-500 hover:shadow-black/60 hover:shadow-md text-zinc-100',
    night: 'bg-[#08080c] border-[#13131a] hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.08)] text-zinc-200'
  };

  const stageThemeStyles = {
    light: 'bg-zinc-50',
    dark: 'bg-zinc-950',
    night: 'bg-black'
  };

  const scaleBgStyles = {
    light: 'bg-slate-100',
    dark: 'bg-zinc-800',
    night: 'bg-zinc-950'
  };

  const reasonBoxStyles = {
    light: 'bg-zinc-50 border-zinc-100',
    dark: 'bg-zinc-955/40 border-zinc-850',
    night: 'bg-black border-zinc-900'
  };

  const selectTheme = theme === 'night' ? 'night' : theme === 'dark' ? 'dark' : 'light';

  // Re-run recommendations whenever browsing history of items changes
  useEffect(() => {
    setLoading(true);
    fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: browsingHistory
      })
    })
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
      })
      .catch(err => console.error('Error in smart AI recommendations extraction:', err))
      .finally(() => setLoading(false));
  }, [browsingHistory]);

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 ${wrapperThemeStyles[selectTheme]}`}>
      
      {/* Visual Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800/60 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BrainCircuit className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <h3 className="font-sans text-sm font-extrabold uppercase tracking-wider flex items-center gap-1">
              {t.smartRecs}
            </h3>
          </div>
          <p className="font-mono text-[9px] opacity-60 mt-1 uppercase tracking-wide">
            {t.aiEngineStatus}
          </p>
        </div>

        {browsingHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="font-mono text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 hover:underline cursor-pointer"
          >
            Clear browsing cookies
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-zinc-400 dark:text-zinc-650 animate-pulse flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span>Gemini models are optimizing hyperparams based on viewed categories...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-400 dark:text-zinc-650">
          Start viewing products in our electronics warehouse to activate Gemini personalized recommendation loops!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const prod = products.find(p => p.id === rec.productId);
            if (!prod) return null;

            return (
              <div
                key={rec.productId}
                onClick={() => onSelectProduct(prod)}
                className={`group cursor-pointer border rounded-xl p-4 flex flex-col gap-3.5 transition-all duration-300 ${cardThemeStyles[selectTheme]}`}
              >
                {/* Visual Asset Stage */}
                <div className={`relative aspect-video w-full rounded overflow-hidden ${stageThemeStyles[selectTheme]}`}>
                  <ProductImage
                    src={prod.image}
                    name={prod.name}
                    category={prod.category}
                    productId={prod.id}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded bg-blue-600 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider block">
                    AI OPTIMIZED MATCH
                  </span>
                </div>

                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-start justify-between gap-2.5">
                    <h4 className="font-sans text-xs font-bold line-clamp-1 group-hover:text-blue-600 leading-none">
                      {prod.name}
                    </h4>
                    <span className="font-mono text-xs font-bold shrink-0">
                      ₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Confidence Score Scale */}
                  <div className="flex items-center gap-1.5 mt-2 font-mono text-[9px] opacity-75">
                    <span>{t.confidenceScore}:</span>
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${scaleBgStyles[selectTheme]}`}>
                      <div className="h-full bg-blue-550" style={{ width: `${rec.confidenceScore * 100}%` }} />
                    </div>
                    <span className="font-black text-blue-500">{Math.round(rec.confidenceScore * 100)}%</span>
                  </div>

                  {/* Smart Generated explanation Reason */}
                  <div className={`mt-3 p-2.5 rounded border border-dashed ${reasonBoxStyles[selectTheme]}`}>
                    <span className="font-sans text-[9px] font-black opacity-60 uppercase tracking-widest block mb-1">
                      💡 {t.recReasonPrompt}
                    </span>
                    <p className="font-sans text-[11px] leading-normal line-clamp-3 opacity-90">
                      {rec.reason}
                    </p>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="mt-auto pt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
                  <span>View Details Specs</span>
                  <ArrowRight className="h-3 w-3" />
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
