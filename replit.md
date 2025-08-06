# LukaMath - Online Math Tutoring Platform

## Overview

LukaMath is a modern web application designed as a marketing and booking platform for online math tutoring services. The application serves as a professional landing page that showcases tutoring services across various math subjects including Algebra, Geometry, Calculus, and SAT/ACT test preparation. The platform features a contact form system for potential students to inquire about tutoring services, includes comprehensive information about pricing and testimonials, and now includes a full blog section with math insights and study tips.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library providing a comprehensive set of accessible, customizable components
- **Routing**: Wouter for lightweight client-side routing with support for single-page application navigation
- **State Management**: TanStack Query (React Query) for server state management, caching, and API request handling
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing and runtime validation
- **Design System**: Custom CSS variables supporting light/dark theme modes with consistent color tokens and spacing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework providing RESTful API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful endpoints for contact form submission (`POST /api/contacts`) and data retrieval (`GET /api/contacts`)
- **Middleware**: Custom logging middleware for API request tracking and error handling
- **Development Tools**: Custom Vite integration for hot module replacement and development server proxy

### Data Storage Solutions
- **Development**: In-memory storage using JavaScript Map data structures for rapid prototyping
- **Production Configuration**: Drizzle ORM configured for PostgreSQL with Neon Database integration
- **Schema Management**: Centralized database schema definitions in shared directory with automatic TypeScript type generation
- **Validation**: Zod schemas providing runtime validation and TypeScript type inference for data consistency

### Authentication and Authorization
- **Session Infrastructure**: Built-in session handling using connect-pg-simple for PostgreSQL session storage
- **Current Implementation**: Public contact form endpoints with no authentication required
- **Admin Endpoints**: Basic admin endpoints exist for viewing submitted contacts (suitable for development/demo environments)

### External Dependencies
- **Database**: Neon Database (serverless PostgreSQL) configured via DATABASE_URL environment variable
- **UI Components**: Radix UI primitives for accessible component foundations
- **Icons**: Lucide React for consistent icon library
- **Development**: Replit-specific plugins for development environment integration
- **Build Tools**: esbuild for server-side compilation and Vite for frontend bundling
- **Fonts**: Google Fonts (Inter) loaded for professional typography

## Recent Changes (January 2025)
- **Color Scheme Update**: Changed gradient colors from blue-green to dark blue - blue theme
- **Free Trial Duration**: Updated from 30 minutes to 15 minutes across all messaging
- **Blog Implementation**: Added complete blog section with separate page (/blog route)
- **Navigation Enhancement**: Added blog link to main navigation (desktop and mobile)
- **Content Preview**: Added blog preview section on home page with latest articles
- **CSS Fixes**: Resolved import order issue in index.css for proper Tailwind compilation
- **Progress Tracking Graph**: Added interactive line chart showing student grade trends over time in Progress tab
- **Calendar Availability**: Implemented tutor availability calendar showing Luka's available time slots with booking options
- **Enhanced Student Portal**: Progress tab now combines homework statistics, grade tracking graph, and availability calendar
- **Database Schema Expansion**: Added tutorAvailability table and progress tracking endpoints for comprehensive student dashboard
- **Full SQL Database Integration**: Transitioned entire system from in-memory storage to PostgreSQL with role-based user permissions
- **File Attachment System**: Implemented homework file uploads with database metadata storage
- **Clean Database State**: Removed all sample/mock data per user preference - system now ready for real data entry
- **Object Storage Integration**: Real cloud file uploads configured for homework attachments
- **Role-Based Access Control**: Admin/tutor/student permissions enforced with requireRole middleware
- **User Registration Flow**: Student registration page with math level selection and form validation
- **Math Level Standardization**: Updated to use only 4 levels: Middle School, High School, University, SAT/ACT Prep
- **Error Handling & Validation**: Comprehensive form validation and user-friendly error messages throughout system
- **Mobile Responsive Design**: All dashboard components optimized for phones/tablets with responsive CSS utilities
- **Data Export/Backup**: Admin tools to export student progress, homework history, contact data as CSV files
- **Security Hardening**: Input sanitization, rate limiting, CSRF protection, and security headers for production deployment
- **Complete Bilingual Implementation**: Full Croatian translations across entire platform including blog and student app sections
- **Language-Specific Terminology**: Croatian education system terms ("Državna matura", grade levels 5.-8. razred/1.-4. razred)
- **Croatian Terminology Corrections**: All Croatian translations finalized with proper terminology - "aplikacija" (not "ploča") for dashboard, "funkcije" (not "kalkulus"), "termini" (not "sesije"), "pomažem" (not "pomagam"), "matematički zadatak" (not "problem"), "Lukinu" (not "Lukovu"), "domaća zadaća" for homework
- **Seamless Language Switching**: Language toggle buttons in all pages with persistent language preference
- **Croatian Market Ready**: Accurate Croatian translations (not Serbian/Bosnian) for targeting Croatian students
- **Google Analytics Integration**: Comprehensive tracking system implemented across all pages and interactions
- **Event Tracking**: Contact form submissions, registration attempts, navigation clicks, and CTA button interactions
- **Analytics Infrastructure**: Proper initialization, page view tracking, and custom event tracking with detailed categorization
- **SEO & Performance Optimization**: Complete technical optimization package implemented including robots.txt, sitemap.xml, dynamic meta tags with React Helmet Async, lazy loading with React.lazy() code splitting, performance-optimized CSS with critical rendering path optimization, service worker caching, and comprehensive accessibility improvements
- **Meta Tags & Open Graph**: Bilingual dynamic meta tags across all pages with proper Open Graph implementation for social media sharing
- **Performance Infrastructure**: Resource preloading, critical CSS optimization, lazy image loading, and service worker implementation for caching static assets
- **Progressive Web App (PWA)**: Standalone student app developed with mandatory language selection, complete authentication flow, homework management, progress tracking, and offline capabilities via service worker
- **PWA Features**: Mobile-optimized interface, bottom navigation, bilingual support, background sync for homework submissions, installable app experience with manifest.json
- **PWA Architecture**: Dedicated /pwa routes for entry point, authentication, dashboard, homework management, and progress tracking with proper mobile responsive design
- **PWA Integration**: PWA linked from main /app page with prominent mobile app promotion section and header navigation button
- **Download button implemented on /pwa page for app installation on mobile devices with iOS-specific instructions for Safari users