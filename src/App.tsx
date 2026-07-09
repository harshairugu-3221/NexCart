import React, { useState, useEffect } from 'react';
import { Package, HelpCircle, ShieldAlert, ArrowLeftRight } from 'lucide-react';

import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard';
import AdminAnalytics from './components/AdminAnalytics';
import RecommendationEngine from './components/RecommendationEngine';
import SidebarFilters from './components/SidebarFilters';
import ProductComparison from './components/ProductComparison';
import { Sliders, X as XIcon } from 'lucide-react';

import { Language, translations } from './localization';
import { Product, CartItem, User, Order, Notification } from './types';

// Seed initial values from localStorage helper safely
function getLocalState<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('LocalStorage parsing error:', err);
  }
  return defaultValue;
}

export default function App() {
  // Global setups
  const [currentLang, setCurrentLang] = useState<Language>(() => getLocalState('lang', 'en'));
  const [theme, setTheme] = useState<'light' | 'dark' | 'night'>(() => getLocalState('theme', 'dark'));
  const t = translations[currentLang];

  // Auth States
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  // Shopping States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => getLocalState('cart', []));
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<string[]>(() => getLocalState('browsingHistory', []));
  const [comparedProducts, setComparedProducts] = useState<Product[]>(() => getLocalState('comparedProducts', []));

  // Dynamic View Routing & Filters
  const [currentPage, setCurrentPage] = useState<string>('products'); // 'products', 'dashboard', 'analytics'
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom Sidebar Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState<boolean>(true);

  // Overlays / Overlays View Controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamic Activity Logger Helper
  const trackActivity = async (action: string, details: any = {}) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/activity', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, details })
      });
    } catch (err) {
      console.error('Failed to log client activity:', err);
    }
  };

  // Log product view activity
  useEffect(() => {
    if (selectedProduct) {
      trackActivity('view_product', { productId: selectedProduct.id, name: selectedProduct.name, category: selectedProduct.category });
    }
  }, [selectedProduct]);

  // Log product comparison
  useEffect(() => {
    if (comparedProducts.length > 0) {
      const delayDebounce = setTimeout(() => {
        trackActivity('compare_products', {
          productIds: comparedProducts.map(p => p.id),
          productNames: comparedProducts.map(p => p.name)
        });
      }, 1500);
      return () => clearTimeout(delayDebounce);
    }
  }, [comparedProducts]);

  // Log search queries
  useEffect(() => {
    if (searchQuery.trim()) {
      const delayDebounceFn = setTimeout(() => {
        trackActivity('search', { query: searchQuery.trim(), category: selectedCategory });
      }, 1500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, selectedCategory]);

  // Theme Sync on load / change
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    const root = document.documentElement;
    root.classList.remove('dark', 'night');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'night') {
      root.classList.add('dark', 'night');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', JSON.stringify(currentLang));
  }, [currentLang]);

  // Synchronize cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Synchronize browsing cookies
  useEffect(() => {
    localStorage.setItem('browsingHistory', JSON.stringify(browsingHistory));
  }, [browsingHistory]);

  // Synchronize compared products
  useEffect(() => {
    localStorage.setItem('comparedProducts', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  // Authenticate current active token
  useEffect(() => {
    if (!token) {
      setUser(null);
      setOrders([]);
      setNotifications([]);
      return;
    }

    localStorage.setItem('token', token);
    
    // Call server validation endpoint
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Identity expired');
        }
        return res.json();
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(() => {
        // Token is stale or invalid, clear keys
        setToken(null);
        localStorage.removeItem('token');
      });
  }, [token]);

  // Fetch product showcase
  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error extracting tech list:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle shared product links on mount or query parameter change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      const found = products.find(p => p.id === productId);
      if (found) {
        setSelectedProduct(found);
      } else {
        fetch(`/api/products/${productId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              setSelectedProduct(data);
            }
          })
          .catch(err => console.error('Error fetching product from share link:', err));
      }
    }
  }, [products]);

  // Periodically fetch orders & notifications of logged-in user
  const gatherCustomerData = () => {
    if (!token || !user) return;

    // Retrieve active orders list
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setOrders(data))
      .catch(err => console.error('Error fetching transactions:', err));

    // Retrieve active notifications list
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setNotifications(data))
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    gatherCustomerData();
    // Setup background polls for notifications
    const timer = setInterval(gatherCustomerData, 8000);
    return () => clearInterval(timer);
  }, [token, user]);

  // Auth success dispatcher
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    gatherCustomerData();
  };

  // Logout dispatcher
  const handleLogout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).finally(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        setOrders([]);
        setNotifications([]);
        setCurrentPage('products');
      });
    }
  };

  // Add Item to cart with stock validation
  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return;

    setCart(prev => {
      const matchIndex = prev.findIndex(item => item.product.id === product.id);
      if (matchIndex !== -1) {
        const item = prev[matchIndex];
        if (item.quantity >= product.stock) {
          // Can't purchase more than actual stock
          return prev;
        }
        const updated = [...prev];
        updated[matchIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });

    trackActivity('add_to_cart', { productId: product.id, name: product.name, price: product.price });
  };

  // Manage Cart Quantities
  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const item = cart.find(i => i.product.id === productId);

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          return { ...item, quantity: qty > maxStock ? maxStock : qty };
        }
        return item;
      });
    });

    if (item) {
      trackActivity('update_cart_quantity', { productId, name: item.product.name, quantity: qty });
    }
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    setCart(prev => prev.filter(item => item.product.id !== productId));
    if (item) {
      trackActivity('remove_from_cart', { productId, name: item.product.name });
    }
  };

  // Auth Modal trigger
  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  // Successful Cart Purchase callback
  const handleCheckoutSuccess = (order: Order) => {
    setCart([]);
    setIsCartOpen(false);
    fetchProducts(); // refresh products to update remaining stock levels!
    gatherCustomerData();
    setCurrentPage('dashboard'); // route directly to dashboard with active tracker!
  };

  // Admin order status update trigger
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    if (!token) return;

    fetch(`/api/orders/${orderId}/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error('Action failed');
        return res.json();
      })
      .then(() => {
        gatherCustomerData();
      })
      .catch(err => console.error('Order state update issue:', err));
  };

  // Selection of details product -> tracks browsing history
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    
    // Add to history if not exists, and limit to top 8 items to prevent prompt overflow
    setBrowsingHistory(prev => {
      const filtered = prev.filter(id => id !== product.id);
      return [product.id, ...filtered].slice(0, 8);
    });
  };

  // Mark all user notifications as read
  const handleMarkNotificationsRead = () => {
    if (!token) return;
    fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).finally(() => {
      gatherCustomerData();
    });
  };

  // Clean browsing history
  const handleClearHistory = () => {
    setBrowsingHistory([]);
  };

  // Toggle comparison state handler
  const handleToggleCompare = (product: Product) => {
    setComparedProducts(prev => {
      const isAlreadyCompared = prev.some(p => p.id === product.id);
      if (isAlreadyCompared) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return prev; // Limit max 4 products
      }
      return [...prev, product];
    });
  };

  // Add individual product to comparison
  const handleAddCompared = (product: Product) => {
    setComparedProducts(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

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

  // Filter products list on client-side dynamically based on sidebar criteria
  const filteredProducts = products.filter(p => {
    // 1. Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const featureMatch = p.features && p.features.some((f: string) => f.toLowerCase().includes(q));
      if (!nameMatch && !descMatch && !featureMatch) {
        return false;
      }
    }

    // 3. Price range filter
    if (p.price < priceRange[0] || p.price > priceRange[1]) {
      return false;
    }

    // 4. Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(getProductBrand(p))) {
      return false;
    }

    // 5. Minimum rating filter
    if (p.rating < minRating) {
      return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 1000000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSearchQuery('');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'night' 
        ? 'bg-black text-zinc-100' 
        : theme === 'dark' 
          ? 'bg-zinc-950 text-zinc-100' 
          : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      {/* Dynamic Header toolbar block */}
      <Header
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
        theme={theme}
        onToggleTheme={() => {
          setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'night';
            return 'light';
          });
        }}
        user={user}
        cart={cart}
        notifications={notifications}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSelectPage={setCurrentPage}
        currentPage={currentPage}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onToggleFilters={() => {
          if (currentPage !== 'products') {
            setShowDesktopFilters(true);
            setMobileFiltersOpen(true);
            setCurrentPage('products');
          } else {
            if (window.innerWidth >= 1024) {
              setShowDesktopFilters(prev => !prev);
            } else {
              setMobileFiltersOpen(prev => !prev);
            }
          }
        }}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {currentPage === 'products' && (
          <div className="space-y-8">
            
            {/* Immersive AI recommendation section */}
            <RecommendationEngine
              currentLang={currentLang}
              browsingHistory={browsingHistory}
              products={products}
              onSelectProduct={handleSelectProduct}
              onClearHistory={handleClearHistory}
              theme={theme}
            />

            {/* Top Filter Panel - Aligned full width at the top of the catalog page */}
            {showDesktopFilters && (
              <div className="hidden lg:block w-full animate-fade-in">
                <SidebarFilters
                  currentLang={currentLang}
                  products={products}
                  selectedCategory={selectedCategory}
                  onChangeCategory={setSelectedCategory}
                  priceRange={priceRange}
                  onChangePriceRange={setPriceRange}
                  selectedBrands={selectedBrands}
                  onChangeBrands={setSelectedBrands}
                  minRating={minRating}
                  onChangeMinRating={setMinRating}
                  onResetFilters={handleResetFilters}
                />
              </div>
            )}

            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-850">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <Sliders className="h-3.5 w-3.5" />
                Show Filter Options
              </button>
              <span className="font-mono text-[10px] tracking-widest text-zinc-450 dark:text-zinc-500 uppercase font-black">
                {filteredProducts.length} Items found
              </span>
            </div>

            {/* Mobile Sidebar/Drawer Overlay */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 flex justify-end lg:hidden animate-fade-in">
                <div
                  className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                
                <div className="relative w-80 max-w-full bg-zinc-50 dark:bg-zinc-950 h-full p-5 overflow-y-auto shadow-2xl flex flex-col gap-4 animate-slide-in z-50">
                  <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-900">
                    <h4 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-550 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-blue-600" /> Filter Options
                    </h4>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-1 rounded-md text-zinc-450 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <SidebarFilters
                    currentLang={currentLang}
                    products={products}
                    selectedCategory={selectedCategory}
                    onChangeCategory={(cat) => {
                      setSelectedCategory(cat);
                      setMobileFiltersOpen(false); // Snappier on choosing a category
                    }}
                    priceRange={priceRange}
                    onChangePriceRange={setPriceRange}
                    selectedBrands={selectedBrands}
                    onChangeBrands={setSelectedBrands}
                    minRating={minRating}
                    onChangeMinRating={setMinRating}
                    onResetFilters={handleResetFilters}
                  />
                </div>
              </div>
            )}

            {/* General Showcase listing grid / Main block */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
                <h3 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-500">
                  🎯 Electronics Catalog ({filteredProducts.length} filtered from {products.length})
                </h3>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="py-24 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/20">
                  <Package className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="font-mono text-xs text-zinc-400 dark:text-zinc-650">No tech components match specified filter parameters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currentLang={currentLang}
                      onAddToCart={handleAddToCart}
                      onSelectProduct={handleSelectProduct}
                      theme={theme}
                      comparedProducts={comparedProducts}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="space-y-4">
            <div className="border-b pb-3 mb-6 border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-500">
                ⭐ {t.customerCabinet}
              </h3>
              <button onClick={() => setCurrentPage('products')} className="text-xs font-bold text-blue-600 hover:underline">
                ← {t.backToProducts}
              </button>
            </div>
            
            <CustomerDashboard
              user={user}
              orders={orders}
              currentLang={currentLang}
            />
          </div>
        )}

        {currentPage === 'analytics' && (
          <div className="space-y-4">
            <div className="border-b pb-3 mb-6 border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-500">
                🛡️ Admin Workspace Analytics
              </h3>
              <button onClick={() => setCurrentPage('products')} className="text-xs font-bold text-blue-600 hover:underline">
                ← {t.backToProducts}
              </button>
            </div>
            
            <AdminAnalytics
              currentLang={currentLang}
              userToken={token}
              orders={orders}
              products={products}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

        {currentPage === 'compare' && (
          <div className="space-y-4">
            <div className="border-b pb-3 mb-6 border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-sans text-xs font-black uppercase tracking-widest text-zinc-500">
                🔄 Product Comparison Matrix
              </h3>
              <button onClick={() => setCurrentPage('products')} className="text-xs font-bold text-blue-600 hover:underline">
                ← {t.backToProducts}
              </button>
            </div>
            
            <ProductComparison
              comparedProducts={comparedProducts}
              allProducts={products}
              currentLang={currentLang}
              onRemoveCompared={(id) => setComparedProducts(prev => prev.filter(p => p.id !== id))}
              onClearCompared={() => setComparedProducts([])}
              onAddToCart={handleAddToCart}
              onSelectProduct={handleSelectProduct}
              onAddCompared={handleAddCompared}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white/50 py-8 dark:border-zinc-900 dark:bg-zinc-950/20 text-center font-mono text-[9px] text-zinc-400 tracking-wider">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NexCart Inc. {t.brand} is registered for AI Studio.</p>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer">Security Standards</span>
            <span className="hover:text-blue-600 cursor-pointer">API Integration Docs</span>
            <span className="hover:text-blue-600 cursor-pointer">Logistics Terminal</span>
          </div>
        </div>
      </footer>

      {/* MODALS DRAWERS */}
      
      {/* 1. Detail Overlay */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currentLang={currentLang}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          user={user}
          token={token}
          userOrders={orders}
          onReviewPosted={(updatedProduct) => {
            // Update the products array in local react state so the catalog changes instantly
            setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            // Keep the active detailed product state up-to-date with new review contents
            setSelectedProduct(updatedProduct);
          }}
          allProducts={products}
          onSelectProduct={handleSelectProduct}
          theme={theme}
        />
      )}

      {/* 2. Cart & Payment Gate overlay */}
      {isCartOpen && (
        <CheckoutModal
          cart={cart}
          currentLang={currentLang}
          onClose={() => setIsCartOpen(false)}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onCheckoutSuccess={handleCheckoutSuccess}
          userToken={token}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 3. Authentication Overlay */}
      {isAuthOpen && (
        <AuthModal
          currentLang={currentLang}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Floating Comparison Drawer */}
      {comparedProducts.length > 0 && currentPage !== 'compare' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-45 bg-zinc-950 border border-zinc-850 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl px-5 py-3.5 flex items-center gap-6 animate-slide-up w-[92%] max-w-2xl backdrop-blur-md bg-zinc-950/95">
          <div className="flex items-center gap-2 border-r border-zinc-850 pr-4">
            <ArrowLeftRight className="h-4 w-4 text-blue-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-sans text-[11px] font-black uppercase tracking-wider text-zinc-100">Compare Grid</span>
              <span className="font-mono text-[9px] text-zinc-500">{comparedProducts.length} of 4 chosen</span>
            </div>
          </div>
          
          {/* Thumbnails list */}
          <div className="flex items-center gap-2.5 overflow-x-auto flex-1 py-1">
            {comparedProducts.map(p => (
              <div key={p.id} className="relative h-11 w-11 rounded-lg overflow-hidden border border-zinc-850 shrink-0 group">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => setComparedProducts(prev => prev.filter(item => item.id !== p.id))}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-rose-400 transition-opacity cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {/* Slot empty placeholders */}
            {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
              <div key={idx} className="h-11 w-11 rounded-lg border border-dashed border-zinc-850 flex items-center justify-center text-zinc-700 text-xs shrink-0 select-none">
                +
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('compare')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
            >
              Compare Now
            </button>
            <button
              onClick={() => setComparedProducts([])}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Clear all"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
