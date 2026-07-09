import React, { useState, useEffect } from 'react';
import { Package, Truck, Compass, CheckCircle2, Search, ArrowRight, Route, Clock, ClipboardList, Settings, RefreshCw, Zap, User as UserIcon, Shield, Sliders, Save, CreditCard, BellRing, Globe, Phone, MapPin, Check, AlertCircle, Trash2, Fingerprint, History } from 'lucide-react';
import { Order, User } from '../types';
import { Language, translations } from '../localization';

interface CustomerDashboardProps {
  user: User | null;
  orders: Order[];
  currentLang: Language;
}

interface TrackDetail {
  trackingNumber: string;
  carrier: string;
  latestUpdate: string;
  route: { label: string; time: string; detail: string; geo: string }[];
}

export default function CustomerDashboard({ user, orders, currentLang }: CustomerDashboardProps) {
  const t = translations[currentLang];

  const authRequiredMsg = {
    en: 'Please authenticate to see your customer profile cabinet.',
    es: 'Por favor, autentíquese para ver su perfil de cliente.',
    fr: 'Veuillez vous authentifier pour voir votre profil client.',
    de: 'Bitte melden Sie sich an, um Ihr Kundenprofil zu sehen.',
    ja: '顧客プロフィールを表示するにはログインしてください。',
    te: 'మీ కస్టమర్ ప్రొఫైల్ క్యాబినెట్ చూడటానికి దయచేసి లాగిన్ అవ్వండి.',
    hi: 'अपने ग्राहक प्रोफ़ाइल कैबिनेट को देखने के लिए कृपया प्रमाणित करें।',
    ta: 'உங்களது வரலாற்றை காண தயவுசெய்து உள்நுழையவும்.'
  }[currentLang] || 'Please authenticate to see your customer profile cabinet.';

  const transactionHistoryTitle = {
    en: '📜 Transaction History',
    es: '📜 Historial de Transacciones',
    fr: '📜 Historique des Transactions',
    de: '📜 Transaktionsverlauf',
    ja: '📜 取引履歴',
    te: '📜 లావాదేవీల చరిత్ర',
    hi: '📜 लेनदेन का इतिहास',
    ta: '📜 பரிவர்த்தனை வரலாறு'
  }[currentLang] || '📜 Transaction History';

  const activeRecoupText = {
    en: 'ACTIVE RECOUP',
    es: 'REINTEGRO ACTIVO',
    fr: 'RECOUVREMENT ACTIF',
    de: 'AKTIVER RÜCKGEWINN',
    ja: 'アクティブ・リカバリー',
    te: 'యాక్టివ్ రికూప్',
    hi: 'सक्रिय पुनः प्राप्ति',
    ta: 'செயலில் உள்ள மீட்பு'
  }[currentLang] || 'ACTIVE RECOUP';

  const itemsPurchasedTitle = {
    en: 'Items Purchased',
    es: 'Artículos Comprados',
    fr: 'Articles Achetés',
    de: 'Gekaufte Artikel',
    ja: '購入済みの商品',
    te: 'కొనుగోలు చేసిన వస్తువులు',
    hi: 'खरीदे गए उत्पाद',
    ta: 'வாங்கப்பட்ட பொருட்கள்'
  }[currentLang] || 'Items Purchased';

  const grossTotalLabel = {
    en: 'Gross Total',
    es: 'Total Bruto',
    fr: 'Total Brut',
    de: 'Bruttobetrag',
    ja: '総計（税込）',
    te: 'మొత్తం ధర',
    hi: 'कुल राशि',
    ta: 'மொத்த தொகை'
  }[currentLang] || 'Gross Total';

  const carrierLabel = {
    en: 'Carrier',
    es: 'Transportista',
    fr: 'Transporteur',
    de: 'Spediteur',
    ja: '配送業者',
    te: 'క్యారియర్ (రవాణాదారు)',
    hi: 'वाहक',
    ta: 'கூரியர் நிறுவனம்'
  }[currentLang] || 'Carrier';

  const trackingNumberLabel = {
    en: 'Tracking Number',
    es: 'Número de Seguimiento',
    fr: 'Numéro de Suivi',
    de: 'Sendungsverfolgungsnummer',
    ja: '追跡番号',
    te: 'ట్రాకింగ్ నంబర్',
    hi: 'ट्रैकिंग नंबर',
    ta: 'டிராக்கிங் எண்'
  }[currentLang] || 'Tracking Number';

  const recipientAddressLabel = {
    en: 'Recipient Address',
    es: 'Dirección del Destinatario',
    fr: 'Adresse du Destinataire',
    de: 'Empfängeradresse',
    ja: 'お届け先住所',
    te: 'స్వీకర్త చిరునామా',
    hi: 'प्राप्तकर्ता का पता',
    ta: 'பெறுநர் முகவரி'
  }[currentLang] || 'Recipient Address';

  const loadingTrackingTxt = {
    en: 'Consulting 3rd-party logistics servers...',
    es: 'Consultando servidores de logística externos...',
    fr: 'Consultation des serveurs logistiques tiers...',
    de: 'Abfrage des Drittanbieter-Logistikservers...',
    ja: '外部物流システムに照会中...',
    te: '3వ పక్ష లాజిస్టిక్స్ సర్వర్‌లను సంప్రదిస్తోంది...',
    hi: 'तृतीय-पक्ष रसद सर्वरों से परामर्श कर रहा है...',
    ta: 'கூரியர் சர்வரை தொடர்பு கொள்கிறது...'
  }[currentLang] || 'Consulting 3rd-party logistics servers...';

  const trackingErrorTxt = {
    en: 'Logistics terminal unreachable.',
    es: 'Terminal de logística inaccesible.',
    fr: 'Terminal logistique inaccessible.',
    de: 'Logistikterminal nicht erreichbar.',
    ja: '物流ターミナルに接続できませんでした。',
    te: 'లాజిస్టిక్స్ టర్మినల్ అందుబాటులో లేదు.',
    hi: 'रसद टर्मिनल पहुंच से बाहर है।',
    ta: 'கூரியர் சர்வர் இயங்கவில்லை.'
  }[currentLang] || 'Logistics terminal unreachable.';

  const selectOrderPrompt = {
    en: 'Showcase transactional tracking updates. Select order...',
    es: 'Muestra actualizaciones de seguimiento. Seleccione una compra...',
    fr: 'Afficher les mises à jour logistiques. Choisissez une commande...',
    de: 'Sendungsverfolgungsdetails anzeigen. Wählen Sie eine Bestellung aus...',
    ja: '注文を選択すると、配送の追跡状況がここに表示されます。',
    te: 'ట్రాకింగ్ వివరాలను చూడటానికి ఆర్డర్‌ను ఎంచుకోండి...',
    hi: 'लेनदेन ट्रैकिंग अपडेट दिखाएं। ऑर्डर चुनें...',
    ta: 'விபரங்களைக் காண ஆர்டரைத் தேர்ந்தெடுக்கவும்...'
  }[currentLang] || 'Showcase transactional tracking updates. Select order...';

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackInfo, setTrackInfo] = useState<TrackDetail | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // Simulation & GPS Telemetry states
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, string>>({});
  const [pollingGps, setPollingGps] = useState<Record<string, boolean>>({});
  const [gpsTelemetry, setGpsTelemetry] = useState<Record<string, string>>({});
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<'logistics' | 'profile' | 'settings' | 'activity'>('logistics');
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Sync client-side activities with backend database when 'activity' tab is selected
  useEffect(() => {
    if (activeTab === 'activity' && user) {
      setLoadingActivities(true);
      const token = localStorage.getItem('token');
      fetch('/api/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthenticated');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setActivities(data);
          }
        })
        .catch(err => console.error('Error fetching activities:', err))
        .finally(() => setLoadingActivities(false));
    }
  }, [activeTab, user]);

  // Profile fields (lazily hydrated from localStorage if present)
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('profile_name') || user?.name || '';
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    return localStorage.getItem('profile_phone') || '+91 98765 43210';
  });
  const [profileAddress, setProfileAddress] = useState(() => {
    return localStorage.getItem('profile_address') || '42, Tech Innovation Lane, Whitefield';
  });
  const [profileCity, setProfileCity] = useState(() => {
    return localStorage.getItem('profile_city') || 'Bengaluru';
  });
  const [profilePostalCode, setProfilePostalCode] = useState(() => {
    return localStorage.getItem('profile_postal_code') || '560066';
  });
  const [profileCountry, setProfileCountry] = useState(() => {
    return localStorage.getItem('profile_country') || 'India';
  });
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return localStorage.getItem('profile_avatar') || 'from-blue-600 to-indigo-600';
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Settings fields
  const [settingsNotifications, setSettingsNotifications] = useState(() => {
    return localStorage.getItem('settings_notifications') !== 'false';
  });
  const [settings2FA, setSettings2FA] = useState(() => {
    return localStorage.getItem('settings_2fa') === 'true';
  });
  const [settingsCarrier, setSettingsCarrier] = useState(() => {
    return localStorage.getItem('settings_carrier') || 'FedEx Priority';
  });
  const [settingsCurrency, setSettingsCurrency] = useState(() => {
    return localStorage.getItem('settings_currency') || 'INR';
  });
  const [settingsTelemetryOverlay, setSettingsTelemetryOverlay] = useState(() => {
    return localStorage.getItem('settings_telemetry') !== 'false';
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    setTimeout(() => {
      localStorage.setItem('profile_name', profileName);
      localStorage.setItem('profile_phone', profilePhone);
      localStorage.setItem('profile_address', profileAddress);
      localStorage.setItem('profile_city', profileCity);
      localStorage.setItem('profile_postal_code', profilePostalCode);
      localStorage.setItem('profile_country', profileCountry);
      localStorage.setItem('profile_avatar', profileAvatar);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedMsg('saving');

    setTimeout(() => {
      localStorage.setItem('settings_notifications', String(settingsNotifications));
      localStorage.setItem('settings_2fa', String(settings2FA));
      localStorage.setItem('settings_carrier', settingsCarrier);
      localStorage.setItem('settings_currency', settingsCurrency);
      localStorage.setItem('settings_telemetry', String(settingsTelemetryOverlay));

      setSettingsSavedMsg('success');
      setTimeout(() => setSettingsSavedMsg(null), 3000);
    }, 800);
  };

  useEffect(() => {
    // Select first order by default if visible
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders]);

  // Handle status simulation
  const handleSimulateStatus = (orderId: string, targetStatus: string) => {
    setSimulatedStatuses(prev => ({
      ...prev,
      [orderId]: targetStatus
    }));

    // Trigger a mock GPS telemetry update based on status
    let message = 'Telemetry Synced: Dispatch hub pending allocation.';
    if (targetStatus === 'processing') message = 'Telemetry Synced: Item packaging scanned at line A7.';
    if (targetStatus === 'shipped') message = 'Telemetry Synced: Van en-route at speed 52 km/h.';
    if (targetStatus === 'delivered') message = 'Telemetry Synced: Final doorstep confirmation OTP verified.';

    setGpsTelemetry(prev => ({
      ...prev,
      [orderId]: message
    }));
  };

  // Poll live GPS telemetry simulation
  const handlePollGps = (orderId: string) => {
    setPollingGps(prev => ({ ...prev, [orderId]: true }));
    
    // Simulate high-precision telemetry calculation
    setTimeout(() => {
      const cities = ['New Delhi Hub', 'Mumbai Transit Facility', 'Bengaluru Central Scan', 'Hyderabad Sorting Belt'];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const speed = Math.floor(Math.random() * 30) + 40;
      
      setGpsTelemetry(prev => ({
        ...prev,
        [orderId]: `Live Sat-GPS Lock: Vehicle parsed near ${randomCity} at ${speed} km/h. Signal Strong.`
      }));
      setPollingGps(prev => ({ ...prev, [orderId]: false }));
    }, 1200);
  };

  // Auto advancement game loop
  const toggleAutoAdvance = (orderId: string) => {
    const active = !isAutoAdvancing[orderId];
    setIsAutoAdvancing(prev => ({ ...prev, [orderId]: active }));

    if (active) {
      const order = orders.find(o => o.id === orderId);
      const current = simulatedStatuses[orderId] || (order?.status || 'pending');
      const seq = ['pending', 'processing', 'shipped', 'delivered'];
      let nextIdx = (seq.indexOf(current) + 1) % seq.length;

      // Start tick interval simulation
      const intervalId = setInterval(() => {
        setIsAutoAdvancing(curr => {
          if (!curr[orderId]) {
            clearInterval(intervalId);
            return curr;
          }
          
          handleSimulateStatus(orderId, seq[nextIdx]);
          nextIdx = (nextIdx + 1) % seq.length;
          return curr;
        });
      }, 3500);
    }
  };

  useEffect(() => {
    if (!selectedOrderId) {
      setTrackInfo(null);
      return;
    }
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order || !order.trackingNumber) {
      setTrackInfo(null);
      return;
    }

    setLoadingTrack(true);
    // Call 3rd party shipping mock API tracker
    fetch(`/api/shipping/track/${order.trackingNumber}`)
      .then(res => res.json())
      .then(data => {
        setTrackInfo(data);
      })
      .catch(err => console.error('Error tracking ship:', err))
      .finally(() => setLoadingTrack(false));
  }, [selectedOrderId, orders]);

  if (!user) {
    return (
      <div className="py-24 text-center text-zinc-400 dark:text-zinc-650 font-mono">
        {authRequiredMsg}
      </div>
    );
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Return completion score based on shipping status
  const getStatusPercent = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'processing': return 40;
      case 'shipped': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Tab bar header */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-900 overflow-x-auto scrollbar-none gap-1 pb-0.5">
        <button
          onClick={() => setActiveTab('logistics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'logistics'
              ? 'border-blue-600 text-blue-600 bg-blue-50/5 dark:bg-blue-950/5 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Logistics & Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 bg-blue-50/5 dark:bg-blue-950/5 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>My Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 bg-blue-50/5 dark:bg-blue-950/5 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>System Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 bg-blue-50/5 dark:bg-blue-950/5 font-extrabold'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Activity Audit Trail</span>
        </button>
      </div>

      {activeTab === 'logistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-2">
          
          {/* Column 1: Transaction Catalog List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-950">
              
              {/* User badge */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-5">
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg leading-none shrink-0 uppercase select-none">
                  {(profileName || user.name)[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-sans text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{profileName || user.name}</h3>
                  <p className="font-mono text-[10px] text-zinc-400">{user.email}</p>
                </div>
              </div>

              <h4 className="font-sans text-xs font-black uppercase text-zinc-500 tracking-wider mb-4">
                {transactionHistoryTitle}
              </h4>

              {orders.length === 0 ? (
                <p className="text-center font-mono text-xs text-zinc-400 dark:text-zinc-650 py-8">{t.noOrders}</p>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`cursor-pointer border p-3.5 rounded-lg flex flex-col gap-1 select-none transition-all ${selectedOrderId === o.id ? 'border-blue-600 bg-blue-550/5 dark:bg-blue-950/20' : 'border-slate-200 hover:bg-slate-50 dark:border-zinc-870 dark:hover:bg-zinc-900/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">{o.id}</span>
                        <span className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-50">₹{o.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400 font-sans">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        
                        {/* Tiny visual badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' : (o.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-500')}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Column 2 & 3: Selected transaction tracking board */}
          <div className="lg:col-span-2">
            {selectedOrder ? (() => {
              const activeStatus = simulatedStatuses[selectedOrder.id] || selectedOrder.status;
              const isAutoOn = isAutoAdvancing[selectedOrder.id] || false;
              const isGpsLoading = pollingGps[selectedOrder.id] || false;
              const latestGps = gpsTelemetry[selectedOrder.id] || 'GPS Signal Lock: In transit to sorting belt.';

              const getSimulatedRouteSteps = (allSteps: any[], status: string) => {
                switch (status) {
                  case 'pending':
                    return allSteps.slice(0, 1);
                  case 'processing':
                    return allSteps.slice(0, 2);
                  case 'shipped':
                    return allSteps.slice(0, 4);
                  case 'delivered':
                  default:
                    return allSteps;
                }
              };

              return (
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 space-y-6">
                  
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 pb-4 gap-4 dark:border-zinc-900">
                    <div>
                      <span className="font-mono text-[8px] text-zinc-400 tracking-widest uppercase">{activeRecoupText}</span>
                      <h3 className="font-sans text-base font-extrabold text-zinc-900 dark:text-zinc-50">{t.orderId}: {selectedOrder.id}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${activeStatus === 'delivered' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-600'}`}>
                        ● {activeStatus}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-mono font-bold dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400">
                        {selectedOrder.paymentMethod === 'cod' 
                          ? `📦 COD (${selectedOrder.paymentStatus.toUpperCase()})` 
                          : (selectedOrder.paymentMethod === 'upi' ? `📱 UPI (${selectedOrder.paymentStatus.toUpperCase()})` : `💳 CARD (${selectedOrder.paymentStatus.toUpperCase()})`)}
                      </span>
                    </div>
                  </div>

                  {/* Shopping Items recap summary */}
                  <div>
                    <h4 className="font-sans text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">
                      {itemsPurchasedTitle}
                    </h4>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-300">
                      {selectedOrder.items.map((item) => (
                        <div key={item.productId} className="flex justify-between py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold">x{item.quantity}</span>
                            <span>{item.name}</span>
                          </div>
                          <span>₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-sm pt-3 border-t text-zinc-900 dark:text-zinc-50">
                        <span>{grossTotalLabel}</span>
                        <span>₹{selectedOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logistics Status Progression tracker */}
                  <div className="space-y-6 pt-4 border-t border-zinc-150 dark:border-zinc-900">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-sans text-xs font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-blue-600" />
                        {t.shippingProgress}
                      </h4>
                      
                      {/* Micro controller sandbox tools */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAutoAdvance(selectedOrder.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase font-extrabold transition-all cursor-pointer ${isAutoOn ? 'bg-amber-500 text-white animate-pulse' : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400'}`}
                        >
                          <Zap className="h-2.5 w-2.5" />
                          <span>{isAutoOn ? 'Auto-Sim Live' : 'Auto-Sim Off'}</span>
                        </button>
                        <button
                          onClick={() => handlePollGps(selectedOrder.id)}
                          disabled={isGpsLoading}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase font-extrabold bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`h-2.5 w-2.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
                          <span>{isGpsLoading ? 'Locking GPS...' : 'Poll Live GPS'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Gps Log Indicator banner */}
                    {settingsTelemetryOverlay && (
                      <div className="rounded-xl bg-blue-50/40 border border-blue-100/50 p-3 text-[10px] font-mono text-blue-750 dark:bg-blue-950/10 dark:border-blue-900/30 dark:text-blue-300 flex items-center gap-2.5 transition-all">
                        <span className="relative flex h-2 w-2">
                          <span className={`absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${isGpsLoading ? 'animate-ping' : ''}`} />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <span className="flex-1 leading-normal">{latestGps}</span>
                      </div>
                    )}

                    {/* Graphical horizontal progression bar with click-to-simulate markers */}
                    <div className="relative w-full pt-4 pb-7">
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full dark:bg-zinc-900">
                        <div 
                          className="h-full bg-blue-650 rounded-full transition-all duration-700" 
                          style={{ width: `${getStatusPercent(activeStatus)}%` }}
                        />
                      </div>
                      {/* Interactive Milestone Checkpoints */}
                      <div className="absolute top-2 left-0 right-0 flex justify-between px-1.5">
                        {[
                          { key: 'pending', icon: ClipboardList, label: 'Pending' },
                          { key: 'processing', icon: Settings, label: 'Processing' },
                          { key: 'shipped', icon: Truck, label: 'Shipped' },
                          { key: 'delivered', icon: CheckCircle2, label: 'Delivered' }
                        ].map((chk, idx) => {
                          const isPassed = getStatusPercent(activeStatus) >= (idx * 30 + 10);
                          const IconComponent = chk.icon;
                          return (
                            <button 
                              key={chk.key} 
                              onClick={() => handleSimulateStatus(selectedOrder.id, chk.key)}
                              title={`Click to simulate: ${chk.label}`}
                              className="flex flex-col items-center gap-2 focus:outline-none group relative z-10 cursor-pointer"
                            >
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isPassed 
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20 scale-105' 
                                  : 'bg-white border-zinc-250 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-650'
                              }`}>
                                <IconComponent className="h-3 w-3" />
                              </div>
                              <span className={`font-mono text-[8px] uppercase font-black tracking-wide transition-colors ${
                                isPassed 
                                  ? 'text-blue-600 dark:text-blue-400 font-black' 
                                  : 'text-zinc-400 dark:text-zinc-600'
                              }`}>{chk.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-center font-mono text-[8px] text-zinc-400 uppercase tracking-widest pt-2">
                      💡 Tip: Click any milestone checkpoint circle to manually trigger shipment status updates
                    </div>

                    {/* Delivery Details info box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 font-sans text-xs dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900/60">
                      <div>
                        <span className="font-mono text-[9px] text-zinc-400 block uppercase tracking-wide">{carrierLabel}</span>
                        <span className="font-bold text-zinc-850 dark:text-zinc-200 mt-0.5 block">{selectedOrder.carrier}</span>
                        <span className="font-mono text-[9px] mt-2 text-zinc-400 block uppercase tracking-wide">{trackingNumberLabel}</span>
                        <span className="font-mono font-bold text-zinc-850 dark:text-zinc-200 mt-0.5 block">{selectedOrder.trackingNumber}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-zinc-400 block uppercase tracking-wide">{recipientAddressLabel}</span>
                        <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-normal">
                          <strong>{selectedOrder.shippingInfo.fullName}</strong><br />
                          {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}, {selectedOrder.shippingInfo.country}
                        </p>
                        <span className="font-mono text-[9px] text-zinc-400 block uppercase tracking-wide mt-2">{t.estimatedDelivery}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{new Date(selectedOrder.estimatedDelivery!).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Partner Integrated Transit timeline details logs */}
                    {selectedOrder.trackingNumber && (
                      <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900">
                        <h4 className="font-sans text-xs font-black uppercase text-zinc-500 tracking-wider mb-4 flex items-center gap-1.5">
                          <Route className="h-4 w-4 text-blue-600" />
                          {t.trackShipment} (FedEx/Aramex Route)
                        </h4>

                        {loadingTrack ? (
                          <div className="text-center py-4 text-xs font-mono text-zinc-400 animate-pulse">{loadingTrackingTxt}</div>
                        ) : trackInfo ? (
                          <div className="space-y-4">
                            {getSimulatedRouteSteps(trackInfo.route, activeStatus).map((step, idx) => {
                              const isCompleted = getStatusPercent(activeStatus) >= (idx * 25 + 10);
                              return (
                                <div key={idx} className="flex gap-4 relative pl-1">
                                  {idx < getSimulatedRouteSteps(trackInfo.route, activeStatus).length - 1 && (
                                    <div className={`absolute top-4.5 left-3.5 w-[1.5px] h-9 -z-0 ${isCompleted ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                                  )}
                                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[9px] z-10 shrink-0 ${isCompleted ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-400 dark:bg-zinc-900 dark:border-zinc-800'}`}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`font-sans text-xs font-bold leading-none ${isCompleted ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-650'}`}>{step.label}</span>
                                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[9px] text-zinc-400">
                                      <span>🕒 {step.time}</span>
                                      <span>📍 {step.geo}</span>
                                    </div>
                                    <p className="font-sans text-[11px] leading-normal text-zinc-500 dark:text-zinc-450 mt-1">{step.detail}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center font-mono text-xs text-rose-400">{trackingErrorTxt}</div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              );
            })() : (
              <div className="h-48 rounded-3xl border border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 dark:border-dashed dark:border-zinc-800 dark:text-zinc-650 font-mono text-xs">
                {selectOrderPrompt}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          {/* Left Column: Premium Pass / Identity Card */}
          <div className="md:col-span-1">
            <div className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${profileAvatar} relative overflow-hidden flex flex-col justify-between h-80`}>
              
              {/* Decorative elements */}
              <div className="absolute right-[-40px] top-[-40px] w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 rounded-full bg-white/5 blur-lg pointer-events-none" />
              
              {/* Header card info */}
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono font-black tracking-widest text-white/70">Verified Digital ID</span>
                  <span className="text-xs font-extrabold tracking-tight uppercase">electroshop clearance</span>
                </div>
                <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xs select-none">
                  ⚡
                </div>
              </div>

              {/* Central Member Profile */}
              <div className="flex items-center gap-3.5 z-10 my-4">
                <div className="h-14 w-14 rounded-full bg-white text-zinc-900 flex items-center justify-center font-black text-2xl select-none shadow-md uppercase">
                  {(profileName || user.name)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-base font-extrabold truncate">{profileName || user.name}</h4>
                  <p className="font-mono text-[9px] text-white/80 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/20 text-[8px] font-mono font-bold tracking-widest uppercase">
                    Level-4 Diamond Client
                  </span>
                </div>
              </div>

              {/* ID footer & simulated barcode */}
              <div className="flex justify-between items-end border-t border-white/20 pt-3 z-10">
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[8px] uppercase tracking-wider text-white/60">Phone Coordinate</span>
                  <span className="font-sans text-xs font-bold truncate">{profilePhone}</span>
                </div>
                {/* Visual Barcode bar lines */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex gap-[1.5px] h-6 bg-white/80 p-0.5 rounded">
                    {[1, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3, 1, 2].map((w, idx) => (
                      <div key={idx} className="bg-zinc-950 rounded-sm" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="font-mono text-[6px] text-white/70 tracking-widest uppercase">UID_#{(user.id || '48E9').substring(0,6)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Edit Profile details form */}
          <div className="md:col-span-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 space-y-6">
              <div className="border-b border-zinc-150 pb-4 dark:border-zinc-900">
                <h3 className="font-sans text-sm font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <UserIcon className="h-4.5 w-4.5 text-blue-600" />
                  <span>Update Profile Coordinates</span>
                </h3>
                <p className="font-sans text-xs text-zinc-400 mt-1">Configure your personal billing addresses and verified contact details below.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
                
                {/* Save status notification block */}
                {saveStatus && (
                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all animate-scale-up ${
                    saveStatus === 'saving' 
                      ? 'bg-blue-50/50 border-blue-100 text-blue-750 dark:bg-blue-950/15 dark:border-blue-900/40 dark:text-blue-300' 
                      : 'bg-emerald-50/50 border-emerald-100 text-emerald-750 dark:bg-emerald-950/15 dark:border-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${saveStatus === 'saving' ? 'animate-ping' : ''}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${saveStatus === 'saving' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                      {saveStatus === 'saving' ? 'Syncing credentials with clearance server...' : 'Success: Profile decrypted & stored locally!'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Mobile Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Readonly) */}
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Clearance Email</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-100/50 px-3 pl-9 py-2 text-zinc-400 outline-none cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-600"
                        title="User login email is structurally immutable."
                      />
                    </div>
                  </div>

                  {/* Avatar Theme Selector */}
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Digital Card Gradient</label>
                    <div className="flex gap-2 pt-1.5">
                      {[
                        { label: 'Deep Space Blue', bg: 'from-blue-600 to-indigo-600' },
                        { label: 'Cyberpunk Purple', bg: 'from-purple-600 to-pink-500' },
                        { label: 'Lava Amber', bg: 'from-rose-500 to-amber-500' },
                        { label: 'Forest Emerald', bg: 'from-emerald-600 to-teal-500' },
                        { label: 'Midnight Obsidian', bg: 'from-zinc-800 to-zinc-950' }
                      ].map((themeOpt) => (
                        <button
                          key={themeOpt.bg}
                          type="button"
                          onClick={() => setProfileAvatar(themeOpt.bg)}
                          className={`h-6 w-6 rounded-full bg-gradient-to-tr ${themeOpt.bg} border-2 relative transition-all cursor-pointer ${profileAvatar === themeOpt.bg ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          title={themeOpt.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <span>Default Delivery Address Coordinates</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Street Address</label>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">City</label>
                      <input
                        type="text"
                        required
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={profilePostalCode}
                        onChange={(e) => setProfilePostalCode(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Country</label>
                      <input
                        type="text"
                        required
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-md hover:bg-blue-550 transition-colors cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save My Credentials</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto py-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 space-y-6">
            <div className="border-b border-zinc-150 pb-4 dark:border-zinc-900">
              <h3 className="font-sans text-sm font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-blue-600" />
                <span>Operational Control Panel Settings</span>
              </h3>
              <p className="font-sans text-xs text-zinc-400 mt-1">Configure systemic protocols, logistics defaults, and sandboxed debug controls.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 font-sans text-xs text-zinc-850 dark:text-zinc-200">
              
              {/* Save status notice */}
              {settingsSavedMsg && (
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all animate-scale-up ${
                  settingsSavedMsg === 'saving' 
                    ? 'bg-blue-50/50 border-blue-100 text-blue-750 dark:bg-blue-950/15 dark:border-blue-900/40 dark:text-blue-300' 
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-750 dark:bg-emerald-950/15 dark:border-emerald-900/40 dark:text-emerald-300'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${settingsSavedMsg === 'saving' ? 'animate-ping' : ''}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${settingsSavedMsg === 'saving' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    {settingsSavedMsg === 'saving' ? 'Syncing application parameters with sandbox registry...' : 'Success: System parameters locked & applied!'}
                  </span>
                </div>
              )}

              {/* Toggles Group */}
              <div className="space-y-4">
                <h4 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Communication & Interface Filters</h4>
                
                {/* Toggle 1: Live Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900/60 bg-slate-50/20 dark:bg-zinc-950/20">
                  <div className="flex items-start gap-3 pr-4">
                    <BellRing className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Automated SMS & Webhook Milestones</span>
                      <p className="text-[10px] text-zinc-400 leading-normal">Simulate automated text messages to your phone upon parcel checkout, sorting, or doorstep arrivals.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsNotifications(!settingsNotifications)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${settingsNotifications ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${settingsNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle 2: Two-Factor (2FA) */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900/60 bg-slate-50/20 dark:bg-zinc-950/20">
                  <div className="flex items-start gap-3 pr-4">
                    <Fingerprint className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Simulated Two-Factor Authorization (2FA)</span>
                      <p className="text-[10px] text-zinc-400 leading-normal">Enforce numeric verification challenges on all checkouts to prevent accidental double-tap checkout orders.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings2FA(!settings2FA)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${settings2FA ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${settings2FA ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle 3: Diagnostics Overlay */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900/60 bg-slate-50/20 dark:bg-zinc-950/20">
                  <div className="flex items-start gap-3 pr-4">
                    <History className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">High-Precision Telemetry Diagnostics</span>
                      <p className="text-[10px] text-zinc-400 leading-normal">Overlay live coordinate logs and telemetry estimates inside the active shipment tracking visual grid.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsTelemetryOverlay(!settingsTelemetryOverlay)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${settingsTelemetryOverlay ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${settingsTelemetryOverlay ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Operational parameters selectors */}
              <div className="space-y-4 pt-2">
                <h4 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Default Logistics Protocols</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Carrier Protocol Preference</label>
                    <select
                      value={settingsCarrier}
                      onChange={(e) => setSettingsCarrier(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <option value="FedEx Priority">FedEx Priority Protocol</option>
                      <option value="DHL Express Aero">DHL Express Aero</option>
                      <option value="Aramex Hyper-Link">Aramex Hyper-Link</option>
                      <option value="ElectroScan Local Delivery">ElectroScan Local Delivery</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">Billing Base Currency</label>
                    <select
                      value={settingsCurrency}
                      onChange={(e) => setSettingsCurrency(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-855 outline-none transition-all focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro Currency)</option>
                      <option value="JPY">JPY (¥ - Japanese Yen)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sandbox controls */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Administrative Sandbox Reset</span>
                </h4>
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-red-200/40 bg-red-500/5">
                  <p className="text-[10px] text-zinc-400 leading-normal max-w-md font-sans">
                    Wipe local simulated tracking coordinates, clear browser-stored custom profiles and preferences, and reload active order parameters to factory defaults.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear sandbox cache? This resets profile edits & system parameters back to factory values.')) {
                        localStorage.removeItem('profile_name');
                        localStorage.removeItem('profile_phone');
                        localStorage.removeItem('profile_address');
                        localStorage.removeItem('profile_city');
                        localStorage.removeItem('profile_postal_code');
                        localStorage.removeItem('profile_country');
                        localStorage.removeItem('profile_avatar');
                        localStorage.removeItem('settings_notifications');
                        localStorage.removeItem('settings_2fa');
                        localStorage.removeItem('settings_carrier');
                        localStorage.removeItem('settings_currency');
                        localStorage.removeItem('settings_telemetry');
                        alert('Sandbox Cache Cleared Successfully. Page will reload.');
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-550 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>

              {/* Save button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-md hover:bg-blue-550 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Lock System Settings</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-850 dark:bg-zinc-950 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-900">
            <div>
              <h3 className="font-sans text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <span>My Activity Audit Trail</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Your actions, settings, and checkout milestones are securely logged and synchronized in our cloud-hosted database.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
              <Fingerprint className="h-3.5 w-3.5" />
              <span>DURABLE FIRESTORE AUDIT</span>
            </div>
          </div>

          {loadingActivities ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs text-zinc-400">Syncing live ledger from cloud database...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <ClipboardList className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No activity logged yet.</p>
              <p className="text-[10px] text-zinc-400 mt-1">Explore our product showcase or update your profile to generate events.</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((act, actIdx) => {
                  let icon = <Clock className="h-4 w-4 text-zinc-500" />;
                  let bgClass = 'bg-zinc-100 dark:bg-zinc-900';
                  let label = act.action;
                  
                  if (act.action === 'login') {
                    icon = <Fingerprint className="h-4 w-4 text-blue-600" />;
                    bgClass = 'bg-blue-50 dark:bg-blue-950/50';
                    label = 'Secure Login';
                  } else if (act.action === 'logout') {
                    icon = <Fingerprint className="h-4 w-4 text-amber-600" />;
                    bgClass = 'bg-amber-50 dark:bg-amber-950/50';
                    label = 'Session Ended';
                  } else if (act.action === 'register') {
                    icon = <UserIcon className="h-4 w-4 text-emerald-600" />;
                    bgClass = 'bg-emerald-50 dark:bg-emerald-950/50';
                    label = 'Account Created';
                  } else if (act.action === 'view_product') {
                    icon = <Compass className="h-4 w-4 text-purple-600" />;
                    bgClass = 'bg-purple-50 dark:bg-purple-950/50';
                    label = 'Viewed Electronics Item';
                  } else if (act.action === 'search') {
                    icon = <Search className="h-4 w-4 text-indigo-600" />;
                    bgClass = 'bg-indigo-50 dark:bg-indigo-950/50';
                    label = 'Search Catalog Query';
                  } else if (act.action === 'add_to_cart') {
                    icon = <Package className="h-4 w-4 text-teal-600" />;
                    bgClass = 'bg-teal-50 dark:bg-teal-950/50';
                    label = 'Added Item to Cart';
                  } else if (act.action === 'remove_from_cart') {
                    icon = <Trash2 className="h-4 w-4 text-rose-600" />;
                    bgClass = 'bg-rose-50 dark:bg-rose-950/50';
                    label = 'Removed Item from Cart';
                  } else if (act.action === 'checkout') {
                    icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
                    bgClass = 'bg-emerald-50 dark:bg-emerald-950/50';
                    label = 'Completed Purchase';
                  } else if (act.action === 'add_review') {
                    icon = <Zap className="h-4 w-4 text-yellow-600" />;
                    bgClass = 'bg-yellow-50 dark:bg-yellow-950/50';
                    label = 'Submitted Review Feedback';
                  }

                  return (
                    <li key={act.id}>
                      <div className="relative pb-8">
                        {actIdx !== activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-zinc-950 ${bgClass}`}>
                              {icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200">
                                {label}{' '}
                                {act.details && act.details.name && (
                                  <span className="font-sans text-xs font-normal text-zinc-500 dark:text-zinc-400">
                                    - "{act.details.name}"
                                  </span>
                                )}
                                {act.details && act.details.query && (
                                  <span className="font-mono text-xs font-normal text-blue-600 dark:text-blue-400">
                                    : "{act.details.query}"
                                  </span>
                                )}
                                {act.details && act.details.orderId && (
                                  <span className="font-mono text-xs font-normal text-emerald-600 dark:text-emerald-400">
                                    : {act.details.orderId} (₹{act.details.total.toLocaleString('en-IN')})
                                  </span>
                                )}
                              </p>
                              {act.details && Object.keys(act.details).length > 0 && !act.details.name && !act.details.query && !act.details.orderId && (
                                <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                                  {JSON.stringify(act.details)}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-zinc-400 font-mono">
                              {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
