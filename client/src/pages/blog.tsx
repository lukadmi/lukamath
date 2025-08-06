import { useState } from "react";
import { Link } from "wouter";
import { Calculator, Calendar, User, ArrowLeft, BookOpen, Target, TrendingUp, Clock, Tag, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Helmet } from 'react-helmet-async';
import { LazyImage } from "@/components/LazyImage";

const blogPosts = [
  {
    id: 1,
    title: "5 Essential SAT Math Strategies That Actually Work",
    excerpt: "Master the most effective test-taking strategies that can boost your SAT math score by 100+ points. Learn time management, elimination techniques, and calculator tips.",
    author: "Luka",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Test Prep",
    featured: true,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["SAT", "Test Strategy", "Math Tips"]
  },
  {
    id: 2,
    title: "How to Stop Making Silly Mistakes in Algebra",
    excerpt: "The most common algebra errors students make and proven techniques to eliminate careless mistakes that cost you points on tests.",
    author: "Luka",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Algebra",
    featured: false,
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["Algebra", "Study Tips", "Error Prevention"]
  },
  {
    id: 3,
    title: "Geometry Proofs Made Simple: A Step-by-Step Guide",
    excerpt: "Break down complex geometry proofs into manageable steps. Learn the logical flow and common proof patterns that work every time.",
    author: "Luka",
    date: "2024-01-05",
    readTime: "10 min read",
    category: "Geometry",
    featured: false,
    image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["Geometry", "Proofs", "Logic"]
  },
  {
    id: 4,
    title: "Calculus Limits: Understanding the Foundation",
    excerpt: "Master the concept of limits with intuitive explanations and visual examples. Essential for succeeding in calculus and beyond.",
    author: "Luka",
    date: "2024-01-01",
    readTime: "12 min read",
    category: "Calculus",
    featured: true,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["Calculus", "Limits", "Concepts"]
  },
  {
    id: 5,
    title: "Building Confidence in Math: Overcoming Math Anxiety",
    excerpt: "Practical strategies to overcome math anxiety and build lasting confidence. Transform your relationship with mathematics.",
    author: "Luka",
    date: "2023-12-28",
    readTime: "7 min read",
    category: "Study Skills",
    featured: false,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["Confidence", "Study Skills", "Mindset"]
  },
  {
    id: 6,
    title: "ACT Math vs SAT Math: Which Test Should You Take?",
    excerpt: "Compare the differences between ACT and SAT math sections. Find out which test format suits your strengths better.",
    author: "Luka",
    date: "2023-12-20",
    readTime: "9 min read",
    category: "Test Prep",
    featured: false,
    image: "https://images.unsplash.com/photo-1606891419711-42f4ad7ad01b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    tags: ["ACT", "SAT", "Test Comparison"]
  }
];

const getCategoryTranslation = (category: string, language: string, t: any) => {
  if (language === 'en') return category;
  
  const translations: { [key: string]: string } = {
    "All": "Sve kategorije",
    "Test Prep": "Priprema za testove", 
    "Algebra": "Algebra",
    "Geometry": "Geometrija",
    "Calculus": "Funkcije",
    "Study Skills": "Vještine učenja"
  };
  
  return translations[category] || category;
};

const categories = ["All", "Test Prep", "Algebra", "Geometry", "Calculus", "Study Skills"];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="font-inter antialiased">
      <Helmet>
        <title>{language === 'en' ? 'LukaMath Blog - Math Study Tips & Strategies' : 'LukaMath Blog - Savjeti za učenje matematike'}</title>
        <meta name="description" content={language === 'en' ? 'Expert math study tips, test strategies, and learning techniques from professional tutor Luka. SAT prep, algebra tips, calculus guides and more.' : 'Stručni savjeti za učenje matematike, strategije za testove i tehnike učenja od profesionalnog instruktora Luke. Priprema za maturu, algebra, analiza i više.'} />
        <meta property="og:title" content={language === 'en' ? 'LukaMath Blog - Math Study Tips' : 'LukaMath Blog - Savjeti za matematiku'} />
        <meta property="og:description" content={language === 'en' ? 'Expert math study tips and strategies from professional tutor Luka.' : 'Stručni savjeti za učenje matematike od profesionalnog instruktora Luke.'} />
        <link rel="canonical" href="https://lukamath.replit.app/blog" />
        <html lang={language} />
      </Helmet>
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="text-2xl font-bold text-blue-600 flex items-center cursor-pointer">
                <Calculator className="w-8 h-8 mr-2" />
                LukaMath
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Back to Home' : 'Povratak na početnu'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hr" : "en")}
                className="flex items-center space-x-1 mr-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "EN" : "HR"}</span>
              </Button>
              <Link href="/#contact">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  {language === 'en' ? 'Book Free Trial' : 'Rezerviraj probni sat'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {language === 'en' ? 'Math Insights & Study Tips' : t('blog.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {language === 'en' ? 
                'Expert advice, study strategies, and math concepts explained simply. Everything you need to excel in mathematics.' :
                t('blog.subtitle')
              }
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={language === 'en' ? 'Search articles...' : 'Pretraži članke...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white text-slate-800 border-0 h-12"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? "bg-yellow-400 text-slate-800 hover:bg-yellow-300" 
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                      }
                    >
                      {getCategoryTranslation(category, language, t)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
              {language === 'en' ? 'Featured Articles' : t('blog.featured_articles')}
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
            {language === 'en' ? 'All Articles' : t('blog.all_articles')}
          </h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No articles found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardHeader>
                    <Badge className="bg-blue-600 text-white w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="text-lg hover:text-blue-600 transition-colors cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4 text-sm">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
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
                {language === 'en' ? 'Navigation' : 'Navigacija'}
              </h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">{language === 'en' ? 'Home' : 'Početna'}</Link></li>
                <li><Link href="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/app-features" className="text-slate-300 hover:text-white transition-colors">{language === 'en' ? 'App Features' : 'Značajke aplikacije'}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Math Levels' : 'Razine matematike'}
              </h4>
              <ul className="space-y-2">
                <li><Link href="/#services" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Middle School Math' : t('level.middle_school')}
                </Link></li>
                <li><Link href="/#services" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'High School Math' : t('level.high_school')}
                </Link></li>
                <li><Link href="/#services" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Statistics' : t('level.statistics')}
                </Link></li>
                <li><Link href="/#services" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Linear Algebra' : t('level.linear_algebra')}
                </Link></li>
                <li><Link href="/#services" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'SAT/ACT Prep' : t('level.sat_act')}
                </Link></li>
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
                <li><Link href="/#contact" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Free 15-Min Trial' : 'Besplatno 15-min probno'}
                </Link></li>
                <li><Link href="/#about" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'About Luka' : t('nav.about')}
                </Link></li>
                <li><Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">
                  {language === 'en' ? 'Pricing' : t('nav.pricing')}
                </Link></li>
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
    </div>
  );
}