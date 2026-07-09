import React, { useState, useEffect } from 'react';
import { X, Trash2, ShieldCheck, CreditCard, Route, CheckCircle, Plus, Minus, QrCode, Wallet, Smartphone, Banknote } from 'lucide-react';
import { CartItem, ShippingInfo } from '../types';
import { Language, translations } from '../localization';
import ProductImage from './ProductImage';

interface CheckoutModalProps {
  cart: CartItem[];
  currentLang: Language;
  onClose: () => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckoutSuccess: (order: any) => void;
  userToken: string | null;
  onOpenAuth: () => void;
}

interface ShippingPartner {
  id: string;
  name: string;
  speed: string;
  reliability: string;
  description: string;
}

export default function CheckoutModal({
  cart,
  currentLang,
  onClose,
  onUpdateCartQty,
  onRemoveFromCart,
  onCheckoutSuccess,
  userToken,
  onOpenAuth
}: CheckoutModalProps) {
  const t = translations[currentLang];

  const emptyCartMsg = {
    en: 'Your electronics cart is empty.',
    es: 'Su carrito de electrónica está vacío.',
    fr: 'Votre panier d\'électronique est vide.',
    de: 'Ihr Elektronik-Warenkorb ist leer.',
    ja: 'カートの中に商品はありません。',
    te: 'మీ ఎలక్ట్రానిక్స్ కార్ట్ ఖాళీగా ఉంది.',
    hi: 'आपका इलेक्ट्रॉनिक्स कार्ट खाली है।',
    ta: 'உங்களது கார்ட் காலியாக உள்ளது.'
  }[currentLang] || 'Your electronics cart is empty.';

  const removeLabel = {
    en: 'Remove',
    es: 'Eliminar',
    fr: 'Supprimer',
    de: 'Entfernen',
    ja: '削除',
    te: 'తొలగించు',
    hi: 'हटाएं',
    ta: 'நீக்கு'
  }[currentLang] || 'Remove';

  const processCheckoutBtn = {
    en: 'Process Checkout →',
    es: 'Procesar Compra →',
    fr: 'Passer à la Caisse →',
    de: 'Zur Kasse Gehen →',
    ja: 'レジに進む →',
    te: 'చెక్అవుట్ ప్రాసెస్ చేయండి →',
    hi: 'चेकआउट प्रक्रिया करें →',
    ta: 'செக் அவுட் பெட்டிக்குச் செல்க →'
  }[currentLang] || 'Process Checkout →';

  const fillShippingError = {
    en: 'Please complete all shipping inputs.',
    es: 'Por favor, complete todos los campos de envío.',
    fr: 'Veuillez remplir toutes les informations d\'expédition.',
    de: 'Bitte füllen Sie alle Versandfelder aus.',
    ja: 'すべての配送先情報を入力してください。',
    te: 'దయచేసి అన్ని షిప్పింగ్ వివరాలను నమోదు చేయండి.',
    hi: 'कृपया सभी शिपिंग इनपुट भरें।',
    ta: 'தயவுசெய்து அனைத்து விபரங்களையும் நிரப்பவும்.'
  }[currentLang] || 'Please complete all shipping inputs.';

  const fillCardError = {
    en: 'Please complete card info.',
    es: 'Por favor, complete la información de la tarjeta.',
    fr: 'Veuillez remplir les informations de carte.',
    de: 'Bitte füllen Sie die Kreditkarten-Details aus.',
    ja: 'カード情報を正確に入力してください。',
    te: 'దయచేసి కార్డ్ వివరాలను పూర్తి చేయండి.',
    hi: 'कृपया कार्ड की जानकारी भरें।',
    ta: 'தயவுசெய்து அட்டை விபரங்களை உள்ளிடவும்.'
  }[currentLang] || 'Please complete card info.';

  const fillUpiError = {
    en: 'Please specify a valid UPI ID (e.g. name@upi).',
    es: 'Especifique un ID de UPI válido (ej. nombre@upi).',
    fr: 'Veuillez spécifier un identifiant UPI valide (ex: nom@upi).',
    de: 'Bitte geben Sie eine gültige UPI-ID an (z. B. name@upi).',
    ja: '有効なUPI ID（例：name@upi）を入力してください。',
    te: 'దయచేసి సరైన UPI ID ని నమోదు చేయండి (ఉదా. name@upi).',
    hi: 'कृपया एक मान्य UPI आईडी निर्दिष्ट करें (जैसे name@upi)।',
    ta: 'தயவுசெய்து சரியான UPI முகவரியை உள்ளிடவும்.'
  }[currentLang] || 'Please specify a valid UPI ID (e.g. name@upi).';

  const selectPaymentOptionTxt = {
    en: 'Select Payment Option',
    es: 'Seleccionar Método de Pago',
    fr: 'Choisir l\'Option de Paiement',
    de: 'Zahlungsoption Auswählen',
    ja: '決済手段の選択',
    te: 'చెల్లింపు ఎంపికను ఎంచుకోండి',
    hi: 'भुगतान विकल्प चुनें',
    ta: 'கட்டண முறையைத் தேர்ந்தெடுக்கவும்'
  }[currentLang] || 'Select Payment Option';

  const creditCardLabel = {
    en: 'Credit Card',
    es: 'Tarjeta de Crédito',
    fr: 'Carte de Crédit',
    de: 'Kreditkarte',
    ja: 'クレジットカード',
    te: 'క్రెడిట్ కార్డ్',
    hi: 'क्रेडिट कार्ड',
    ta: 'கிரெடிட் கார்டு'
  }[currentLang] || 'Credit Card';

  const codLabel = {
    en: 'COD / Cash',
    es: 'Contrareembolso / Efectivo',
    fr: 'COD / Espèces',
    de: 'Nachnahme / Bar',
    ja: '代金引換（コレクト）',
    te: 'క్యాష్ ఆన్ డెలివరీ',
    hi: 'सीओडी / नकद',
    ta: 'கேஷ் ஆன் டெலிவரி'
  }[currentLang] || 'COD / Cash';

  const enterUpiLabel = {
    en: 'Enter UPI ID',
    es: 'Ingrese su ID de UPI',
    fr: 'Saisir l\'identifiant UPI',
    de: 'UPI-ID eingeben',
    ja: 'UPI ID を入力してください',
    te: 'UPI ID నమోదు చేయండి',
    hi: 'UPI आईडी दर्ज करें',
    ta: 'UPI முகவரியை உள்ளிடவும்'
  }[currentLang] || 'Enter UPI ID';

  const upiHelperTxt = {
    en: 'Provide your primary UPI address to initiate instant confirmation scan requests. You will receive a checkout alert on GPay/PhonePe to complete safe sandbox transaction processing.',
    es: 'Proporcione su dirección de UPI principal para iniciar solicitudes de escaneo. Recibirá una alerta en GPay/PhonePe para completar el procesamiento seguro.',
    fr: 'Fournissez votre adresse UPI principale pour lancer les demandes de scan instantané. Vous recevrez une alerte sur GPay/PhonePe pour terminer le traitement sécurisé.',
    de: 'Geben Sie Ihre primäre UPI-Adresse an, um sofortige Bestätigungsscans zu starten. Sie erhalten eine Benachrichtigung auf GPay/PhonePe, um die Transaktion sicher abzuschließen.',
    ja: 'インスタント確認スキャンを初期化するためにUPIアドレスを入力してください。安全な保護環境トランザクション処理を決済アプリで確認してください。',
    te: 'తక్షణ ధృవీకరణ స్కాన్ అభ్యర్థనలను ప్రారంభించడానికి మీ ప్రాథమిక UPI చిరునామాను అందించండి. సురક્ષితమైన లావాదేవీని పూర్తి చేయడానికి మీ మొబైల్ యాప్‌లో అలర్ట్ పొందుతారు.',
    hi: 'त्वरित पुष्टि स्कैन अनुरोधों को शुरू करने के लिए अपना प्राथमिक UPI पता प्रदान करें। सुरक्षित सैंडबॉक्स लेनदेन प्रसंस्करण को पूरा करने के लिए आपको GPay/PhonePe पर एक चेकआउट चेतावनी प्राप्त होगी।',
    ta: 'உங்களது UPI முகவரியை உள்ளிட்டு பாதுகாப்பான பரிவர்த்தனையை நிறைவு செய்யவும்.'
  }[currentLang] || 'Provide your primary UPI address to...';

  const sandboxQrTxt = {
    en: 'dynamic sandbox qr code',
    es: 'código qr dinámico de prueba',
    fr: 'code qr sandbox dynamique',
    de: 'dynamischer Sandbox-QR-Code',
    ja: 'サンドボックス向け動的QRコード',
    te: 'డైనమిక్ శాండ్‌బాక్స్ QR కోడ్',
    hi: 'गतिशील सैंडबॉक्स क्यूआर कोड',
    ta: 'பாதுகாப்பான QR குறியீடு'
  }[currentLang] || 'dynamic sandbox qr code';

  const codInstructionsTxt = (totalStr: string) => ({
    en: `Please finalize ₹${totalStr} on-delivery handovers (in physical tender currency or local QR wallets) to assigned carrier upon arrival.`,
    es: `Por favor, entregue ₹${totalStr} al repartidor asignado a su llegada (en efectivo o mediante monederos QR locales).`,
    fr: `Veuillez remettre ₹${totalStr} au transporteur désigné à l'arrivée (en espèces ou via des portefeuilles QR locaux).`,
    de: `Bitte übergeben Sie ₹${totalStr} bei Lieferung bar oder per lokaler QR-Geldbörse an den zugewiesenen Kurier.`,
    ja: `配達員が到着した際に、決済代金 ₹${totalStr} を現金または現地のQR決済等で直接お支払いください。`,
    te: `చేరుకున్నప్పుడు కేటాయించిన డెలివరీ ఏజెంట్‌కు ₹${totalStr} నగదు లేదా స్థానిక QR కోడ్ ద్వారా చెల్లింపును అందజేయండి.`,
    hi: `आगमन पर आवंटित कूरियर को ₹${totalStr} का भुगतान (नकद या स्थानीय क्यूआर वॉलेट में) पूरा करें।`,
    ta: `பொருள் வந்துசேரும் போது ₹${totalStr} தொகையை கூரியர் முகவரிடம் வழங்கவும்.`
  }[currentLang] || `Please finalize ₹${totalStr} on-delivery handovers...`);

  const [step, setStep] = useState<1 | 2>(1); // 1 = Cart Summary, 2 = Shipping / Payment details
  const [partners, setPartners] = useState<ShippingPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('fedex');
  
  // Checkout Form Details
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('321');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch 3rd party logistics partners from full API Integration
    fetch('/api/shipping/partners')
      .then(res => res.json())
      .then(data => {
        setPartners(data);
        if (data.length > 0) setSelectedPartnerId(data[0].id);
      })
      .catch(err => console.error('Failed fetching carriers:', err));
  }, []);

  const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      onOpenAuth();
      return;
    }
    if (!fullName || !address || !city || !postalCode || !country) {
      setErrorMsg(fillShippingError);
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvv)) {
      setErrorMsg(fillCardError);
      return;
    }
    if (paymentMethod === 'upi' && (!upiId || !upiId.includes('@'))) {
      setErrorMsg(fillUpiError);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const shippingInfo: ShippingInfo = { fullName, address, city, postalCode, country };
      const paymentDetails = paymentMethod === 'card' ? { cardNumber, expiry, cvv } : undefined;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          items: cart,
          shippingInfo,
          paymentDetails,
          paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Checkout transaction rejected.');
      }

      onCheckoutSuccess(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment system error. Check stock limits.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-805 dark:bg-zinc-950 animate-scale-up">
        
        {/* Header Title bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-900">
          <h3 className="font-sans text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase tracking-wide">
            🛒 {step === 1 ? t.cart : t.checkoutSummary}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          
          {step === 1 ? (
            /* ==========================================
               STEP 1: SHOPPING CART LIST DIRECTORY
               ========================================== */
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 dark:text-zinc-650 font-mono">
                  {emptyCartMsg}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <ProductImage
                          src={item.product.image}
                          name={item.product.name}
                          category={item.product.category}
                          productId={item.product.id}
                          className="h-16 w-16 rounded-xl bg-zinc-100 shrink-0 dark:bg-zinc-900"
                        />
                        
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.product.name}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{item.product.category}</p>
                            </div>
                            <span className="font-mono text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-850 dark:bg-zinc-900">
                              <button
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                                className="h-5 w-5 rounded hover:bg-zinc-200 flex items-center justify-center text-zinc-600 dark:hover:bg-zinc-800"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-mono text-xs font-bold px-2 text-zinc-800 dark:text-zinc-200">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                                className="h-5 w-5 rounded hover:bg-zinc-200 flex items-center justify-center text-zinc-600 dark:hover:bg-zinc-800"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="text-zinc-400 hover:text-rose-500 font-mono text-[10px] font-bold flex items-center gap-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {removeLabel}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-105 pt-5 dark:border-zinc-90 w-full mt-6 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">{t.orderTotal}</span>
                      <span className="font-mono text-xl font-black text-slate-900 dark:text-zinc-50">
                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => userToken ? setStep(2) : onOpenAuth()}
                      className="cursor-pointer font-sans text-xs font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 shadow-md shadow-blue-500/10 active:scale-95"
                    >
                      {processCheckoutBtn}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ==========================================
               STEP 2: FORM FOR SHIPPING & SECURE LOGISTICS
               ========================================== */
            <form onSubmit={handleSubmitCheckout} className="space-y-6">
              
              {/* Shipping section */}
              <div>
                <h4 className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase tracking-wider">
                  📍 {t.shippingAddress}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">{t.fullName}</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">{t.addressLines}</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Suite 404, Silicon Towers"
                      className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">{t.city}</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="San Jose"
                      className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">{t.postalCode}</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      placeholder="95112"
                      className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <Route className="h-4 w-4 text-blue-600" />
                  {t.deliveryPartner}
                </h4>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={`cursor-pointer border p-3 rounded-lg flex flex-col gap-1.5 transition-all select-none ${selectedPartnerId === partner.id ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-950/20' : 'border-slate-205 hover:bg-slate-50 dark:border-zinc-850 dark:hover:bg-zinc-90%'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-none">{partner.name.split(' ')[0]}</span>
                        <span className="font-mono text-[8px] px-1 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-900">{partner.speed}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">{partner.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure simulated payment section */}
              <div className="border-t border-zinc-100 pt-5 dark:border-zinc-900">
                <h4 className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  {selectPaymentOptionTxt}
                </h4>

                {/* Interactive Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-950/20 text-blue-600' : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 dark:border-zinc-850 dark:bg-zinc-950'}`}
                  >
                    <CreditCard className="h-4.5 w-4.5 mb-1 text-inherit" />
                    <span className="text-[9px] font-black uppercase tracking-wider">{creditCardLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-950/20 text-blue-600' : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 dark:border-zinc-850 dark:bg-zinc-950'}`}
                  >
                    <Smartphone className="h-4.5 w-4.5 mb-1 text-inherit" />
                    <span className="text-[9px] font-black uppercase tracking-wider">UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-950/20 text-blue-600' : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 dark:border-zinc-850 dark:bg-zinc-950'}`}
                  >
                    <Wallet className="h-4.5 w-4.5 mb-1 text-inherit" />
                    <span className="text-[9px] font-black uppercase tracking-wider">{codLabel}</span>
                  </button>
                </div>

                {/* Subform panels depending on selected paymentMethod */}
                {paymentMethod === 'card' && (
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-900/50 grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase">{t.cardNumber}</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full mt-1 rounded-md border border-slate-202 bg-white p-2 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase">{t.expiryDate}</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full mt-1 rounded-md border border-slate-202 bg-white p-2 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] text-zinc-400 uppercase">CVV</label>
                      <input
                        type="password"
                        required
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="w-full mt-1 rounded-md border border-slate-202 bg-white p-2 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full space-y-2.5">
                      <div>
                        <label className="font-mono text-[9px] text-zinc-400 uppercase block mb-1">{enterUpiLabel}</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="username@upi"
                          className="w-full rounded-md border border-slate-202 bg-white p-22 sm:p-2 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {upiHelperTxt}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                      <div className="relative flex justify-center items-center bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-sm w-28 h-28 overflow-hidden select-none">
                        <svg className="w-24 h-24 text-zinc-950" viewBox="0 0 100 100">
                          <rect x="0" y="0" width="22" height="22" fill="currentColor" />
                          <rect x="3" y="3" width="16" height="16" fill="#fff" />
                          <rect x="6" y="6" width="10" height="10" fill="currentColor" />

                          <rect x="78" y="0" width="22" height="22" fill="currentColor" />
                          <rect x="81" y="3" width="16" height="16" fill="#fff" />
                          <rect x="84" y="6" width="10" height="10" fill="currentColor" />

                          <rect x="0" y="78" width="22" height="22" fill="currentColor" />
                          <rect x="3" y="81" width="16" height="16" fill="#fff" />
                          <rect x="6" y="84" width="10" height="10" fill="currentColor" />

                          <rect x="30" y="5" width="8" height="4" fill="currentColor" />
                          <rect x="45" y="0" width="4" height="12" fill="currentColor" />
                          <rect x="55" y="8" width="10" height="4" fill="currentColor" />
                          <rect x="32" y="16" width="4" height="8" fill="currentColor" />
                          <rect x="40" y="24" width="12" height="4" fill="currentColor" />
                          <rect x="60" y="16" width="4" height="4" fill="currentColor" />
                          <rect x="28" y="32" width="16" height="4" fill="currentColor" />
                          <rect x="48" y="28" width="12" height="12" fill="currentColor" />
                          <rect x="64" y="32" width="16" height="4" fill="currentColor" />
                          <rect x="28" y="44" width="4" height="16" fill="currentColor" />
                          <rect x="36" y="40" width="8" height="8" fill="currentColor" />
                          <rect x="48" y="52" width="12" height="4" fill="currentColor" />
                          <rect x="64" y="44" width="4" height="12" fill="currentColor" />
                          <rect x="72" y="48" width="12" height="8" fill="currentColor" />
                          <rect x="32" y="68" width="12" height="4" fill="currentColor" />
                          <rect x="28" y="76" width="4" height="8" fill="currentColor" />
                          <rect x="40" y="76" width="12" height="4" fill="currentColor" />
                          <rect x="48" y="68" width="4" height="12" fill="currentColor" />
                          <rect x="60" y="76" width="16" height="4" fill="currentColor" />
                          <rect x="64" y="64" width="8" height="8" fill="currentColor" />
                          <rect x="80" y="68" width="4" height="12" fill="currentColor" />
                        </svg>
                        <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" style={{ top: '50%' }} />
                      </div>
                      <span className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <QrCode className="h-2 w-2 text-zinc-400" /> {sandboxQrTxt}
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="rounded-xl bg-zinc-50 border border-zinc-150 p-4 dark:bg-zinc-900/40 dark:border-zinc-850 space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-650 dark:bg-emerald-950/20">
                        <Banknote className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-200">{t.zeroUpfrontCharge}</h5>
                        <p className="text-[10px] text-zinc-500">{t.fastConfirmedShipping}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-150 pt-2 dark:border-zinc-800">
                      {codInstructionsTxt(totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-500 font-sans border-l-2 border-rose-500 pl-2">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Checkout actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs text-zinc-650 hover:bg-zinc-50 hover:text-zinc-800 rounded-lg"
                >
                  {t.backToCart}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer font-sans text-xs font-bold text-white bg-blue-600 rounded-lg px-6 py-2.5 hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-95 disabled:bg-zinc-650 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.paymentVerifyTxt : t.placeOrder}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
