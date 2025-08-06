import { useState } from "react";
import { Link } from "wouter";
import { Calculator, Users, BookOpen, Target, MessageSquare, TrendingUp, CheckCircle, Award, Clock, Smartphone, ArrowRight, Menu, X, Globe, LogIn, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from 'react-helmet-async';
import { trackEvent } from "@/lib/analytics";

const getAppFeatures = (language: string, t: any) => [
  {
    icon: BookOpen,
    title: language === 'en' ? "Homework Management" : t('app_features.homework_title'),
    description: language === 'en' ? "Receive assignments from Luka, track due dates, and submit completed work in one organized dashboard" : t('app_features.homework_desc'),
    color: "bg-blue-100 text-blue-600",
    benefits: language === 'en' ? ["Get assignments instantly", "Track completion status", "Submit work easily"] : ["Primajte zadatke odmah", "Pratite status završetka", "Lako predajte radove"]
  },
  {
    icon: MessageSquare,
    title: language === 'en' ? "Direct Q&A with Luka" : t('app_features.qa_title'), 
    description: language === 'en' ? "Ask Luka questions anytime and get detailed explanations for any math problem" : t('app_features.qa_desc'),
    color: "bg-emerald-100 text-emerald-600",
    benefits: language === 'en' ? ["24/7 question submission", "Step-by-step solutions", "Personal responses from Luka"] : ["24/7 postavljanje pitanja", "Korak-po-korak rješenja", "Osobni odgovori od Luke"]
  },
  {
    icon: TrendingUp,
    title: language === 'en' ? "Progress Tracking" : t('app_features.progress_title'),
    description: language === 'en' ? "Visual charts showing your improvement across different math topics and assignments" : t('app_features.progress_desc'),
    color: "bg-purple-100 text-purple-600", 
    benefits: language === 'en' ? ["Grade tracking", "Performance analytics", "Improvement insights"] : ["Praćenje ocjena", "Analitika performansi", "Uvidi o poboljšanju"]
  },
  {
    icon: Calendar,
    title: language === 'en' ? "Availability Calendar" : t('app_features.calendar_title'),
    description: language === 'en' ? "Check Luka's availability and schedule tutoring sessions at convenient times" : t('app_features.calendar_desc'),
    color: "bg-yellow-100 text-yellow-600",
    benefits: language === 'en' ? ["Real-time availability", "Easy scheduling", "Session reminders"] : ["Dostupnost u realnom vremenu", "Lako zakazivanje", "Podsjetnici za sesije"]
  },
  {
    icon: Award,
    title: language === 'en' ? "Feedback & Grading" : t('app_features.feedback_title'),
    description: language === 'en' ? "Receive detailed feedback on your homework with grades and improvement suggestions" : t('app_features.feedback_desc'),
    color: "bg-red-100 text-red-600",
    benefits: language === 'en' ? ["Detailed feedback", "Grade tracking", "Improvement tips"] : ["Detaljne povratne informacije", "Praćenje ocjena", "Savjeti za poboljšanje"]
  },
  {
    icon: Clock,
    title: language === 'en' ? "Assignment Timeline" : t('app_features.timeline_title'),
    description: language === 'en' ? "Clear overview of upcoming deadlines, completed work, and pending assignments" : t('app_features.timeline_desc'),
    color: "bg-green-100 text-green-600",
    benefits: language === 'en' ? ["Deadline management", "Progress overview", "Priority sorting"] : ["Upravljanje rokovima", "Pregled napretka", "Sortiranje po prioritetima"]
  }
];

const getStats = (language: string) => [
  { number: "1:1", label: language === 'en' ? "Personal Tutoring" : "Personalizirano podučavanje", icon: Users },
  { number: "2025", label: language === 'en' ? "Latest Technology" : "Najnovija tehnologija", icon: TrendingUp },
  { number: "100%", label: language === 'en' ? "Personalized Focus" : "Personalizirani fokus", icon: Award },
  { number: "24/7", label: language === 'en' ? "Question Support" : "Podrška za pitanja", icon: Clock }
];

function AppFeatures() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const appFeatures = getAppFeatures(language, t);
  const stats = getStats(language);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hr" : "en");
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>{language === 'en' ? 'LukaMath Student App - Homework Management System' : 'LukaMath App - Sustav za upravljanje domaćim zadacima'}</title>
          <meta name="description" content={language === 'en' ? 'Advanced student app for homework management, progress tracking, tutor communication, and assignment submission. Built for modern math education.' : 'Napredni student app za upravljanje domaćim zadacima, praćenje napretka, komunikaciju s instruktorom i predaju zadataka. Napravljen za moderno matematičko obrazovanje.'} />
          <meta property="og:title" content={language === 'en' ? 'LukaMath Student App Features' : 'Značajke LukaMath Student App-a'} />
          <meta property="og:description" content={language === 'en' ? 'Discover the advanced features of our student homework management system.' : 'Otkrijte napredne značajke našeg sustava za upravljanje domaćim zadacima.'} />
          <link rel="canonical" href="https://lukamath.replit.app/app-features" />
          <html lang={language} />
        </Helmet>
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <Calculator className="w-8 h-8 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-slate-800">LukaMath</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'Home' : t('nav.home')}
                </Link>
                <Link href="/blog" className="text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'Blog' : t('nav.blog')}
                </Link>
                <Link href="/app-features" className="text-blue-600 font-semibold">
                  {language === 'en' ? 'App Features' : t('nav.app_features')}
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{language === "en" ? "EN" : "HR"}</span>
                  </Button>

                  {isAuthenticated ? (
                    <Link href="/app">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <User className="w-4 h-4 mr-1" />
                        {t("nav.app")}
                      </Button>
                    </Link>
                  ) : (
                    <a href="/api/login">
                      <Button size="sm" variant="outline">
                        <LogIn className="w-4 h-4 mr-1" />
                        {t("nav.login")}
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40">
              <div className="px-4 py-4 space-y-4">
                <Link href="/" className="block text-slate-600 hover:text-blue-600">
                  {language === 'en' ? 'Home' : t('nav.home')}
                </Link>
                <Link href="/blog" className="block text-slate-600 hover:text-blue-600">
                  {language === 'en' ? 'Blog' : t('nav.blog')}
                </Link>
                <Link href="/app-features" className="block text-blue-600 font-semibold">
                  {language === 'en' ? 'App Features' : t('nav.app_features')}
                </Link>
                
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"  
                    onClick={toggleLanguage}
                    className="w-full justify-start"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {language === "en" ? "English" : "Hrvatski"}
                  </Button>
                  
                  {isAuthenticated ? (
                    <Link href="/app" className="block">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <User className="w-4 h-4 mr-2" />
                        {t("nav.app")}
                      </Button>
                    </Link>
                  ) : (
                    <a href="/api/login" className="block">
                      <Button size="sm" variant="outline" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t("nav.login")}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Download App Promotion - Top */}
        <section className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="inline-flex items-center bg-blue-50 rounded-full px-3 py-1 mr-4">
                  <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{language === 'en' ? 'NEW: Mobile App Available' : 'NOVO: Dostupna mobilna aplikacija'}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">
                    {language === 'en' ? 'Get the LukaMath Mobile App' : 'Preuzmite LukaMath mobilnu aplikaciju'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {language === 'en' ? 'Better mobile experience with offline access' : 'Bolje mobilno iskustvo s offline pristupom'}
                  </p>
                </div>
              </div>
              
              <Link href="/pwa">
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm"
                  onClick={() => trackEvent('download_app_click', 'engagement', 'app_features_top', 1)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Get App' : 'Preuzmite'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="gradient-bg text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/5"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
                <Smartphone className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{language === 'en' ? 'Introducing the LukaMath App' : 'Predstavljamo LukaMath aplikaciju'}</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === 'en' ? 'Your Personal' : 'Vaš osobni'}
                <span className="text-gradient">{language === 'en' ? ' Homework Management System' : ' sustav za upravljanje domaćim zadacima'}</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed max-w-3xl mx-auto">
                {language === 'en' ? 
                  'Stay organized with your math assignments, track your progress, ask Luka questions anytime, and schedule sessions - all in one dedicated platform.' :
                  t('app_features.subtitle')
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link href="/app">
                    <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                      <User className="w-5 h-5 mr-2" />
                      {language === 'en' ? 'Go to My App' : 'Idite na moju aplikaciju'}
                    </Button>
                  </Link>
                ) : (
                  <a href="/api/login">
                    <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                      <LogIn className="w-5 h-5 mr-2" />
                      {language === 'en' ? 'Sign Up for Free' : t('app_features.get_started')}
                    </Button>
                  </a>
                )}
                
                <Link href="/">
                  <Button 
                    variant="outline"
                    className="border-white bg-white text-slate-800 hover:bg-slate-100 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Back to Home' : 'Povratak na početnu'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Everything You Need to Stay Organized' : t('app_features.features_title')}</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {language === 'en' ? 
                  'Your personal homework management system designed to keep you on track with assignments, questions, and progress with Luka as your dedicated tutor.' :
                  t('app_features.features_subtitle')
                }
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {appFeatures.map((feature, index) => (
                <Card key={index} className="bg-white hover:shadow-xl transition-shadow border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center text-sm text-slate-500">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">{language === 'en' ? 'How the LukaMath App Works' : t('app_features.how_it_works_title')}</h2>
              <p className="text-xl text-slate-600">{language === 'en' ? 'Simple steps to transform your math learning experience' : t('app_features.how_it_works_subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 items-center max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Create Your Account' : t('app_features.step1_title')}</h3>
                <p className="text-slate-600">{language === 'en' ? 'Sign up for free and get access to your personal homework management dashboard with Luka as your tutor.' : t('app_features.step1_desc')}</p>
              </div>
              
              {/* Arrow between steps 1 and 2 */}
              <div className="hidden md:flex justify-center items-center">
                <svg width="60" height="40" viewBox="0 0 60 40" className="text-blue-400">
                  <path
                    d="M10 20 Q30 10 50 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead1)"
                  />
                  <defs>
                    <marker
                      id="arrowhead1"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                </svg>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Receive Assignments' : t('app_features.step2_title')}</h3>
                <p className="text-slate-600">{language === 'en' ? 'Get homework assignments from Luka, track deadlines, ask questions, and submit your completed work.' : t('app_features.step2_desc')}</p>
              </div>
              
              {/* Arrow between steps 2 and 3 */}
              <div className="hidden md:flex justify-center items-center">
                <svg width="60" height="40" viewBox="0 0 60 40" className="text-emerald-400">
                  <path
                    d="M10 20 Q30 30 50 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead2)"
                  />
                  <defs>
                    <marker
                      id="arrowhead2"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="currentColor"
                      />
                    </marker>
                  </defs>
                </svg>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Schedule and Progress' : t('app_features.step3_title')}</h3>
                <p className="text-slate-600">{language === 'en' ? 'Check Luka\'s availability for sessions, track your grades, and monitor your improvement over time.' : t('app_features.step3_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Download App Promotion - Bottom */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  {language === 'en' ? 'Take Your Learning Mobile' : 'Učite gdje god da ste'}
                </h2>
                <p className="text-lg text-purple-100 mb-8 leading-relaxed">
                  {language === 'en' ? 
                    'Install our Progressive Web App on your phone for the best mobile experience. Work offline, get push notifications, and access all features in a native app-like interface.' :
                    'Instalirajte našu Progressive Web App na svoj telefon za najbolje mobilno iskustvo. Radite offline, primajte push obavijesti i pristupite svim značajkama u sučelju koje izgleda kao izvorna aplikacija.'
                  }
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>{language === 'en' ? 'Offline homework access' : 'Offline pristup domaćim zadacima'}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>{language === 'en' ? 'Push notifications for new assignments' : 'Push obavijesti za nove zadatke'}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>{language === 'en' ? 'Native app-like experience' : 'Iskustvo poput izvorne aplikacije'}</span>
                  </div>
                </div>
                
                <Link href="/pwa">
                  <Button 
                    size="lg" 
                    className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                    onClick={() => trackEvent('download_app_click', 'engagement', 'app_features_bottom', 1)}
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Get Mobile App' : 'Preuzmite mobilnu aplikaciju'}
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Smartphone className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">LukaMath PWA</h3>
                    <p className="text-purple-100 mb-6">
                      {language === 'en' ? 'Installable on any device' : 'Može se instalirati na bilo koji uređaj'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 rounded-lg p-3">
                        <strong>iOS</strong><br />
                        {language === 'en' ? 'Safari > Share > Add to Home Screen' : 'Safari > Dijeli > Dodaj na početni zaslon'}
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <strong>Android</strong><br />
                        {language === 'en' ? 'Chrome > Menu > Install App' : 'Chrome > Izbornik > Instaliraj aplikaciju'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">{language === 'en' ? 'Ready to Get Organized with Your Math Homework?' : t('app_features.cta_title')}</h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {language === 'en' ? 
                'Join students who are staying on top of their assignments and improving their math skills with Luka\'s dedicated homework management system.' :
                t('app_features.cta_desc')
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/app">
                  <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                    <User className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Access My Dashboard' : 'Pristupite mojoj ploči'}
                  </Button>
                </Link>
              ) : (
                <a href="/api/login">
                  <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                    <LogIn className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Sign Up for Free' : t('app_features.get_started')}
                  </Button>
                </a>
              )}
              
              <Link href="/">
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                >
                  {language === 'en' ? 'Learn More About Tutoring' : 'Saznajte više o poduci'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Calculator className="w-8 h-8 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold">LukaMath</span>
                </div>
                <p className="text-slate-400">
                  {language === 'en' ? 
                    'Personalized online math tutoring that builds confidence and achieves results.' :
                    'Personalizirano online podučavanje matematike koje gradi samopouzdanje i postiže rezultate.'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{language === 'en' ? 'Navigation' : 'Navigacija'}</h3>
                <div className="space-y-2">
                  <Link href="/" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Home' : 'Početna'}</Link>
                  <Link href="/blog" className="block text-slate-400 hover:text-white transition-colors">Blog</Link>
                  <Link href="/app-features" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'App Features' : 'Značajke aplikacije'}</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{language === 'en' ? 'Math Levels' : 'Razine matematike'}</h3>
                <div className="space-y-2">
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Middle School Math' : t('level.middle_school')}</Link>
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'High School Math' : t('level.high_school')}</Link>
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Statistics' : t('level.statistics')}</Link>
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Linear Algebra' : t('level.linear_algebra')}</Link>
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'SAT/ACT Prep' : t('level.sat_act')}</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{language === 'en' ? 'Get Started' : 'Počnite'}</h3>
                <div className="space-y-2">
                  <Link href="/register" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Sign Up Free' : 'Registrirajte se besplatno'}</Link>
                  <Link href="/#contact" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Free 15-Min Trial' : 'Besplatno 15-min probno'}</Link>
                  <Link href="/#about" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'About Luka' : t('nav.about')}</Link>
                  <Link href="/#pricing" className="block text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Pricing' : t('nav.pricing')}</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{language === 'en' ? 'Contact' : t('footer.contact')}</h3>
                <div className="space-y-2 text-slate-400">
                  <p>luka@lukamath.com</p>
                  <p>+385 97 6507 908</p>
                  <p>{language === 'en' ? 'Available 7 days a week' : t('footer.available')}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 mt-8 pt-8 text-center">
              <p className="text-slate-400">
                {language === 'en' ? 
                  '© 2025 LukaMath. All rights reserved.' :
                  '© 2025 LukaMath. Sva prava zadržana.'
                }
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default AppFeatures;