import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, Globe, Smartphone, BookOpen, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

type Language = 'en' | 'hr';

const translations = {
  en: {
    title: "Welcome to LukaMath Student App",
    subtitle: "Your personal math learning companion",
    description: "Access homework assignments, track progress, and communicate with your tutor Luka.",
    selectLanguage: "Select Your Language",
    continue: "Continue",
    features: {
      homework: "Homework Management",
      progress: "Progress Tracking", 
      communication: "Direct Q&A with Luka",
      calendar: "Session Scheduling"
    },
    getStarted: "Get Started",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In"
  },
  hr: {
    title: "Dobrodošli u LukaMath Student App",
    subtitle: "Vaš osobni pratitelj za učenje matematike",
    description: "Pristupite domaćim zadacima, pratite napredak i komunicirajte s vašim instruktorom Lukom.",
    selectLanguage: "Odaberite svoj jezik",
    continue: "Nastavi",
    features: {
      homework: "Upravljanje domaćim zadacima",
      progress: "Praćenje napretka",
      communication: "Direktno pitanje i odgovor s Lukom", 
      calendar: "Zakazivanje sesija"
    },
    getStarted: "Počni",
    alreadyHaveAccount: "Već imate račun?",
    signIn: "Prijavite se"
  }
};

export default function PWAIndex() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [, setLocation] = useLocation();
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Register PWA service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/pwa-sw.js')
        .then(() => console.log('PWA Service Worker registered'))
        .catch(() => console.log('PWA Service Worker registration failed'));
    }

    // Add to home screen prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  const t = selectedLanguage ? translations[selectedLanguage] : translations.en;

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    localStorage.setItem('pwa-language', language);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      setLocation(`/pwa/auth?lang=${selectedLanguage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <Helmet>
        <title>LukaMath Student App - Math Homework Management</title>
        <meta name="description" content="Progressive Web App for math homework management, progress tracking, and tutor communication." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Calculator className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-slate-800">LukaMath</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.title}</h2>
          <p className="text-slate-600 mb-4">{t.subtitle}</p>
          <p className="text-sm text-slate-500">{t.description}</p>
        </div>

        {!selectedLanguage ? (
          /* Language Selection */
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Globe className="w-5 h-5 mr-2" />
                {translations.en.selectLanguage}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleLanguageSelect('en')}
                variant="outline"
                className="w-full text-left justify-start h-12"
              >
                <span className="text-lg mr-3">🇺🇸</span>
                <div>
                  <div className="font-semibold">English</div>
                  <div className="text-xs text-slate-500">United States</div>
                </div>
              </Button>
              <Button
                onClick={() => handleLanguageSelect('hr')}
                variant="outline"
                className="w-full text-left justify-start h-12"
              >
                <span className="text-lg mr-3">🇭🇷</span>
                <div>
                  <div className="font-semibold">Hrvatski</div>
                  <div className="text-xs text-slate-500">Hrvatska</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* App Features Preview */
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600">{t.features.homework}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Calculator className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600">{t.features.progress}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600">{t.features.communication}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Smartphone className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-xs text-slate-600">{t.features.calendar}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {/* Install App Button */}
              {showInstallButton && (
                <Button 
                  onClick={handleInstallClick} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 mb-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {selectedLanguage === 'hr' ? 'Instaliraj aplikaciju' : 'Install App'}
                </Button>
              )}
              
              <Button onClick={handleContinue} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                {t.getStarted}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">{t.alreadyHaveAccount}</p>
                <Link href={`/pwa/login?lang=${selectedLanguage}`}>
                  <Button variant="outline" className="w-full h-10">
                    {t.signIn}
                  </Button>
                </Link>
              </div>
              
              {/* Share Button for iOS/other devices */}
              {!showInstallButton && navigator.userAgent.includes('iPhone') && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <Share className="w-4 h-4 mr-2" />
                    <span>
                      {selectedLanguage === 'hr' 
                        ? 'iOS: Dodirnite Dijeli → Dodaj na početni zaslon' 
                        : 'iOS: Tap Share → Add to Home Screen'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            © 2025 LukaMath. {selectedLanguage === 'hr' ? 'Sva prava pridržana.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}