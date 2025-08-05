import { createContext, useContext } from "react";

export type Language = "en" | "hr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Translation dictionaries
export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.testimonials": "Reviews",
    "nav.pricing": "Pricing",
    "nav.resources": "Resources",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.app": "Student App",
    
    // Hero Section
    "hero.title": "Master Math with Confidence",
    "hero.subtitle": "Personalized Online Tutoring",
    "hero.description": "From algebra to calculus, I help students build strong foundations and achieve their academic goals through one-on-one tutoring sessions.",
    "hero.cta.primary": "Book Free 15-Min Trial",
    "hero.cta.secondary": "View Success Stories",
    "hero.stats.students": "Students Helped",
    "hero.stats.satisfaction": "Satisfaction Rate",
    "hero.stats.improvement": "Average Grade Improvement",
    
    // Services
    "services.title": "Comprehensive Math Tutoring",
    "services.subtitle": "Expert guidance across all levels of mathematics",
    "services.algebra.title": "Algebra I & II",
    "services.algebra.description": "Master equations, inequalities, and functions with clear explanations",
    "services.geometry.title": "Geometry & Trigonometry", 
    "services.geometry.description": "Visualize shapes, proofs, and spatial relationships",
    "services.calculus.title": "Pre-Calculus & Calculus",
    "services.calculus.description": "Limits, derivatives, and integrals made accessible",
    "services.testprep.title": "SAT/ACT Math Prep",
    "services.testprep.description": "Strategic test-taking skills and score improvement",
    
    // About Section
    "about.title": "Meet Your Math Mentor",
    "about.description": "With years of experience helping students overcome math anxiety and achieve their goals, I provide personalized instruction that adapts to each student's learning style.",
    
    // Certificates
    "certificates.title": "Credentials & Certifications",
    "certificates.subtitle": "Continuous learning to provide the best math education",
    
    // Testimonials
    "testimonials.title": "Success Stories That Add Up",
    "testimonials.subtitle": "Real students, real results, real confidence boost!",
    
    // Pricing
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle": "Choose the package that fits your learning goals",
    "pricing.session.title": "Single Session",
    "pricing.package.title": "4-Session Package",
    "pricing.intensive.title": "Test Prep Intensive",
    "pricing.popular": "Most Popular",
    
    // Contact
    "contact.title": "Ready to Start Learning?",
    "contact.subtitle": "Book your free trial session and see the difference personalized tutoring makes",
    "contact.form.title": "Book Your Free Trial",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email Address",
    "contact.form.phone": "Phone Number",
    "contact.form.subject": "Subject Area",
    "contact.form.message": "Tell me about your math goals",
    "contact.form.submit": "Book My Free Trial Session",
    
    // Footer
    "footer.description": "Helping students build confidence and achieve success in mathematics through personalized, one-on-one tutoring.",
    "footer.quicklinks": "Quick Links",
    "footer.contact": "Contact",
    "footer.copyright": "All rights reserved.",
  },
  hr: {
    // Navigation
    "nav.home": "Početna",
    "nav.services": "Usluge",
    "nav.about": "O meni",
    "nav.testimonials": "Recenzije",
    "nav.pricing": "Cjenik",
    "nav.resources": "Resursi",
    "nav.blog": "Blog",
    "nav.contact": "Kontakt",
    "nav.login": "Prijava",
    "nav.app": "Aplikacija",
    
    // Hero Section
    "hero.title": "Savladaj matematiku s povjerenjem",
    "hero.subtitle": "Personalizirano online podučavanje",
    "hero.description": "Od algebre do kalkulusa, pomažem učenicima izgraditi čvrste temelje i postići akademske ciljeve kroz individualne sesije podučavanja.",
    "hero.cta.primary": "Rezerviraj besplatni 15-min pokušaj",
    "hero.cta.secondary": "Pogledaj priče o uspjehu",
    "hero.stats.students": "Učenika pomognuto",
    "hero.stats.satisfaction": "Stopa zadovoljstva",
    "hero.stats.improvement": "Prosječno poboljšanje ocjene",
    
    // Services
    "services.title": "Sveobuhvatno podučavanje matematike",
    "services.subtitle": "Stručno vodstvo kroz sve razine matematike",
    "services.algebra.title": "Algebra I i II",
    "services.algebra.description": "Savladaj jednadžbe, nejednadžbe i funkcije s jasnim objašnjenjima",
    "services.geometry.title": "Geometrija i trigonometrija",
    "services.geometry.description": "Vizualiziraj oblike, dokaze i prostorne odnose",
    "services.calculus.title": "Predkalkulus i kalkulus",
    "services.calculus.description": "Granice, derivacije i integrali učinjeni pristupačnima",
    "services.testprep.title": "SAT/ACT matematika priprema",
    "services.testprep.description": "Strateške vještine rješavanja testova i poboljšanje rezultata",
    
    // About Section
    "about.title": "Upoznaj svog mentora za matematiku",
    "about.description": "S godinama iskustva u pomaganju učenicima da prevladaju anksioznost zbog matematike i postignu svoje ciljove, pružam personalizirane instrukcije koje se prilagođavaju stilu učenja svakog učenika.",
    
    // Certificates
    "certificates.title": "Vjerodajnice i certifikati",
    "certificates.subtitle": "Kontinuirano učenje za pružanje najbolje matematičke edukacije",
    
    // Testimonials
    "testimonials.title": "Priče o uspjehu koje se zbrajaju",
    "testimonials.subtitle": "Pravi učenici, pravi rezultati, pravi porast povjerenja!",
    
    // Pricing
    "pricing.title": "Jednostavan, transparentan cjenik",
    "pricing.subtitle": "Odaberi paket koji odgovara tvojim ciljevima učenja",
    "pricing.session.title": "Jedna sesija",
    "pricing.package.title": "Paket od 4 sesije",
    "pricing.intensive.title": "Intenzivna priprema za test",
    "pricing.popular": "Najpopularniji",
    
    // Contact
    "contact.title": "Spreman za početak učenja?",
    "contact.subtitle": "Rezerviraj svoju besplatnu probnu sesiju i vidi razliku koju čini personalizirano podučavanje",
    "contact.form.title": "Rezerviraj svoj besplatni pokušaj",
    "contact.form.name": "Ime i prezime",
    "contact.form.email": "Email adresa",
    "contact.form.phone": "Broj telefona",
    "contact.form.subject": "Područje predmeta",
    "contact.form.message": "Reci mi o svojim matematičkim ciljevima",
    "contact.form.submit": "Rezerviraj moju besplatnu probnu sesiju",
    
    // Footer
    "footer.description": "Pomaganje učenicima da izgrade povjerenje i postignu uspjeh u matematici kroz personalizirano, individualno podučavanje.",
    "footer.quicklinks": "Brze veze",
    "footer.contact": "Kontakt",
    "footer.copyright": "Sva prava zadržana.",
  }
};