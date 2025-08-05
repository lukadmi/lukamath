import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calculator, Play, Video, Star, TrendingUp, CheckCircle, Send, Clock, Mail, Phone, Check, Download, ExternalLink, Edit3, Target, PlayCircle, BookOpen, Compass, Menu, X, Shield, ArrowRight, ChevronLeft, ChevronRight, Award, Globe, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LanguageContext, type Language, translations } from "@/hooks/useLanguage";
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

const services = [
  {
    icon: "√",
    title: "Algebra I & II",
    description: "Master equations, functions, and problem-solving strategies",
    price: "$45/hr",
    color: "text-blue-600",
    tagline: "Build your foundation strong!"
  },
  {
    icon: "△",
    title: "Geometry & Trigonometry", 
    description: "Visualize concepts and ace those proofs",
    price: "$50/hr",
    color: "text-emerald-600",
    tagline: "Get the right angle on math!"
  },
  {
    icon: "∞",
    title: "Pre-Calculus & Calculus",
    description: "Tackle limits, derivatives, and integrals with confidence", 
    price: "$55/hr",
    color: "text-yellow-600",
    tagline: "Reach your limit... then exceed it!"
  },
  {
    icon: "🏆",
    title: "SAT/ACT Math Bootcamp",
    description: "Test strategies and practice for your best score",
    price: "$60/hr", 
    color: "text-blue-600",
    tagline: "Most Popular!",
    popular: true
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Parent, Junior Student",
    avatar: "S",
    color: "bg-blue-600",
    rating: 5,
    text: "After 8 sessions with Luka, my daughter went from a C to an A in Algebra II! His patience and clear explanations made all the difference."
  },
  {
    name: "Marcus T.",
    role: "High School Senior", 
    avatar: "M",
    color: "bg-emerald-600",
    rating: 5,
    text: "I raised my SAT math score by 120 points in just 2 months! Luka's test strategies and practice problems were exactly what I needed."
  },
  {
    name: "Amy L.",
    role: "Sophomore Student",
    avatar: "A", 
    color: "bg-yellow-600",
    rating: 5,
    text: "Geometry used to give me nightmares. Now I actually enjoy solving proofs! Luka has a gift for making complex topics simple."
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
    title: "Calculus Fundamentals",
    description: "Free video series covering limits and derivatives",
    icon: PlayCircle,
    color: "bg-purple-100 text-purple-600", 
    action: "Watch Video"
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

const certificates = [
  {
    title: "Math for Data Science",
    institution: "Duke University",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23012169'/%3E%3Ctext x='50' y='30' font-family='serif' font-size='12' fill='white' text-anchor='middle'%3EDUKE%3C/text%3E%3Ctext x='50' y='70' font-family='serif' font-size='8' fill='white' text-anchor='middle'%3EUNIVERSITY%3C/text%3E%3C/svg%3E",
    logoAlt: "Duke University",
    type: "Specialization",
    description: "Statistical foundations and mathematical modeling"
  },
  {
    title: "Data Science Master's",
    institution: "Illinois Institute of Technology",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23CC0000'/%3E%3Ctext x='50' y='30' font-family='serif' font-size='10' fill='white' text-anchor='middle'%3EILLINOIS%3C/text%3E%3Ctext x='50' y='45' font-family='serif' font-size='8' fill='white' text-anchor='middle'%3EINSTITUTE OF%3C/text%3E%3Ctext x='50' y='60' font-family='serif' font-size='8' fill='white' text-anchor='middle'%3ETECHNOLOGY%3C/text%3E%3C/svg%3E",
    logoAlt: "Illinois Institute of Technology",
    type: "Master's Degree",
    description: "Advanced analytics and machine learning"
  },
  {
    title: "Virtual Teaching Specialization",
    institution: "University of California, Irvine",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23FFD200'/%3E%3Ctext x='50' y='30' font-family='serif' font-size='12' fill='%23003DA5' text-anchor='middle'%3EUC%3C/text%3E%3Ctext x='50' y='55' font-family='serif' font-size='10' fill='%23003DA5' text-anchor='middle'%3EIRVINE%3C/text%3E%3C/svg%3E",
    logoAlt: "UC Irvine",
    type: "Certificate",
    description: "Online pedagogy and instructional design"
  },
  {
    title: "Data Analytics Certificate",
    institution: "Google",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='white' stroke='%23dadce0' stroke-width='2'/%3E%3Ctext x='50' y='35' font-family='Arial' font-size='18' fill='%234285f4' text-anchor='middle'%3EG%3C/text%3E%3Ctext x='50' y='55' font-family='Arial' font-size='8' fill='%2334a853' text-anchor='middle'%3EGoogle%3C/text%3E%3C/svg%3E",
    logoAlt: "Google",
    type: "Professional Certificate",
    description: "Business intelligence and data visualization"
  },
  {
    title: "Data Science Math Skills",
    institution: "University of Colorado Boulder",
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23CFB87C'/%3E%3Ctext x='50' y='28' font-family='serif' font-size='8' fill='%23565A5C' text-anchor='middle'%3EUNIVERSITY OF%3C/text%3E%3Ctext x='50' y='45' font-family='serif' font-size='10' fill='%23565A5C' text-anchor='middle'%3ECOLORADO%3C/text%3E%3Ctext x='50' y='62' font-family='serif' font-size='8' fill='%23565A5C' text-anchor='middle'%3EBOULDER%3C/text%3E%3C/svg%3E",
    logoAlt: "University of Colorado Boulder",
    type: "Certificate",
    description: "Mathematical foundations for data science"
  }
];

// Language Provider Component
function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function HomeContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useContext(LanguageContext)!;

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

  const onSubmit = (data: InsertContact) => {
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
                  Services
                </button>
                <button onClick={() => scrollToSection('about')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  About
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  Reviews
                </button>
                <button onClick={() => scrollToSection('pricing')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('resources')} className="nav-item text-slate-600 hover:text-blue-600 transition-colors">
                  Resources
                </button>
                <Link href="/blog">
                  <span className="nav-item text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                    Blog
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
                      {t("nav.app")}
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
                  <a href="/api/login">
                    <Button variant="outline" className="hidden md:flex">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("nav.login")}
                    </Button>
                  </a>
                  <Button onClick={() => scrollToSection('contact')} className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("hero.cta.primary")}
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
                <button onClick={() => { scrollToSection('testimonials'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  Reviews
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
                Ace Your Math Tests – 
                <span className="text-gradient"> One Problem at a Time</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Personalized, online one-on-one sessions that turn confusion into confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => scrollToSection('contact')}
                  className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 text-lg px-8 py-4 h-auto shadow-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Book Your Free 15-Min Trial
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-lg px-8 py-4 h-auto backdrop-blur-sm font-semibold"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional math tutor with whiteboard" 
                className="rounded-2xl shadow-2xl w-full"
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
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Math Made Simple</h2>
            <p className="text-xl text-slate-600">From basic algebra to advanced calculus, I've got you covered!</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`service-card hover:shadow-xl transition-all duration-200 ${service.popular ? 'border-2 border-blue-600 relative' : ''}`}>
                <CardHeader>
                  <div className={`text-4xl font-bold mb-4 ${service.color}`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl mb-3">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <div className={`text-2xl font-bold mb-2 ${service.color}`}>{service.price}</div>
                  <p className="text-sm text-slate-500">{service.tagline}</p>
                  {service.popular && (
                    <Badge className="mt-2 bg-blue-600 text-white">
                      Most Popular!
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
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Meet Your Math Mentor</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Hi! I'm Luka, and I've been helping students conquer their math fears for over 5 years. 
                With a degree in Mathematics and a passion for teaching, I specialize in making complex 
                concepts simple and engaging.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>5+ years of tutoring experience</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>Mathematics degree from top university</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>200+ students with improved grades</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <span>Specialized in test preparation</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
                alt="Professional math tutor Luka" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-sm">Rating</div>
                </div>
              </div>
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
              Credentials & Certifications
            </h2>
            <p className="text-lg text-slate-600">Continuous learning to provide the best math education</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.slice(0, 3).map((cert, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={cert.logo} 
                        alt={cert.logoAlt}
                        className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
                        onError={(e) => {
                          // Fallback to a generic education icon if logo fails to load
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 hidden">
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Success Stories That Add Up</h2>
            <p className="text-xl text-slate-600">Real students, real results, real confidence boost!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex text-yellow-500 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Score Improvement Stats */}
          <div className="gradient-bg p-8 rounded-2xl text-white text-center">
            <h3 className="text-2xl font-bold mb-6">Average Score Improvements</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="stat-card p-6 rounded-xl border border-white/20">
                <div className="text-4xl font-bold text-yellow-400 mb-2">+2.1</div>
                <div className="text-lg">Letter Grades</div>
                <div className="text-sm text-blue-100">Average GPA increase</div>
              </div>
              <div className="stat-card p-6 rounded-xl border border-white/20">
                <div className="text-4xl font-bold text-yellow-400 mb-2">+150</div>
                <div className="text-lg">SAT Points</div>
                <div className="text-sm text-blue-100">Math section improvement</div>
              </div>
              <div className="stat-card p-6 rounded-xl border border-white/20">
                <div className="text-4xl font-bold text-yellow-400 mb-2">85%</div>
                <div className="text-lg">Success Rate</div>
                <div className="text-sm text-blue-100">Students achieve goals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Choose the package that fits your learning goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Single Session */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">Single Session</CardTitle>
                <div className="text-4xl font-bold text-blue-600">
                  $60<span className="text-lg text-slate-600">/hour</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    One-on-one tutoring
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Personalized lesson plan
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Practice materials
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Progress tracking
                  </li>
                </ul>
                <Button className="w-full bg-slate-600 hover:bg-slate-700">
                  Book Session
                </Button>
              </CardContent>
            </Card>

            {/* Package Deal (Most Popular) */}
            <Card className="bg-blue-600 text-white border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-400 text-slate-800">
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">4-Session Package</CardTitle>
                <div className="text-4xl font-bold">
                  $200<span className="text-lg opacity-80"> ($50/hr)</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-400 mr-3" />
                    Four 1-hour sessions
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-400 mr-3" />
                    Save $40 total
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-400 mr-3" />
                    Structured learning path
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-400 mr-3" />
                    Weekly progress reviews
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-400 mr-3" />
                    Priority scheduling
                  </li>
                </ul>
                <Button className="w-full bg-yellow-400 text-slate-800 hover:bg-yellow-300 font-semibold">
                  Start Package
                </Button>
              </CardContent>
            </Card>

            {/* Intensive Program */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">Test Prep Intensive</CardTitle>
                <div className="text-4xl font-bold text-emerald-600">
                  $400<span className="text-lg text-slate-600"> (8 sessions)</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Eight 1-hour sessions
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    SAT/ACT focused
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Practice tests included
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Score improvement guarantee
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    Flexible scheduling
                  </li>
                </ul>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Start Intensive
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 mr-2" />
              100% satisfaction guarantee • First session free if not completely satisfied
            </p>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Free Math Resources</h2>
            <p className="text-xl text-slate-600">Study guides, practice problems, and helpful tips</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${resource.color}`}>
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{resource.title}</h3>
                  <p className="text-slate-600 mb-4">{resource.description}</p>
                  <Button variant="link" className="p-0 h-auto font-semibold text-left">
                    {resource.action} <ArrowRight className="w-4 h-4 ml-2" />
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
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Latest Math Insights</h2>
            <p className="text-xl text-slate-600">Expert tips, study strategies, and math concepts explained simply</p>
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
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
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
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-slate-600">Book your free trial session and see the difference personalized tutoring makes</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-2xl">Book Your Free Trial</CardTitle>
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
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
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
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} value={field.value || ""} />
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
                            <FormLabel>Subject Area *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="algebra">Algebra I & II</SelectItem>
                                <SelectItem value="geometry">Geometry & Trigonometry</SelectItem>
                                <SelectItem value="calculus">Pre-Calculus & Calculus</SelectItem>
                                <SelectItem value="sat-act">SAT/ACT Math Prep</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
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
                          <FormLabel>Tell me about your math goals *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What specific topics do you need help with? What are your goals?"
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
                      {contactMutation.isPending ? "Sending..." : "Book My Free Trial Session"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center mt-4 text-sm text-slate-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  I'll respond within 24 hours to schedule your session
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Let's Connect</h3>
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-slate-600">luka@lukamath.com</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-slate-600">(555) 123-MATH</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">Available Hours</div>
                    <div className="text-slate-600">Mon-Fri: 3pm-9pm<br />Sat-Sun: 10am-6pm</div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-4">Why Choose LukaMath?</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      Personalized learning approach
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      Proven track record of success
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      Flexible scheduling options
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 mr-2 text-yellow-400" />
                      100% satisfaction guarantee
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
                Helping students build confidence and achieve success in mathematics through personalized, one-on-one tutoring.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('services')} className="text-slate-300 hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-slate-300 hover:text-white transition-colors">Reviews</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('resources')} className="text-slate-300 hover:text-white transition-colors">Resources</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-300">
                <li>luka@lukamath.com</li>
                <li>(555) 123-MATH</li>
                <li>Available 7 days a week</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 LukaMath. All rights reserved. | Privacy Policy | Terms of Service</p>
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
              <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</DialogTitle>
              <p className="text-slate-600">
                Thank you for your interest! I'll get back to you within 24 hours to schedule your free trial session.
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
