// ================================
// COMPLETE LUKAMATH WEBSITE CODE
// ================================
// This file contains all the main components and structure for the LukaMath tutoring website
// You can use this as reference or copy sections as needed

// DEPENDENCIES USED:
// - React, TypeScript
// - Tailwind CSS for styling
// - Lucide React for icons
// - React Hook Form for forms
// - Zod for validation
// - TanStack Query for API calls

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { 
  Calculator, Menu, X, Play, Video, Star, Users, Calendar, TrendingUp, 
  ArrowRight, Clock, Shield, Check, Send, Mail, Phone, Facebook, 
  Twitter, Instagram, Youtube 
} from "lucide-react";

// ================================
// FORM VALIDATION SCHEMA
// ================================
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required")
});

type ContactForm = z.infer<typeof contactSchema>;

// ================================
// NAVIGATION COMPONENT
// ================================
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: "Services", href: "services" },
    { label: "About", href: "about" },
    { label: "Reviews", href: "testimonials" },
    { label: "Pricing", href: "pricing" },
    { label: "Resources", href: "resources" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
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
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => scrollToSection('contact')}
            >
              Book Free Trial
            </button>
            <button
              className="md:hidden ml-4 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ================================
// HERO SECTION COMPONENT
// ================================
function HeroSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 via-blue-600 to-emerald-600/80 text-white py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ace Your Math Tests—
              <span className="text-yellow-400">One Problem at a Time</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Personalized, online one-on-one sessions that turn confusion into confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 text-lg px-8 py-4 rounded-lg shadow-lg font-semibold flex items-center justify-center"
                onClick={scrollToContact}
              >
                <Play className="w-5 h-5 mr-2" />
                Book Your Free 30-Min Trial
              </button>
              <button className="bg-white/20 text-white border border-white/30 hover:bg-white/30 text-lg px-8 py-4 rounded-lg backdrop-blur-sm font-semibold flex items-center justify-center">
                <Video className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-4 text-blue-100">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                <span className="font-semibold">4.9/5</span>
              </div>
              <span>•</span>
              <span>200+ happy students</span>
              <span>•</span>
              <span>Free trial guaranteed</span>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional math tutor with whiteboard" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-800 p-3 rounded-full shadow-lg animate-bounce">
              <Star className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================
