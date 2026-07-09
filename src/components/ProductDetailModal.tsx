import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Check, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Calendar, 
  UserCheck, 
  Twitter, 
  Mail, 
  Link, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  ShoppingCart, 
  HelpCircle,
  TrendingUp,
  Truck,
  RotateCcw,
  Sliders,
  Scale
} from 'lucide-react';
import { Product, User, Order } from '../types';
import ProductImage from './ProductImage';
import { Language, translations } from '../localization';

interface ProductDetailModalProps {
  product: Product;
  currentLang: Language;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  user: User | null;
  token: string | null;
  userOrders: Order[];
  onReviewPosted: (updatedProduct: Product) => void;
  allProducts?: Product[];
  onSelectProduct?: (p: Product) => void;
  theme?: 'light' | 'dark' | 'night';
}

export default function ProductDetailModal({
  product,
  currentLang,
  onClose,
  onAddToCart,
  user,
  token,
  userOrders,
  onReviewPosted,
  allProducts = [],
  onSelectProduct,
  theme = 'light'
}: ProductDetailModalProps) {
  const t = translations[currentLang];
  const isOutOfStock = product.stock === 0;

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  // Review states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync / Reset view state when selected product changes
  useEffect(() => {
    const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
    setActiveImage(gallery[0]);
    setRating(5);
    setComment('');
    setSuccessMessage(null);
    setErrorMessage(null);
    setCopiedLink(false);

    // Scroll fullscreen detailed container to top
    const container = document.getElementById('product-detail-fullscreen-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product.id]);

  // Verify that this user purchased this item via past transaction orders list
  const hasPurchased = user && userOrders && userOrders.some(order =>
    order.items.some((item: any) => item.productId === product.id)
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!comment.trim()) {
      setErrorMessage('Please enter your review text comments.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback reviews');
      }

      setSuccessMessage('Thank you! Your feedback has been successfully posted.');
      setComment('');
      setRating(5);
      onReviewPosted(data.product);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while posting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviews = product.reviews || [];

  // Generate related product suggestions
  const categorySuggestions = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Fallback to top rated items if category suggestions are insufficient
  const finalSuggestions = categorySuggestions.length < 4
    ? categorySuggestions.concat(
        allProducts.filter(p => p.id !== product.id && p.category !== product.category)
      ).slice(0, 4)
    : categorySuggestions;

  // Theme styling definitions for ProductDetailModal
  const containerThemeStyles = {
    light: 'bg-zinc-50 text-zinc-900',
    dark: 'bg-zinc-950 text-zinc-100',
    night: 'bg-[#050508] text-zinc-200'
  };

  const barThemeStyles = {
    light: 'bg-white/95 border-zinc-200 text-zinc-900',
    dark: 'bg-zinc-950/95 border-zinc-850 text-zinc-100',
    night: 'bg-[#050508]/95 border-zinc-900/80 text-zinc-200'
  };

  const cardThemeStyles = {
    light: 'bg-white border-zinc-200/85 text-zinc-900 shadow-sm',
    dark: 'bg-zinc-900/70 border-zinc-850 text-zinc-100 shadow-xl',
    night: 'bg-[#09090e] border-zinc-900/90 text-zinc-200 shadow-[0_0_15px_rgba(59,130,246,0.08)]'
  };

  const stageThemeStyles = {
    light: 'bg-zinc-50 border-zinc-200',
    dark: 'bg-zinc-950 border-zinc-850',
    night: 'bg-black border-zinc-900/60'
  };

  const badgeThemeStyles = {
    light: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-850',
    dark: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200',
    night: 'bg-black border border-zinc-900 hover:bg-zinc-950 text-zinc-350'
  };

  const textSecondaryThemeStyles = {
    light: 'text-zinc-650',
    dark: 'text-zinc-400',
    night: 'text-zinc-450'
  };

  const textMutedThemeStyles = {
    light: 'text-zinc-400',
    dark: 'text-zinc-500',
    night: 'text-zinc-600'
  };

  const borderThemeStyles = {
    light: 'border-zinc-150',
    dark: 'border-zinc-850',
    night: 'border-zinc-900/60'
  };

  const selectTheme = theme === 'night' ? 'night' : theme === 'dark' ? 'dark' : 'light';

  return (
    <div 
      id="product-detail-fullscreen-container"
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col animate-fade-in scroll-smooth transition-all duration-300 ${containerThemeStyles[selectTheme]}`}
    >
      
      {/* Dynamic Sticky Top Bar Navigation */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3.5 sm:px-6 flex items-center justify-between shadow-xs transition-all duration-300 ${barThemeStyles[selectTheme]}`}>
        
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${badgeThemeStyles[selectTheme]}`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalogue</span>
        </button>

        <div className="hidden md:flex flex-col items-center">
          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-blue-600">
            {product.category} Section
          </span>
          <span className="font-sans text-xs font-black max-w-sm truncate">
            {product.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 dark:bg-amber-500/5 px-2.5 py-1 rounded-lg">
            <Star className="h-3.5 w-3.5 fill-amber-500 shrink-0" />
            <span>{product.rating} Rating</span>
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-150/30 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      </div>

      {/* Main Fullscreen Workspace Content Wrapper */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        
        {/* Upper Hero Panel: Gallery & Actions layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Image Showcases */}
          <div className={`lg:col-span-7 flex flex-col gap-4 p-6 rounded-3xl border transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
            
            <div className={`relative aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center overflow-hidden rounded-2xl border p-6 group select-none shadow-inner transition-all duration-300 ${stageThemeStyles[selectTheme]}`}>
              
              <ProductImage
                src={activeImage}
                name={product.name}
                category={product.category}
                productId={product.id}
                className="h-full max-h-[380px] w-full object-contain rounded-lg transition-transform duration-350 group-hover:scale-[1.03]"
              />

              {/* Angle Index Label overlay */}
              <div className="absolute bottom-4 right-4 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[9px] font-mono tracking-widest text-zinc-200 uppercase backdrop-blur-xs">
                Angle {galleryImages.indexOf(activeImage) + 1} / {galleryImages.length}
              </div>

              {/* Interactive Category Badge overlay */}
              <span className="absolute left-4 top-4 rounded-md bg-blue-600 px-2 py-0.5 text-[8px] font-mono tracking-wider text-white uppercase font-bold">
                {product.category}
              </span>

            </div>

            {/* Micro Gallery Thumbnails list */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 py-1">
                {galleryImages.map((img, idx) => {
                  const isActive = img === activeImage;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative aspect-square overflow-hidden rounded-xl border transition-all duration-200 p-2 group hover:border-blue-500 ${stageThemeStyles[selectTheme]} ${
                        isActive 
                          ? 'border-2 border-blue-600 scale-[1.02] shadow-sm shadow-blue-500/20' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ProductImage
                        src={img}
                        name={`${product.name} layout option ${idx + 1}`}
                        category={product.category}
                        productId={product.id}
                        className="h-full w-full object-contain rounded-lg"
                      />
                      <span className="absolute bottom-1 right-1 bg-zinc-900/60 dark:bg-zinc-800/80 text-[6.5px] font-mono font-bold text-zinc-100 px-1 py-0.5 rounded scale-90">
                        {idx === 0 ? 'FRONT' : idx === 1 ? 'SIDE' : idx === 2 ? 'DETAIL' : 'ANGLE'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
              <Sliders className="h-3 w-3" />
              <span>Click miniature slides to select specific product angles</span>
            </div>

          </div>

          {/* Right Block: Shopping controls, features, specifications snapshot */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 font-mono">
                  NexCart Certified Tech
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                  Guaranteed Authentic
                </span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-200 dark:text-zinc-800'}`} 
                    />
                  ))}
                  <span className="ml-1 text-zinc-850 dark:text-zinc-200 font-bold">{product.rating}</span>
                </div>
                <span className="text-zinc-350 dark:text-zinc-800">|</span>
                <span className={`text-xs font-semibold ${textSecondaryThemeStyles[selectTheme]}`}>
                  {reviews.length} Customer Reviews
                </span>
              </div>
            </div>

            {/* Price block & stock status */}
            <div className={`p-6 rounded-3xl border space-y-4 shadow-xs transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Best Price Offer</span>
                  <span className="font-sans text-3xl font-black text-blue-650 dark:text-blue-400">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                {isOutOfStock ? (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
                    ⚠️ Sold Out
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-55 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                    ✓ {product.stock} Units In Stock
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                  className="w-full cursor-pointer py-3.5 px-6 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 disabled:dark:bg-zinc-850 disabled:text-zinc-400 dark:disabled:text-zinc-650 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-blue-500/10 active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isOutOfStock ? t.outOfStock : 'Add to Cart / Deploy Order'}
                </button>
              </div>

              {/* Warranty & trust indicators */}
              <div className={`grid grid-cols-3 gap-3 pt-4 border-t text-center font-sans text-[10px] transition-colors duration-300 ${borderThemeStyles[selectTheme]} text-zinc-500 dark:text-zinc-450`}>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="font-bold">1 Year Warranty</span>
                  <span className="text-[8px] opacity-75">Full Tech Protection</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span className="font-bold">Priority Shipping</span>
                  <span className="text-[8px] opacity-75">Dispatched in 24h</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                  <span className="font-bold">7-Day Returns</span>
                  <span className="text-[8px] opacity-75">No-hassle Refund</span>
                </div>
              </div>

            </div>

            {/* Description Card */}
            <div className="space-y-2">
              <h3 className="font-sans text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                Product Summary
              </h3>
              <p className={`font-sans text-xs leading-relaxed ${textSecondaryThemeStyles[selectTheme]}`}>
                {product.description}
              </p>
            </div>

            {/* Bullet features list */}
            <div className="space-y-2.5">
              <h3 className="font-sans text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                Key Features & Highlights
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-tight">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className={textSecondaryThemeStyles[selectTheme]}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social media share widget */}
            <div className={`border rounded-2xl p-4.5 space-y-3 transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                📢 Share Product Matrix
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out the incredible specifications of the ${product.name}! 🚀`)}&url=${encodeURIComponent(window.location.origin + '/?product=' + product.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-102 cursor-pointer ${badgeThemeStyles[selectTheme]}`}
                >
                  <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                  <span>X / Twitter</span>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Tech Product Recommendation: ${product.name}`)}&body=${encodeURIComponent(`Hi there,\n\nI highly recommend looking at the specifications for the ${product.name}:\n\n${product.name}\n${product.description}\n\nPrice: ₹${product.price.toLocaleString('en-IN')}\n\nCheck out the full specifications and customer reviews here:\n${window.location.origin}/?product=${product.id}`)}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-102 cursor-pointer ${badgeThemeStyles[selectTheme]}`}
                >
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span>Email Details</span>
                </a>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?product=${product.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-102 cursor-pointer ${badgeThemeStyles[selectTheme]}`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Spec Sheet (Technical Ledger) */}
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-4">
            <Sliders className="h-5 w-5 text-blue-500" />
            <div>
              <h2 className="font-sans text-sm font-black uppercase tracking-widest">
                Technical Ledger & Blueprint Specs
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Comprehensive parameters for {product.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-[11px]">
            {Object.entries(product.specs).map(([key, value]) => (
              <div 
                key={key} 
                className={`flex flex-col gap-1.5 p-4 rounded-xl border hover:border-blue-500/40 transition-all duration-300 ${stageThemeStyles[selectTheme]}`}
              >
                <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  {key}
                </span>
                <span className="font-black text-xs">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Ledger: Submit verified Review + list past reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form left */}
          <div className={`lg:col-span-1 p-6 rounded-3xl border transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
            {hasPurchased ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h4 className="font-sans text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  Verified Buyer Feedback
                </h4>
                <p className={`font-sans text-[10px] leading-normal ${textSecondaryThemeStyles[selectTheme]}`}>
                  Write your verified owner review comments for {product.name} below.
                </p>

                {successMessage && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-sans font-medium flex items-start gap-2.5 border border-emerald-500/10">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-sans font-medium flex items-start gap-2.5 border border-rose-500/10">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Rating Score</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(null)}
                          className="cursor-pointer focus:outline-none transition-transform active:scale-95 duration-100"
                        >
                          <Star
                            className={`h-6 w-6 transition-all ${
                              hoveredStar !== null
                                ? star <= hoveredStar
                                  ? 'text-amber-450 fill-amber-450'
                                  : 'text-zinc-200 dark:text-zinc-800'
                                : star <= rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-zinc-200 dark:text-zinc-800'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Your Experience Comments</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your practical tech feedback. Does it live up to specifications?"
                      className="w-full text-xs rounded-xl border border-zinc-250 bg-white p-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-blue-500/30 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:dark:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 shadow-md shadow-blue-500/10 transition-all active:scale-98"
                  >
                    {isSubmitting ? (
                      'Posting review details...'
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className={`rounded-2xl border border-dashed p-6 space-y-3 ${stageThemeStyles[selectTheme]}`}>
                <h5 className="font-sans text-xs font-black flex items-center gap-1.5 uppercase tracking-wide">
                  🔒 Feedback Locked
                </h5>
                <p className="font-sans text-[11px] leading-relaxed">
                  {!user ? (
                    'An active customer session is required to leave verified feedback. Sign in, order this item, and verify ownership to unlock reviews.'
                  ) : (
                    'Verified product purchase is required. Order this high-spec tech component first to unlock evaluation writes.'
                  )}
                </p>
              </div>
            )}
          </div>

          {/* List reviews right */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className={`py-16 text-center rounded-3xl border border-dashed ${stageThemeStyles[selectTheme]}`}>
                <MessageSquare className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h5 className="font-sans text-xs font-bold mb-1">No reviews yet</h5>
                <p className="font-sans text-[11px] text-zinc-500">Be the first verified customer representing this tech item to share feedback!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-250 dark:scrollbar-thumb-zinc-800">
                {reviews.slice().reverse().map((rev) => (
                  <div key={rev.id} className={`rounded-2xl border p-5 shadow-xs space-y-3 transition-all duration-300 ${cardThemeStyles[selectTheme]}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100/50 dark:bg-zinc-850 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs shadow-inner uppercase">
                          {rev.userName ? rev.userName.slice(0, 2) : 'US'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-black flex items-center gap-1.5 flex-wrap">
                            {rev.userName}
                            <span className="bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider border border-emerald-550/10 leading-none">
                              Verified Buyer
                            </span>
                          </span>
                          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-200 dark:text-zinc-850'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={`font-sans text-xs leading-relaxed pl-10 ${textSecondaryThemeStyles[selectTheme]}`}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SMART PRODUCT RECOMMENDATIONS & ALTERNATIVES */}
        <div className="border-t border-zinc-200 dark:border-zinc-850 pt-10 mt-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                <h3 className="font-sans text-sm font-black uppercase tracking-widest">
                  Suggested Tech Alternatives
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Smart recommendations based on Category: {product.category}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">Related Tech Spectrum</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {finalSuggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectProduct?.(item)}
                className={`group relative cursor-pointer flex flex-col justify-between border hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${cardThemeStyles[selectTheme]}`}
              >
                
                {/* Image Stage */}
                <div className={`relative aspect-square w-full rounded-xl p-3 mb-4 flex items-center justify-center overflow-hidden border ${stageThemeStyles[selectTheme]}`}>
                  <ProductImage
                    src={item.image}
                    name={item.name}
                    category={item.category}
                    productId={item.id}
                    className="h-full max-h-[120px] w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-zinc-150 dark:bg-zinc-800 px-1.5 py-0.5 text-[7px] font-mono text-zinc-500 dark:text-zinc-450 uppercase font-black">
                    {item.category}
                  </span>
                </div>

                {/* Info & Price */}
                <div className="space-y-1 mb-4 flex-1">
                  <h4 className="font-sans text-xs font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                    <Star className="h-3 w-3 fill-amber-500 shrink-0" />
                    <span>{item.rating}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-blue-650 dark:text-blue-400 block pt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Compact Actions footer */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850/60">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct?.(item);
                    }}
                    className={`w-full py-2 px-2 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center ${badgeThemeStyles[selectTheme]}`}
                  >
                    Inspect
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    disabled={item.stock === 0}
                    className="w-full py-2 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 disabled:dark:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-[10px] font-black tracking-wide uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="h-2.5 w-2.5 shrink-0" />
                    <span>Buy</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Fullscreen view bottom footer */}
      <div className={`border-t bg-white/40 dark:bg-zinc-950/20 py-6 mt-8 text-center font-mono text-[9px] text-zinc-400 tracking-wider transition-colors duration-300 ${borderThemeStyles[selectTheme]}`}>
        <p>© 2026 NexCart Inc. Premium Fullscreen Specifications Terminal for AI Studio.</p>
      </div>

    </div>
  );
}
