# LukaMath - Online Math Tutoring Platform

## Overview

LukaMath is a modern web application designed as a marketing and booking platform for online math tutoring services. The application serves as a professional landing page that showcases tutoring services across various math subjects including Algebra, Geometry, Calculus, and SAT/ACT test preparation. The platform features a contact form system for potential students to inquire about tutoring services and includes comprehensive information about pricing, testimonials, and frequently asked questions.

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