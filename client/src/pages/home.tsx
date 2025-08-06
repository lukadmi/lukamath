import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calculator, Play, Video, Star, TrendingUp, CheckCircle, Send, Clock, Mail, Phone, Check, Download, ExternalLink, Edit3, Target, FileText, BookOpen, Compass, Menu, X, Shield, ArrowRight, ChevronLeft, ChevronRight, Award, Globe, LogIn, User, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { Helmet } from 'react-helmet-async';

import anoushka_puri_f1YfrZ1o2r8_unsplash from "@assets/anoushka-puri-f1YfrZ1o2r8-unsplash.jpg";

const mathLevels = [
  {
    id: "middle-school",
    icon: "√",
    title: "Middle School Math",
    description: "Grades 6-8",
    price: 20,
    priceEur: 15,
    color: "text-blue-600"
  },
  {
    id: "high-school",
    icon: "△",
    title: "High School Math", 
    description: "Grades 9-12",
    price: 30,
    priceEur: 20,
    color: "text-emerald-600"
  },
  {
    id: "university",
    icon: "∞",
    title: "University Math",
    description: "College Level", 
    price: 40,
    priceEur: 25,
    color: "text-purple-600"
  },
  {
    id: "sat-act",
    icon: "🏆",
    title: "SAT/ACT Prep",
    description: "Test Preparation",
    price: 45,
    priceEur: 20,
    color: "text-orange-600",
    popular: true
  }
];

const services = [
  {
    id: "middle",
    icon: "√",
    title: "Middle School Math",
    description: "Basic algebra, fractions, and foundational problem-solving",
    price: 20,
    priceEur: 15,
    color: "text-blue-600",
    tagline: "Start strong with the basics"
  },
  {
    id: "high",
    icon: "△",
    title: "High School Math", 
    description: "Algebra, geometry, trigonometry, and pre-calculus",
    price: 30,
    priceEur: 20,
    color: "text-emerald-600",
    tagline: "Master advanced concepts"
  },
  {
    id: "university",
    icon: "∞",
    title: "University Math",
    description: "Statistics and linear algebra for college success", 
    price: 40,
    priceEur: 25,
    color: "text-purple-600",
    tagline: "Excel in higher mathematics"
  },
  {
    id: "satact",
    icon: "🏆",
    title: "SAT/ACT Math Bootcamp",
    description: "Test strategies and practice for your best score",
    price: 45,
    priceEur: 20,
    color: "text-blue-600",
    tagline: "Most Popular",
    popular: true
  }
];



const resources = [
  {
    title: "Algebra Quick Reference",
    description: "Essential formulas and concepts for algebra success",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    action: "Download PDF"
  },
  {
    title: "Geometry Cheat Sheet", 
    description: "Area, perimeter, and volume formulas made simple",
    icon: Compass,
    color: "bg-emerald-100 text-emerald-600",
    action: "Download PDF"
  },
  {
    title: "SAT Math Strategy",
    description: "Test-taking strategies to maximize your score", 
    icon: Target,
    color: "bg-yellow-100 text-yellow-600",
    action: "Download PDF"
  },
  {
    title: "Calculus Study Guide",
    description: "Comprehensive PDF guide covering limits, derivatives, and integrals",
    icon: FileText,
    color: "bg-purple-100 text-purple-600", 
    action: "Download PDF"
  },
  {
    title: "Practice Problem Sets",
    description: "Hundreds of problems with step-by-step solutions",
    icon: Edit3,
    color: "bg-red-100 text-red-600",
    action: "Access Problems"
  },
  {
    title: "Calculator Tips",
    description: "Master your graphing calculator for tests",
    icon: Calculator,
    color: "bg-green-100 text-green-600",
    action: "View Guide"
  }
];

const blogPreviews = [
  {
    title: "5 Essential SAT Math Strategies That Actually Work",
    excerpt: "Master the most effective test-taking strategies that can boost your SAT math score by 100+ points.",
    readTime: "8 min read",
    category: "Test Prep"
  },
  {
    title: "How to Stop Making Silly Mistakes in Algebra",
    excerpt: "The most common algebra errors students make and proven techniques to eliminate careless mistakes.",
    readTime: "6 min read",
    category: "Algebra"
  },
  {
    title: "Geometry Proofs Made Simple: A Step-by-Step Guide",
    excerpt: "Break down complex geometry proofs into manageable steps with logical flow patterns.",
    readTime: "10 min read",
    category: "Geometry"
  }
];

