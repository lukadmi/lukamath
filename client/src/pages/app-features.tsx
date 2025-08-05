import { useState } from "react";
import { Link } from "wouter";
import { Calculator, Users, BookOpen, Target, MessageSquare, TrendingUp, CheckCircle, Award, Clock, Smartphone, ArrowRight, Menu, X, Globe, LogIn, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LanguageContext, type Language, translations } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const appFeatures = [
  {
    icon: BookOpen,
    title: "Homework Management",
    description: "Receive assignments from Luka, track due dates, and submit completed work in one organized dashboard",
    color: "bg-blue-100 text-blue-600",
    benefits: ["Get assignments instantly", "Track completion status", "Submit work easily"]
  },
  {
    icon: MessageSquare,
    title: "Direct Q&A with Luka", 
    description: "Ask Luka questions anytime and get detailed explanations for any math problem",
    color: "bg-emerald-100 text-emerald-600",
    benefits: ["24/7 question submission", "Step-by-step solutions", "Personal responses from Luka"]
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual charts showing your improvement across different math topics and assignments",
    color: "bg-purple-100 text-purple-600", 
    benefits: ["Grade tracking", "Performance analytics", "Improvement insights"]
  },
  {
    icon: Calendar,
    title: "Availability Calendar",
    description: "Check Luka's availability and schedule tutoring sessions at convenient times",
    color: "bg-yellow-100 text-yellow-600",
    benefits: ["Real-time availability", "Easy scheduling", "Session reminders"]
  },
  {
    icon: Award,
    title: "Feedback & Grading",
    description: "Receive detailed feedback on your homework with grades and improvement suggestions",
    color: "bg-red-100 text-red-600",
    benefits: ["Detailed feedback", "Grade tracking", "Improvement tips"]
  },
  {
    icon: Clock,
    title: "Assignment Timeline",
    description: "Clear overview of upcoming deadlines, completed work, and pending assignments",
    color: "bg-green-100 text-green-600",
    benefits: ["Deadline management", "Progress overview", "Priority sorting"]
  }
];

const stats = [
  { number: "1:1", label: "Personal Tutoring", icon: Users },
  { number: "2025", label: "Latest Technology", icon: TrendingUp },
  { number: "100%", label: "Personalized Focus", icon: Award },
  { number: "24/7", label: "Question Support", icon: Clock }
];

function AppFeatures() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hr" : "en");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="min-h-screen bg-gray-50">
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
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/blog" className="text-slate-600 hover:text-blue-600 transition-colors">Blog</Link>
                <Link href="/app-features" className="text-blue-600 font-semibold">App Features</Link>
                
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
                <Link href="/" className="block text-slate-600 hover:text-blue-600">Home</Link>
                <Link href="/blog" className="block text-slate-600 hover:text-blue-600">Blog</Link>
                <Link href="/app-features" className="block text-blue-600 font-semibold">App Features</Link>
                
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

        {/* Hero Section */}
        <section className="gradient-bg text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/5"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
                <Smartphone className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Introducing the LukaMath App</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Personal
                <span className="text-gradient"> Homework Management System</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed max-w-3xl mx-auto">
                Stay organized with your math assignments, track your progress, ask Luka questions anytime, and schedule sessions - all in one dedicated platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link href="/app">
                    <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                      <User className="w-5 h-5 mr-2" />
                      Go to My App
                    </Button>
                  </Link>
                ) : (
                  <a href="/api/login">
                    <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign Up for Free
                    </Button>
                  </a>
                )}
                
                <Link href="/">
                  <Button 
                    variant="outline"
                    className="border-white bg-white text-slate-800 hover:bg-slate-100 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Back to Home
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
              <h2 className="text-4xl font-bold text-slate-800 mb-4">Everything You Need to Stay Organized</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Your personal homework management system designed to keep you on track with assignments, questions, and progress with Luka as your dedicated tutor.
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
              <h2 className="text-4xl font-bold text-slate-800 mb-4">How the LukaMath App Works</h2>
              <p className="text-xl text-slate-600">Simple steps to transform your math learning experience</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 items-center max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Create Your Account</h3>
                <p className="text-slate-600">Sign up for free and get access to your personal homework management dashboard with Luka as your tutor.</p>
              </div>
              
              {/* Arrow between steps 1 and 2 */}
              <div className="hidden md:flex justify-center items-center">
                <div className="relative">
                  <ArrowRight className="w-8 h-8 text-blue-400 animate-bounce transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Receive Assignments</h3>
                <p className="text-slate-600">Get homework assignments from Luka, track deadlines, ask questions, and submit your completed work.</p>
              </div>
              
              {/* Arrow between steps 2 and 3 */}
              <div className="hidden md:flex justify-center items-center">
                <div className="relative">
                  <ArrowRight className="w-8 h-8 text-emerald-400 animate-pulse transform -rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-500 cursor-pointer" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute -top-2 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Schedule and Progress</h3>
                <p className="text-slate-600">Check Luka's availability for sessions, track your grades, and monitor your improvement over time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-bg text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/5"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Organized with Your Math Homework?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join students who are staying on top of their assignments and improving their math skills with Luka's dedicated homework management system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/app">
                  <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                    <User className="w-5 h-5 mr-2" />
                    Access My Dashboard
                  </Button>
                </Link>
              ) : (
                <a href="/api/login">
                  <Button className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign Up for Free
                  </Button>
                </a>
              )}
              
              <Link href="/">
                <Button 
                  variant="outline"
                  className="border-white bg-white text-slate-800 hover:bg-slate-100 hover:scale-105 text-lg px-8 py-4 h-auto shadow-lg font-semibold transition-transform duration-200"
                >
                  Learn More About Tutoring
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Calculator className="w-8 h-8 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold">LukaMath</span>
                </div>
                <p className="text-slate-400">
                  Personalized online math tutoring that builds confidence and achieves results.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Navigation</h3>
                <div className="space-y-2">
                  <Link href="/" className="block text-slate-400 hover:text-white transition-colors">Home</Link>
                  <Link href="/blog" className="block text-slate-400 hover:text-white transition-colors">Blog</Link>
                  <Link href="/app-features" className="block text-slate-400 hover:text-white transition-colors">App Features</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Math Levels</h3>
                <div className="space-y-2">
                  <span className="block text-slate-400">Middle School Math</span>
                  <span className="block text-slate-400">High School Math</span>
                  <span className="block text-slate-400">University Math</span> 
                  <span className="block text-slate-400">SAT/ACT Prep</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Get Started</h3>
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <Link href="/app" className="block text-blue-400 hover:text-blue-300 transition-colors">My Dashboard</Link>
                  ) : (
                    <a href="/api/login" className="block text-blue-400 hover:text-blue-300 transition-colors">Sign Up Free</a>
                  )}
                  <span className="block text-slate-400">Free 15-Min Trial</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 mt-8 pt-8 text-center">
              <p className="text-slate-400">
                © 2024 LukaMath. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}

export default AppFeatures;