import React, { useState } from 'react';
import { X, LogIn, ClipboardList, Shield } from 'lucide-react';
import { Language, translations } from '../localization';
import { User } from '../types';

interface AuthModalProps {
  currentLang: Language;
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
}

export default function AuthModal({ currentLang, onClose, onAuthSuccess }: AuthModalProps) {
  const t = translations[currentLang];

  const populateFieldsError = {
    en: 'Please populate all required fields.',
    es: 'Por favor rellene todos los campos requeridos.',
    fr: 'Veuillez remplir tous les champs obligatoires.',
    de: 'Bitte füllen Sie alle erforderlichen Felder aus.',
    ja: 'すべての必須フィールドに入力してください。',
    te: 'దయచేసి అన్ని అవసరమైన వివరాలను పూరించండి.',
    hi: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    ta: 'தயவுசெய்து அனைத்து விபரங்களையும் நிரப்பவும்.'
  }[currentLang] || 'Please populate all required fields.';

  const authFailedError = {
    en: 'Authentication challenge failed.',
    es: 'La autenticación falló.',
    fr: 'Le défi d\'authentification a échoué.',
    de: 'Authentifizierungs-Challenge fehlgeschlagen.',
    ja: '認証に失敗しました。',
    te: 'ధృవీకరణ ప్రాసెస్ విఫలమైంది.',
    hi: 'प्रमाणीकरण विफल रहा।',
    ta: 'உள்நுழைవు விபரம் தவறானது.'
  }[currentLang] || 'Authentication challenge failed.';

  const registerSuccessMsg = {
    en: 'Registration successful! Please sign in with your password.',
    es: '¡Registro exitoso! Por favor inicie sesión con su contraseña.',
    fr: 'Inscription réussie ! Veuillez vous connecter avec votre mot de passe.',
    de: 'Registrierung erfolgreich! Bitte melden Sie sich mit Ihrem Passwort an.',
    ja: '登録が完了しました！パスワードを入力してログインしてください。',
    te: 'నమోదు పూర్తయింది! దయచేసి మీ పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.',
    hi: 'पंजीकरण सफल! कृपया अपने पासवर्ड से साइन इन करें।',
    ta: 'பதிவு வெற்றிகரமாக முடிந்தது! லாகின் செய்யவும்.'
  }[currentLang] || 'Registration successful! Please sign in with your password.';

  const serverErrorMsg = {
    en: 'Error communicating with credentials server.',
    es: 'Error al comunicarse con el servidor.',
    fr: 'Erreur de communication avec le serveur d\'authentification.',
    de: 'Fehler bei der Kommunikation mit dem Anmeldeserver.',
    ja: '認証サーバーとの通信中にエラーが発生しました。',
    te: 'సర్వర్‌తో కనెక్ట్ అవ్వడంలో సమస్య ఏర్పడింది.',
    hi: 'प्रमाणपत्र सर्वर के साथ संचार करने में त्रुटि।',
    ta: 'सर्வர் தொடர்பு கொள்ள இயலவில்லை.'
  }[currentLang] || 'Error communicating with credentials server.';

  const quickDemoTitle = {
    en: '⚡ Quick demo credentials:',
    es: '⚡ Credenciales rápidas de demostración:',
    fr: '⚡ Identifiants de démonstration rapide :',
    de: '⚡ Schnelle Demo-Anmeldedaten:',
    ja: '⚡ クイックデモ用アカウント:',
    te: '⚡ త్వరిత డెమో లాగిన్ వివరాలు:',
    hi: '⚡ त्वरित क्रेडेंशियल:',
    ta: '⚡ டெமோ லாகின் விபரங்கள்:'
  }[currentLang] || '⚡ Quick demo credentials:';

  const customerAccountLabel = {
    en: 'Customer account:',
    es: 'Cuenta de cliente:',
    fr: 'Compte client :',
    de: 'Kundenkonto:',
    ja: '一般アカウント:',
    te: 'కస్టమర్ ఖాతా:',
    hi: 'ग्राहक खाता:',
    ta: 'வாடிக்கையாளர் கணக்கு:'
  }[currentLang] || 'Customer account:';

  const adminAccountLabel = {
    en: 'Admin account:',
    es: 'Cuenta de administrador:',
    fr: 'Compte admin :',
    de: 'Admin-Konto:',
    ja: '管理者アカウント:',
    te: 'అడ్మిన్ ఖాతా:',
    hi: 'एडमिन खाता:',
    ta: 'நிர்வாக கணக்கு:'
  }[currentLang] || 'Admin account:';

  const autofillLabel = {
    en: 'Autofill',
    es: 'Autocompletar',
    fr: 'Remplir',
    de: 'Autofill',
    ja: '自動入力',
    te: 'ఆటోఫిల్',
    hi: 'ऑटोफिल',
    ta: 'தானியங்கு மதிப்பு'
  }[currentLang] || 'Autofill';

  const registerPromptMsg = {
    en: '(Or register a brand new customer profile to trigger first welcome notifications!)',
    es: '(¡O regístrese para activar notificaciones de bienvenida!)',
    fr: '(Ou inscrivez-vous pour déclencher les notifications de bienvenue !)',
    de: '(Oder registrieren Sie sich, um die ersten Willkommens-Meldungen zu erhalten!)',
    ja: '（新規登録でも、初回歓迎通知などの機能をお試しいただけます）',
    te: '(లేదా మొదటి స్వాగత నోటిఫికేషన్లను ప్రారంభించడానికి కొత్త ఖాతా సృష్టించండి!)',
    hi: '(या पहली स्वागत सूचनाओं को ट्रिगर करने के लिए एक नया ग्राहक प्रोफ़ाइल पंजीकृत करें!)',
    ta: '(அல்லது புதிய கணக்கைத் துவங்கி வரவேற்பு செய்தியைப் பெறவும்!)'
  }[currentLang] || '(Or register a brand new...';

  const nameLabel = {
    en: 'Your Full Name',
    es: 'Su Nombre Completo',
    fr: 'Votre Nom Complet',
    de: 'Ihr vollständiger Name',
    ja: 'お名前（フルネーム）',
    te: 'మీ పూర్తి పేరు',
    hi: 'आपका पूरा नाम',
    ta: 'உங்களது முழு பெயர்'
  }[currentLang] || 'Your Full Name';

  const emailLabel = {
    en: 'Email Address',
    es: 'Correo Electrónico',
    fr: 'Adresse e-mail',
    de: 'E-Mail-Adresse',
    ja: 'メールアドレス',
    te: 'ఈమెయిల్ చిరునామా',
    hi: 'ईमेल का पता',
    ta: 'மின்னஞ்சல் முகவரி'
  }[currentLang] || 'Email Address';

  const pwdLabel = {
    en: 'Secure Pin / Password',
    es: 'PIN Seguro / Contraseña',
    fr: 'Code PIN / Mot de Passe',
    de: 'Sicheres Passwort / PIN',
    ja: '安全なパスワード / PIN',
    te: 'సురక్షిత పిన్ / పాస్‌వర్డ్',
    hi: 'सुरक्षित पिन / पासवर्ड',
    ta: 'பாदाுகாப்பான கடவுச்சொல்'
  }[currentLang] || 'Secure Pin / Password';

  const dynamicAuthenticatingTxt = {
    en: 'Authenticating account...',
    es: 'Autenticando cuenta...',
    fr: 'Authentification du compte...',
    de: 'Konto wird authentifiziert...',
    ja: 'アカウントを認証中...',
    te: 'ఖాతాను ధృవీకరిస్తోంది...',
    hi: 'खाते को प्रमाणित किया जा रहा है...',
    ta: 'உள்நுழைகிறது...'
  }[currentLang] || 'Authenticating account...';

  const promptSignIn = {
    en: 'Already registered? Sign In',
    es: '¿Ya está registrado? Iniciar Sesión',
    fr: 'Déjà inscrit ? Se Connecter',
    de: 'Bereits registriert? Anmelden',
    ja: 'アカウントをお持ちですか？ログイン',
    te: 'ఇప్పటికే నమోదు చేసుకున్నారా? లాగిన్ అవ్వండి',
    hi: 'पहले से पंजीकृत? साइन इन करें',
    ta: 'ஏற்கனவே கணக்கு உள்ளதா? லாகின் செய்க'
  }[currentLang] || 'Already registered? Sign In';

  const promptRegister = {
    en: 'Create a brand new profile instead',
    es: 'Crear un nuevo perfil de cliente',
    fr: 'Créer un nouveau profil à la place',
    de: 'Stattdessen neues Kundenprofil erstellen',
    ja: '新規アカウントを作成する',
    te: 'బదులుగా కొత్త ప్రొఫైల్ సృష్టించండి',
    hi: 'इसके बजाय एक नया प्रोफ़ाइल बनाएं',
    ta: 'புதிய கணக்கைத் துவங்கவும்'
  }[currentLang] || 'Create a brand new profile instead';

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setErrorMsg(populateFieldsError);
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || authFailedError);
      }

      if (isRegister) {
        // Automatically switch to login flow or resolve directly
        // For convenience, simply alert them or do immediate login
        setIsRegister(false);
        setErrorMsg(registerSuccessMsg);
        setName('');
      } else {
        onAuthSuccess(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || serverErrorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-850 dark:bg-zinc-950 animate-scale-up">
        
        {/* Header Close triggers */}
        <div className="flex items-center justify-between pb-3 border-b mb-6 border-zinc-100 dark:border-zinc-900">
          <h3 className="font-sans text-xs font-black uppercase text-zinc-900 dark:text-zinc-50 tracking-wider flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-blue-650" />
            {isRegister ? t.register : t.login}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset accounts helpers alerts */}
        <div className="mb-5 rounded-lg bg-slate-50 p-3 text-[10px] font-mono leading-normal dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 space-y-1">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest text-[8px]">{quickDemoTitle}</p>
          <div className="flex justify-between">
            <span>{customerAccountLabel}</span>
            <span onClick={() => { setEmail('customer@demo.com'); setPassword('demo1234'); }} className="text-blue-650 underline cursor-pointer font-bold">{autofillLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>{adminAccountLabel}</span>
            <span onClick={() => { setEmail('harshairugu@gmail.com'); setPassword('admin1234'); }} className="text-blue-650 underline cursor-pointer font-bold">{autofillLabel}</span>
          </div>
          <p className="text-[9px] text-zinc-400">{registerPromptMsg}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="font-mono text-[9px] uppercase text-zinc-400">{nameLabel}</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Sarah Miller"
                className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
              />
            </div>
          )}

          <div>
            <label className="font-mono text-[9px] uppercase text-zinc-400">{emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="customer@demo.com"
              className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </div>

          <div>
            <label className="font-mono text-[9px] uppercase text-zinc-400">{pwdLabel}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 rounded-md border border-slate-200 p-2.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-zinc-700 font-mono leading-normal border-l-2 border-blue-600 pl-2">
              ℹ️ {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer w-full font-sans text-xs font-black text-white bg-blue-600 rounded-md py-3 hover:bg-blue-700 shadow-md transition-all active:scale-95 text-center mt-2 flex items-center justify-center gap-1.5 shadow-blue-550/10"
          >
            {isRegister ? <ClipboardList className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {submitting ? dynamicAuthenticatingTxt : (isRegister ? t.register : t.login)}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="font-sans text-xs text-zinc-500 hover:text-blue-600 hover:underline cursor-pointer"
          >
            {isRegister ? promptSignIn : promptRegister}
          </button>
        </div>

      </div>
    </div>
  );
}