// University logos
import dukeLogoPath from "@assets/duke.png";
import illinoisTechLogoPath from "@assets/iit_seal.gif";
import ucIrvineLogoPath from "@assets/UCI.png";

const certificates = [
  {
    title: "Math for Data Science",
    institution: "Duke University",
    logo: dukeLogoPath,
    logoAlt: "Duke University",
    type: "Certificate",
    description: "Statistical foundations and mathematical modeling"
  },
  {
    title: "Master of Data Science",
    institution: "Illinois Institute of Technology",
    logo: illinoisTechLogoPath,
    logoAlt: "Illinois Institute of Technology",
    type: "Degree",
    description: "Advanced analytics and machine learning"
  },
  {
    title: "Virtual Teaching Specialization",
    institution: "University of California, Irvine",
    logo: ucIrvineLogoPath,
    logoAlt: "UC Irvine",
    type: "Specialization",
    description: "Online pedagogy and instructional design"
  },
  {
    title: "Data Analytics Certificate",
    institution: "Google",
    logo: null, // No Google logo uploaded yet
    logoAlt: "Google",
    type: "Professional Certificate",
    description: "Business intelligence and data visualization"
  },
  {
    title: "Data Science Math Skills",
    institution: "University of Colorado Boulder",
    logo: null, // No Colorado Boulder logo uploaded yet
    logoAlt: "University of Colorado Boulder",
    type: "Certificate",
    description: "Mathematical foundations for data science"
  }
];

// Use useLanguage hook for translations
function useTranslations() {
  const { t } = useLanguage();
  return t;
}