// SERVICES SECTION COMPONENT
// ================================
function ServicesSection() {
  const services = [
    {
      title: "Algebra I & II",
      description: "Master equations, functions, and problem-solving strategies",
      price: "$45/hr",
      tagline: "Build your foundation strong!",
      icon: "√",
      textColor: "text-blue-600"
    },
    {
      title: "Geometry & Trigonometry", 
      description: "Visualize concepts and ace those proofs",
      price: "$50/hr",
      tagline: "Get the right angle on math!",
      icon: "△",
      textColor: "text-emerald-600"
    },
    {
      title: "Pre-Calculus & Calculus",
      description: "Tackle limits, derivatives, and integrals with confidence", 
      price: "$55/hr",
      tagline: "Reach your limit... then exceed it!",
      icon: "∞",
      textColor: "text-yellow-600"
    },
    {
      title: "SAT/ACT Math Bootcamp",
      description: "Test strategies and practice for your best score",
      price: "$60/hr", 
      tagline: "Most Popular!",
      icon: "🏆",
      textColor: "text-blue-600",
      isPopular: true
    }
  ];

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Math Made Simple</h2>
          <p className="text-xl text-slate-600">From basic algebra to advanced calculus, I've got you covered!</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${service.isPopular ? 'border-2 border-blue-600' : ''}`}
            >
              <div className={`${service.textColor} mb-4 text-4xl font-bold`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-600 mb-4">{service.description}</p>
              <div className={`text-2xl font-bold ${service.textColor} mb-2`}>
                {service.price}
              </div>
              <p className={`text-sm ${service.isPopular ? 'font-semibold' : 'text-slate-500'}`}>
                {service.tagline}
              </p>
              {service.isPopular && (
                <div className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block">
                  Most Popular!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ================================
// TESTIMONIALS SECTION COMPONENT
// ================================
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Parent, Junior Student",
      text: "After 8 sessions with Luka, my daughter went from a C to an A in Algebra II! His patience and clear explanations made all the difference.",
      avatar: "S",
      bgColor: "bg-blue-600"
    },
    {
      name: "Marcus T.",
      role: "High School Senior", 
      text: "I raised my SAT math score by 120 points in just 2 months! Luka's test strategies and practice problems were exactly what I needed.",
      avatar: "M",
      bgColor: "bg-emerald-600"
    },
    {
      name: "Amy L.",
      role: "Sophomore Student",
      text: "Geometry used to give me nightmares. Now I actually enjoy solving proofs! Luka has a gift for making complex topics simple.",
      avatar: "A", 
      bgColor: "bg-yellow-600"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Success Stories That Add Up</h2>
          <p className="text-xl text-slate-600">Real students, real results, real confidence boost!</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-lg">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Score Improvement Stats */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 p-8 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-6">Average Score Improvements</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">78% → 92%</div>
              <div className="text-slate-300">Class Test Averages</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+120pts</div>
              <div className="text-slate-300">SAT Math Scores</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-slate-300">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================
// PRICING SECTION COMPONENT
// ================================
function PricingSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      name: "Single Session",
      price: "$50",
      period: "per 60-minute session",
      features: [
        "60-minute one-on-one session",
        "Interactive whiteboard access", 
        "Personalized practice problems",
        "Session notes & summary"
      ],
      buttonText: "Book Single Session"
    },
    {
      name: "5-Session Bundle",
      price: "$225", 
      period: "10% off - $45 per session",
      features: [
        "5 × 60-minute sessions",
        "Progress tracking & reports",
        "Email support between sessions", 
        "Flexible rescheduling"
      ],
      buttonText: "Get Started",
      isPopular: true
    },
    {
      name: "Monthly Plan",
      price: "$160",
      period: "4 sessions + priority booking", 
      features: [
        "4 × 60-minute sessions",
        "Priority booking access",
        "Monthly progress review",
        "Free makeup sessions"
      ],
      buttonText: "Choose Monthly"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Simple, Fair Pricing</h2>
          <p className="text-xl text-slate-600">Choose the package that fits your goals and schedule</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white shadow-lg rounded-lg relative ${plan.isPopular ? 'border-2 border-blue-600 shadow-xl' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className={`text-5xl font-bold mb-2 ${plan.isPopular ? 'text-blue-600' : 'text-slate-800'}`}>
                    {plan.price}
                  </div>
                  <div className="text-slate-500">{plan.period}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-emerald-600 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold ${
                    plan.isPopular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                  onClick={scrollToContact}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-600 font-medium flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Money-back guarantee if you're not thrilled after your first session!
          </p>
        </div>
      </div>
    </section>
  );
}

// ================================
// CONTACT FORM COMPONENT
// ================================
function ContactForm() {
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "Free 30-Min Trial Booking",
      message: ""
    }
  });

  // Mock mutation - replace with actual API call
  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      // Replace with actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      alert('Message sent successfully! I\'ll get back to you within 24 hours.');
      form.reset();
    },
    onError: () => {
      alert('Failed to send message. Please try again or call (555) 123-MATH directly.');
    }
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Book Your Free Trial</h2>
          <p className="text-xl text-slate-600">
            Ready to transform your math skills? Let's get started with a free 30-minute session!
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg">
          <div className="p-8">
            <div className="text-2xl font-bold text-center flex items-center justify-center gap-2 mb-8">
              <Calendar className="w-6 h-6 text-blue-600" />
              Schedule Your Free Session
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input 
                    {...form.register('name')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Your name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                  <input 
                    {...form.register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="your@email.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input 
                    {...form.register('phone')}
                    type="tel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                  <input 
                    {...form.register('subject')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="What can I help you with?"
                  />
                  {form.formState.errors.subject && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tell me about your math goals *</label>
                <textarea 
                  {...form.register('message')}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="What math topics are you struggling with? What are your goals? Any specific tests coming up?"
                />
                {form.formState.errors.message && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.message.message}</p>
                )}
              </div>

              <div className="text-center">
                <button 
                  type="submit" 
                  disabled={contactMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center mx-auto disabled:opacity-50"
                >
                  {contactMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Book My Free Trial
                    </>
                  )}
                </button>
                <p className="text-sm text-slate-500 mt-4">
                  I'll respond within 24 hours to schedule your session
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================
// FOOTER COMPONENT
// ================================
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4 flex items-center">
              <Calculator className="w-8 h-8 mr-2" />
              LukaMath
            </div>
            <p className="text-slate-300 mb-4">
              Making math simple, one student at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Algebra Tutoring</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Geometry Help</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Calculus Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SAT/ACT Prep</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Free Practice Tests</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Study Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Math Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Video Tutorials</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                hello@lukamath.com
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                (555) 123-MATH
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Mon-Sun: 9AM-9PM PST
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-300">
          <p>&copy; {currentYear} LukaMath. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}

// ================================
// MAIN WEBSITE COMPONENT
// ================================
export default function LukaMathWebsite() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <HeroSection />
      
      {/* Why LukaMath Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why LukaMath?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Stop letting math stress you out! With expert guidance, flexible scheduling, and proven methods, 
              we make complex concepts crystal clear.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Expert High-School Tutor", desc: "5+ years teaching experience with proven track record", color: "bg-blue-600" },
              { icon: Calendar, title: "Flexible Scheduling", desc: "Book sessions that fit your busy life, 7 days a week", color: "bg-emerald-600" },
              { icon: Calculator, title: "Interactive Whiteboard", desc: "Real-time collaboration with digital tools and visual aids", color: "bg-yellow-600" },
              { icon: TrendingUp, title: "Proven Score Gains", desc: "Average 15% improvement in test scores within 8 sessions", color: "bg-emerald-500" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-slate-50 hover:shadow-lg transition-shadow rounded-lg">
                <div className={`${feature.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Getting started is as easy as 1-2-3!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: 1, title: "Pick a Package & Schedule", desc: "Choose your subject and book a time that works for you", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", color: "bg-blue-600" },
              { step: 2, title: "Join Zoom + Shared Whiteboard", desc: "Connect online with interactive tools for real-time collaboration", img: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", color: "bg-emerald-600" },
              { step: 3, title: "Master Concepts & Track Progress", desc: "Build understanding step-by-step with personalized feedback", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", color: "bg-yellow-600" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`${step.color} text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-600 mb-4">{step.desc}</p>
                <img 
                  src={step.img}
                  alt={step.title}
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-slate-600 font-medium">No more guessing—get real-time feedback!</p>
          </div>
        </div>
      </section>

      {/* About Luka Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
                alt="Luka - Professional Math Tutor" 
                className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Meet Luka</h2>
              <div className="text-lg text-slate-600 space-y-4 mb-8">
                <p>
                  <strong>M.S. in Mathematics Education, Stanford University</strong> | 5+ years of tutoring experience
                </p>
                <p>
                  I believe every student can excel in math with the right approach and encouragement. 
                  My goal is to make complex concepts feel simple and help you build genuine confidence.
                </p>
                <p>
                  When I'm not solving equations, you'll find me rock climbing or perfecting my chess game. 
                  <em>Fun fact: I have over 100 math puns in my arsenal—but don't worry, I use them sparingly!</em>
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700">
                  <Users className="w-4 h-4 inline text-blue-600 mr-2" />
                  Stanford Graduate
                </div>
                <div className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700">
                  <Users className="w-4 h-4 inline text-emerald-600 mr-2" />
                  200+ Students Helped
                </div>
                <div className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700">
                  <Star className="w-4 h-4 inline text-yellow-600 mr-2" />
                  4.9/5 Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <PricingSection />

      {/* Free Resources Section */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Free Math Resources</h2>
            <p className="text-xl text-slate-600">Boost your skills with these helpful guides and tips</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: "5 Fast Tricks for Quadratic Equations", desc: "Master the quadratic formula and factoring techniques that save time on tests.", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", color: "text-blue-600" },
              { title: "Geometry Hacks That Save You Time on Tests", desc: "Learn the shortcuts and memory tricks that make geometry problems click.", img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", color: "text-emerald-600" },
              { title: "Top 10 SAT Math Pitfalls and How to Avoid Them", desc: "Common mistakes that trip up test-takers and strategies to avoid them.", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250", color: "text-yellow-600" }
            ].map((resource, index) => (
              <div key={index} className="bg-slate-50 hover:shadow-lg transition-shadow rounded-lg p-8">
                <img 
                  src={resource.img}
                  alt={resource.title}
                  className="rounded-lg mb-6 w-full"
                />
                <h3 className="text-xl font-bold mb-3">{resource.title}</h3>
                <p className="text-slate-600 mb-4">{resource.desc}</p>
                <button className={`${resource.color} font-semibold flex items-center hover:underline`}>
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="text-blue-600 font-semibold text-lg hover:underline flex items-center mx-auto">
              See all resources <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Crush Your Next Math Test?</h2>
          <p className="text-xl mb-8 text-slate-300">
            Don't let math anxiety hold you back. Start your journey to mathematical confidence today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-yellow-400 text-slate-800 hover:bg-yellow-300 text-lg px-8 py-4 rounded-lg font-semibold flex items-center justify-center"
              onClick={() => scrollToSection('contact')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Free 30-Min Trial
            </button>
            <button className="bg-white/20 text-white border border-white/30 hover:bg-white/30 text-lg px-8 py-4 rounded-lg backdrop-blur-sm font-semibold flex items-center justify-center">
              <Clock className="w-5 h-5 mr-2" />
              Call (555) 123-MATH
            </button>
          </div>
          <p className="mt-6 text-slate-300 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Free trial • No credit card required • 100% satisfaction guaranteed
          </p>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </div>
  );
}

// ================================
// CSS STYLES (Add to your CSS file)
// ================================
/*
Add these Tailwind CSS custom colors to your tailwind.config.js or CSS file:

:root {
  --primary: #2563eb; // blue-600
  --secondary: #059669; // emerald-600  
  --accent: #fbbf24; // yellow-400
}

.text-primary { color: var(--primary); }
.bg-primary { background-color: var(--primary); }
.text-secondary { color: var(--secondary); }
.bg-secondary { background-color: var(--secondary); }
.text-accent { color: var(--accent); }
.bg-accent { background-color: var(--accent); }
*/

// ================================
// BACKEND API ENDPOINT (server/routes.ts)
// ================================
/*
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    // Save to database (implement your storage logic here)
    const contact = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      subject,
      message,
      createdAt: new Date()
    };

    // TODO: Save contact to your database
    console.log('New contact submission:', contact);

    res.json({ 
      success: true, 
      message: "Contact form submitted successfully!" 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit contact form" 
    });
  }
});
*/