// Pricing Section Component
function PricingSection({ scrollToSection }: { scrollToSection: (sectionId: string) => void }) {
  const [selectedLevel, setSelectedLevel] = useState<string>("middle-school");
  const { language, t } = useLanguage();
  
  const selectedMathLevel = mathLevels.find(level => level.id === selectedLevel);
  
  const getPricingPackages = (hourlyRate: number, isEuros: boolean = false) => {
    const singleSession = hourlyRate;
    const fourSessionPrice = Math.round(hourlyRate * 4 * 0.85); // 15% discount
    const eightSessionPrice = Math.round(hourlyRate * 8 * 0.8); // 20% discount
    
    return {
      single: {
        price: singleSession,
        sessions: 1,
        savings: 0
      },
      package: {
        price: fourSessionPrice,
        sessions: 4,
        perHour: Math.round(fourSessionPrice / 4),
        savings: (hourlyRate * 4) - fourSessionPrice
      },
      intensive: {
        price: eightSessionPrice,
        sessions: 8,
        perHour: Math.round(eightSessionPrice / 8),
        savings: (hourlyRate * 8) - eightSessionPrice
      }
    };
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            {language === 'en' ? 'Simple, Transparent Pricing' : t('pricing.title')}
          </h2>
          <p className="text-xl text-slate-600">
            {language === 'en' ? 'First, choose your math level to see relevant pricing' : t('pricing.subtitle')}
          </p>
        </div>
        
        {/* Level Selection */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
            {language === 'en' ? 'Select Your Math Level' : t('pricing.select_level')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mathLevels.map((level) => (
              <Card 
                key={level.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedLevel === level.id 
                    ? 'ring-2 ring-blue-600 bg-blue-50' 
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`text-4xl mb-3 ${level.color}`}>{level.icon}</div>
                  <h4 className="text-lg font-bold mb-2">
                    {language === 'en' ? level.title : 
                     level.id === 'university' ? 'Sveučilišna matematika' :
                     t(`level.${level.id.replace('-', '_')}`)}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {language === 'en' ? level.description : t(`level.${level.id.replace('-', '_')}_desc`)}
                  </p>
                  <div className={`text-xl font-bold ${level.color}`}>
                    {language === 'en' ? `$${level.price}/hr` : `${level.priceEur}€/h`}
                  </div>
                  {level.popular && (
                    <Badge className="mt-2 bg-blue-600 text-white">
                      {language === 'en' ? 'Most Popular' : t('pricing.most_popular')}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Packages */}
        {selectedMathLevel && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {language === 'en' ? `${selectedMathLevel.title} Packages` : `${t(`level.${selectedMathLevel.id.replace('-', '_')}`)} ${t('pricing.packages')}`}
              </h3>
              <p className="text-slate-600">
                {language === 'en' ? 'Choose the package that fits your learning goals' : t('pricing.choose_package')}
              </p>
            </div>
            
            {(() => {
              const isEuros = language === 'hr';
              const currentPrice = isEuros ? selectedMathLevel.priceEur : selectedMathLevel.price;
              const packages = getPricingPackages(currentPrice, isEuros);
              
              return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Single Session */}
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {language === 'en' ? 'Single Session' : t('pricing.single_session')}
                      </CardTitle>
                      <div className="text-4xl font-bold text-blue-600">
                        {isEuros ? `${packages.single.price}€` : `$${packages.single.price}`}<span className="text-lg text-slate-600">/
                        {language === 'en' ? 'hour' : t('pricing.hour')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'One-on-one tutoring' : t('pricing.one_on_one')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Personalized lesson plan' : t('pricing.personalized_plan')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Practice materials' : t('pricing.practice_materials')}
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-slate-600 hover:bg-slate-700"
                        onClick={() => scrollToSection('contact')}
                      >
                        {language === 'en' ? 'Book Session' : t('pricing.book_session')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Package Deal (Most Popular) */}
                  <Card className="bg-blue-600 text-white border-2 border-blue-600 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-400 text-slate-800">
                        {language === 'en' ? 'Most Popular' : t('pricing.most_popular')}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {language === 'en' ? '4-Session Package' : t('pricing.four_session_package')}
                      </CardTitle>
                      <div className="text-4xl font-bold">
                        {isEuros ? `${packages.package.price}€` : `$${packages.package.price}`}<span className="text-lg opacity-80"> ({isEuros ? `${packages.package.perHour}€` : `$${packages.package.perHour}`}/
                        {language === 'en' ? 'hr' : t('pricing.hr')})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-400 mr-3" />
                          {language === 'en' ? 'Four 1-hour sessions (use within 1 month)' : t('pricing.four_sessions')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-400 mr-3" />
                          {language === 'en' ? `Save $${packages.package.savings} total` : `${t('pricing.save')} ${isEuros ? `${packages.package.savings}€` : `$${packages.package.savings}`} ${t('pricing.total')}`}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-400 mr-3" />
                          {language === 'en' ? 'Structured learning path' : t('pricing.structured_path')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-400 mr-3" />
                          {language === 'en' ? 'Weekly progress reviews' : t('pricing.weekly_reviews')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-400 mr-3" />
                          {language === 'en' ? 'Priority scheduling' : t('pricing.priority_scheduling')}
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-yellow-400 text-slate-800 hover:bg-yellow-300 font-semibold"
                        onClick={() => scrollToSection('contact')}
                      >
                        {language === 'en' ? 'Start Package' : t('pricing.start_package')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Intensive Program */}
                  <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {language === 'en' ? '8-Session Intensive' : t('pricing.eight_session_intensive')}
                      </CardTitle>
                      <div className="text-4xl font-bold text-emerald-600">
                        {isEuros ? `${packages.intensive.price}€` : `$${packages.intensive.price}`}<span className="text-lg text-slate-600"> ({isEuros ? `${packages.intensive.perHour}€` : `$${packages.intensive.perHour}`}/
                        {language === 'en' ? 'hr' : t('pricing.hr')})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Eight 1-hour sessions (use within 2 months)' : t('pricing.eight_sessions')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? `Save $${packages.intensive.savings} total` : `${t('pricing.save')} ${isEuros ? `${packages.intensive.savings}€` : `$${packages.intensive.savings}`} ${t('pricing.total')}`}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Comprehensive curriculum' : t('pricing.comprehensive_curriculum')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Progress assessments' : t('pricing.progress_assessments')}
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 text-emerald-600 mr-3" />
                          {language === 'en' ? 'Flexible scheduling' : t('pricing.flexible_scheduling')}
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => scrollToSection('contact')}
                      >
                        {language === 'en' ? 'Start Intensive' : t('pricing.start_intensive')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            <div className="text-center mt-12">
              <p className="text-slate-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600 mr-2" />
                {language === 'en' ? '100% satisfaction guarantee • 15-minute free trial session' : t('pricing.guarantee')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function HomeContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      // Track contact form submission in Google Analytics
      trackEvent('contact_form_submit', 'engagement', 'home_page', 1);
      
      setSuccessModalOpen(true);
      form.reset();
      toast({
        title: "Message Sent!",
        description: "Thank you for your interest! I'll get back to you within 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle URL hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          scrollToSection(hash);
        }, 100);
      }
    };

    // Check hash on initial load
    handleHashNavigation();
    
    // Also listen for hash changes (if user uses back/forward buttons)
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  const onSubmit = (data: InsertContact) => {
    // Track form submission attempt
    trackEvent('contact_form_attempt', 'engagement', 'home_page', 1);
    contactMutation.mutate(data);
  };

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        if (window.scrollY > 100) {
          nav.classList.add('shadow-lg');
        } else {
          nav.classList.remove('shadow-lg');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-inter antialiased">
      <Helmet>
        <title>{language === 'en' ? 'LukaMath - Online Math Tutoring | Ace Your Math Tests' : 'LukaMath - Online matematičko instruiranje | Pobijedi na matematici'}</title>
        <meta name="description" content={language === 'en' ? 'Professional online math tutoring with personalized one-on-one sessions. Algebra, Geometry, Calculus, SAT/ACT prep. Free 15-minute trial available.' : 'Profesionalno online matematičko instruiranje s personaliziranim sesijama jedan na jedan. Algebra, geometrija, analiza. Besplatna 15-minutna proba dostupna.'} />
        <meta property="og:title" content={language === 'en' ? 'LukaMath - Online Math Tutoring' : 'LukaMath - Online matematičko instruiranje'} />
        <meta property="og:description" content={language === 'en' ? 'Professional online math tutoring with personalized one-on-one sessions. Free 15-minute trial available.' : 'Profesionalno online matematičko instruiranje s personaliziranim sesijama. Besplatna 15-minutna proba dostupna.'} />
        <link rel="canonical" href="https://lukamath.replit.app/" />
        <html lang={language} />
      </Helmet>
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center">
                <Calculator className="w-8 h-8 mr-2" />
                LukaMath
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button onClick={() => scrollToSection('services')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'Services' : t('nav.services')}
                </button>
                <button onClick={() => scrollToSection('about')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'About' : t('nav.about')}
                </button>
                <button onClick={() => scrollToSection('pricing')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'Pricing' : t('nav.pricing')}
                </button>
                <button onClick={() => scrollToSection('resources')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  {language === 'en' ? 'Resources' : t('nav.resources')}
                </button>
                <Link href="/blog">
                  <span 
                    className="nav-item text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => trackEvent('navigation_click', 'engagement', 'blog_link', 1)}
                  >
                    {language === 'en' ? 'Blog' : t('nav.blog')}
                  </span>
                </Link>
                <Link href="/app-features">
                  <span 
                    className="nav-item text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => trackEvent('navigation_click', 'engagement', 'app_features_link', 1)}
                  >
                    App
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "en" ? "hr" : "en")}
                  className="text-slate-600 hover:text-blue-600"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {language === "en" ? "HR" : "EN"}
                </Button>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link href="/app">
                    <Button variant="outline" className="hidden md:flex">
                      <User className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Student App' : t("nav.student_app")}
                    </Button>
                  </Link>
                  <a href="/api/logout">
                    <Button variant="ghost" size="sm">
                      Logout
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/register">
                    <Button 
                      variant="ghost" 
                      className="hidden sm:flex hover:scale-105 transition-transform"
                      onClick={() => trackEvent('navigation_click', 'conversion', 'register_button', 1)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </Link>
                  <a href="/api/login">
                    <Button 
                      variant="outline" 
                      className="hidden md:flex hover:scale-105 transition-transform"
                      onClick={() => trackEvent('navigation_click', 'engagement', 'login_button', 1)}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Login' : t("nav.login")}
                    </Button>
                  </a>
                  <Button onClick={() => {
                    trackEvent('cta_click', 'engagement', 'nav_book_trial', 1);
                    scrollToSection('contact');
                  }} className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-transform">
                    {language === 'en' ? 'Book Free Trial Session' : t("hero.cta_primary")}
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden ml-4"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button onClick={() => { scrollToSection('services'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  Services
                </button>
                <button onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  About
                </button>
                <button onClick={() => { scrollToSection('pricing'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  Pricing
                </button>
                <button onClick={() => { scrollToSection('resources'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  Resources
                </button>
                <Link href="/blog">
                  <span className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    Blog
                  </span>
                </Link>
                <Link href="/app-features">
                  <span className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                    App
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === 'en' ? (
                  <>
                    Ace Your Math Tests — 
                    <span className="text-gradient"> One Problem at a Time</span>
                  </>
                ) : (
                  <>
                    {t('hero.title')}
                    <span className="text-white"> — </span>
                    <span className="text-yellow-400">uz personalizirano podučavanje</span>
                  </>
                )}
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                {language === 'en' ? 
                  'Personalized, online one-on-one sessions that turn confusion into confidence.' : 
                  t('hero.subtitle')
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => {
                    trackEvent('cta_click', 'engagement', 'hero_book_trial', 1);
                    scrollToSection('contact');
                  }}
                  className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Book Your Free 15-Min Trial' : t('hero.cta_primary')}
                </Button>
                <Link href="/app-features">
                  <Button 
                    variant="outline"
                    className="border-white bg-white text-slate-800 hover:bg-slate-100 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                    onClick={() => trackEvent('cta_click', 'engagement', 'hero_explore_app', 1)}
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Explore Our App' : t('hero.cta_secondary')}
                  </Button>
                </Link>
              </div>
              
            </div>
            <div className="relative">
              <img 
                src={anoushka_puri_f1YfrZ1o2r8_unsplash} 
                alt="Professional math tutor with whiteboard" 
                className="rounded-2xl shadow-2xl w-full"
                loading="eager"
                decoding="async"
                width="600"
                height="400"
              />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-800 p-3 rounded-full shadow-lg animate-float">
                <Star className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              {language === 'en' ? 'Math Made Simple' : t('services.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {language === 'en' ? 'From middle school foundations to university-level concepts' : t('services.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`service-card hover:shadow-xl transition-all duration-200 ${service.popular ? 'border-2 border-blue-600 relative' : ''}`}>
                <CardHeader>
                  <div className={`text-4xl font-bold mb-4 ${service.color}`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    {language === 'en' ? service.title : 
                      service.id === 'middle' ? t('services.middle_school') :
                      service.id === 'high' ? t('services.high_school') :
                      service.id === 'university' ? t('services.university') :
                      t('services.sat_act')
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {language === 'en' ? service.description : 
                      service.id === 'middle' ? t('services.middle_desc') :
                      service.id === 'high' ? t('services.high_desc') :
                      service.id === 'university' ? t('services.university_desc') :
                      t('services.sat_desc')
                    }
                  </p>
                  <div className={`text-2xl font-bold mb-2 ${service.color}`}>
                    {language === 'en' ? `$${service.price}/hr` : 
                      service.id === 'middle' ? '15€/h' :
                      service.id === 'high' ? '20€/h' :
                      service.id === 'university' ? '25€/h' :
                      '20€/h'
                    }
                  </div>
                  <p className="text-sm text-slate-500">
                    {language === 'en' ? service.tagline : 
                      service.id === 'middle' ? t('services.middle_tagline') :
                      service.id === 'high' ? t('services.high_tagline') :
                      service.id === 'university' ? t('services.university_tagline') :
                      t('services.sat_tagline')
                    }
                  </p>
                  {service.popular && (
                    <Badge className="mt-2 bg-blue-600 text-white">
                      {language === 'en' ? 'Most Popular' : t('services.most_popular')}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                {language === 'en' ? 'Meet Your Math Mentor' : t('about.title')}
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {language === 'en' ? "I'm Luka, and I've been helping students conquer their math fears for over 5 years. With a degree in Data Science in progress and a passion for teaching, I specialize in making complex concepts simple." : t('about.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>{language === 'en' ? '5+ years of tutoring experience' : t('about.experience')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>{language === 'en' ? 'Data Science degree from top university' : t('about.education')}</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>{language === 'en' ? 'Specialized in test preparation' : t('about.specialization')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
                alt="Professional math tutor Luka" 
                className="rounded-2xl shadow-2xl w-full"
              />
              
            </div>
          </div>
        </div>
      </section>
      {/* Certificates Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 mr-3 text-blue-600" />
              {language === 'en' ? 'Credentials and Certifications' : t('certificates.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {language === 'en' ? 'Continuous learning to provide the best math education' : t('certificates.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.slice(0, 3).map((cert, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {cert.logo ? (
                        <img 
                          src={cert.logo} 
                          alt={cert.logoAlt}
                          className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm border border-gray-200"
                          onError={(e) => {
                            // Fallback to a generic education icon if logo fails to load
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 border border-gray-200 ${cert.logo ? 'hidden' : 'flex'}`}>
                        <Award className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className="bg-blue-600 text-white mb-2 text-xs">{cert.type}</Badge>
                      <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{cert.title}</h3>
                      <p className="font-medium text-slate-600 mb-2">{cert.institution}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{cert.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <PricingSection scrollToSection={scrollToSection} />
      {/* Resources Section */}
      <section id="resources" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              {language === 'en' ? 'Free Math Resources' : t('resources.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {language === 'en' ? 'Study guides, practice problems, and helpful tips' : t('resources.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${resource.color}`}>
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {language === 'en' ? resource.title : t(`resources.${
                      resource.title === 'Algebra Quick Reference' ? 'algebra_title' :
                      resource.title === 'Geometry Cheat Sheet' ? 'geometry_title' :
                      resource.title === 'SAT Math Strategy' ? 'sat_title' :
                      resource.title === 'Calculus Study Guide' ? 'calculus_title' :
                      resource.title === 'Practice Problem Sets' ? 'practice_title' :
                      'calculator_title'
                    }`)}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {language === 'en' ? resource.description : t(`resources.${
                      resource.title === 'Algebra Quick Reference' ? 'algebra_desc' :
                      resource.title === 'Geometry Cheat Sheet' ? 'geometry_desc' :
                      resource.title === 'SAT Math Strategy' ? 'sat_desc' :
                      resource.title === 'Calculus Study Guide' ? 'calculus_desc' :
                      resource.title === 'Practice Problem Sets' ? 'practice_desc' :
                      'calculator_desc'
                    }`)}
                  </p>
                  <Button variant="link" className="p-0 h-auto font-semibold text-left">
                    {language === 'en' ? resource.action : t(`resources.${
                      resource.action === 'Download PDF' ? 'download_pdf' :
                      resource.action === 'Access Problems' ? 'access_problems' :
                      'view_guide'
                    }`)} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              {language === 'en' ? 'Latest Math Insights' : t('blog.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {language === 'en' ? 'Expert tips, study strategies, and math concepts explained simply' : t('blog.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {blogPreviews.map((post, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Badge className="bg-blue-600 text-white w-fit mb-2">{post.category}</Badge>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </span>
                    <Button variant="link" className="p-0 h-auto font-semibold">
                      {language === 'en' ? 'Read More' : t('blog.read_more')} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 h-auto">
                <BookOpen className="w-5 h-5 mr-2" />
                {language === 'en' ? 'View All Articles' : t('blog.view_all')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              {language === 'en' ? 'Ready to Start Learning?' : t('contact.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {language === 'en' ? 'Book your free trial session and see the difference personalized tutoring makes' : t('contact.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {language === 'en' ? 'Book Your Free Trial' : t('contact.form_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'en' ? 'Full Name *' : `${t('contact.full_name')} *`}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={language === 'en' ? 'Your full name' : t('contact.full_name')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'en' ? 'Email Address *' : `${t('contact.email')} *`}
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={language === 'en' ? 'your.email@example.com' : t('contact.email')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'en' ? 'Phone Number' : t('contact.phone')}
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder={language === 'en' ? '(555) 123-4567' : t('contact.phone')} {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === 'en' ? 'Math Level *' : `${t('contact.math_level')} *`}
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={language === 'en' ? 'Select your math level' : t('contact.math_level')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="middle-school">
                                  {language === 'en' ? 'Middle School Math (Grades 6-8)' : t('level.middle_school')}
                                </SelectItem>
                                <SelectItem value="high-school">
                                  {language === 'en' ? 'High School Math (Grades 9-12)' : t('level.high_school')}
                                </SelectItem>
                                <SelectItem value="statistics">
                                  {language === 'en' ? 'Statistics' : t('level.statistics')}
                                </SelectItem>
                                <SelectItem value="linear-algebra">
                                  {language === 'en' ? 'Linear Algebra' : t('level.linear_algebra')}
                                </SelectItem>
                                <SelectItem value="sat-act">
                                  {language === 'en' ? 'SAT/ACT Prep (Test Preparation)' : t('level.sat_act')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'en' ? 'Tell me about your math goals *' : `${t('contact.goals')} *`}
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={language === 'en' ? 'What specific topics do you need help with? What are your goals?' : t('contact.goals_placeholder')}
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 h-auto font-semibold"
                      disabled={contactMutation.isPending}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {contactMutation.isPending ? 
                        (language === 'en' ? 'Sending...' : t('common.sending')) : 
                        (language === 'en' ? 'Book My Free Trial Session' : t('contact.submit'))
                      }
                    </Button>
                  </form>
                </Form>
                <div className="text-center mt-4 text-sm text-slate-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {language === 'en' ? "I'll respond within 24 hours to schedule your session" : t('contact.response_time')}
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold mb-6">
                {language === 'en' ? "Let's Connect" : t('contact.lets_connect')}
              </h3>
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">
                      {language === 'en' ? 'Email' : t('contact.email_label')}
                    </div>
                    <div className="text-slate-600">luka@lukamath.com</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">
                      {language === 'en' ? 'Phone' : t('contact.phone_label')}
                    </div>
                    <div className="text-slate-600">+385 97 6507 908</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">
                      {language === 'en' ? 'Available Hours (CET)' : t('contact.hours')}
                    </div>
                    <div className="text-slate-600">
                      {language === 'en' ? 'Mon-Fri: 3pm-9pm' : 'Pon-Pet: 15-21h'}<br />
                      {language === 'en' ? 'Sat-Sun: 10am-6pm' : 'Sub-Ned: 10-18h'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-4">
                    {language === 'en' ? 'Why Choose LukaMath?' : t('why.title')}
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      {language === 'en' ? 'Personalized learning approach' : t('why.personalized')}
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      {language === 'en' ? 'Proven track record of success' : t('why.proven')}
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      {language === 'en' ? 'Flexible scheduling options' : t('why.flexible')}
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      {language === 'en' ? '100% satisfaction guarantee' : t('why.guarantee')}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Calculator className="w-8 h-8 mr-2" />
                <span className="text-2xl font-bold">LukaMath</span>
              </div>
              <p className="text-slate-300 mb-4 max-w-md">
                {language === 'en' ? 'Helping students build confidence and achieve success in mathematics through personalized, one-on-one tutoring.' : t('footer.description')}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Math Levels' : 'Razine matematike'}
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Middle School Math' : t('level.middle_school')}
                </button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'High School Math' : t('level.high_school')}
                </button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Statistics' : t('level.statistics')}
                </button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Linear Algebra' : t('level.linear_algebra')}
                </button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'SAT/ACT Prep' : t('level.sat_act')}
                </button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Get Started' : 'Počnite'}
              </h4>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Sign Up Free' : 'Registrirajte se besplatno'}
                </Link></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Free 15-Min Trial' : 'Besplatno 15-min probno'}
                </button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'About Luka' : t('nav.about')}
                </button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Pricing' : t('nav.pricing')}
                </button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Contact' : t('footer.contact')}
              </h4>
              <ul className="space-y-2 text-slate-300">
                <li>luka@lukamath.com</li>
                <li>+385 97 6507 908</li>
                <li>{language === 'en' ? 'Available 7 days a week' : t('footer.available')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>{language === 'en' ? '© 2025 LukaMath. All rights reserved. | Privacy Policy | Terms of Service' : t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                {language === 'en' ? 'Message Sent!' : t('success.title')}
              </DialogTitle>
              <p className="text-slate-600">
                {language === 'en' ? "Thank you for your interest! I'll get back to you within 24 hours to schedule your free trial session." : t('success.message')}
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
