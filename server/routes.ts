import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  insertContactSchema, 
  insertHomeworkSchema, 
  updateHomeworkSchema,
  insertQuestionSchema 
} from "@shared/schema";
import { z } from "zod";
import { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  uploadLimiter,
  sanitizeInput, 
  setSecurityHeaders, 
  validateFileUpload,
  securityLogger 
} from "./middleware/security";

// Utility function to convert data to CSV format
function convertToCSV(data: any): string {
  if (!Array.isArray(data)) {
    // If it's an object with multiple arrays (full backup), convert each section
    if (typeof data === 'object' && data !== null) {
      let csvContent = '';
      Object.keys(data).forEach(key => {
        csvContent += `\n--- ${key.toUpperCase()} ---\n`;
        if (Array.isArray(data[key]) && data[key].length > 0) {
          csvContent += convertArrayToCSV(data[key]);
        }
        csvContent += '\n';
      });
      return csvContent;
    }
    return '';
  }
  
  return convertArrayToCSV(data);
}

function convertArrayToCSV(array: any[]): string {
  if (array.length === 0) return '';
  
  const headers = Object.keys(array[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = array.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔧 Starting route registration...");

  // Handle CORS preflight requests for Builder.io
  app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.sendStatus(200);
  });

  // Security middleware (skip for development assets)
  app.use((req, res, next) => {
    // Skip security middleware for Vite dev assets
    if (req.url.includes('/@fs/') || 
        req.url.includes('/@vite/') || 
        req.url.includes('/src/') ||
        req.url.includes('/node_modules/') ||
        req.url.startsWith('/attached_assets/')) {
      return next();
    }
    setSecurityHeaders(req, res, next);
  });
  
  console.log("🔒 Setting up security middleware...");
  app.use(securityLogger);
  app.use(generalLimiter);
  app.use(sanitizeInput);
  console.log("✅ Security middleware setup complete");

  // Auth middleware and routes setup
  console.log("🔐 Setting up authentication system...");

  // Setup basic passport middleware (without OIDC which might hang)
  const passport = await import('passport');
  const session = await import('express-session');

  app.set("trust proxy", 1);

  // Basic session setup for development
  app.use(session.default({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  }));

  app.use(passport.default.initialize());
  app.use(passport.default.session());

  // Basic passport serialization
  passport.default.serializeUser((user: any, cb) => cb(null, user));
  passport.default.deserializeUser((user: any, cb) => cb(null, user));

  // Import auth routes from auth-routes.ts
  const authRoutes = await import('./auth-routes');
  app.use('/api/auth', authRoutes.default);

  console.log("✅ Authentication routes setup complete");

  // Object storage service
  const objectStorageService = new ObjectStorageService();

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'LukaMath API is working',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });

  // Legacy logout route for compatibility - redirect to home after client-side token cleanup
  app.get('/api/logout', (req, res) => {
    // For JWT-based auth, we just redirect to home and let client handle token removal
    res.redirect('/');
  });

  // Contact routes
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        contact: { id: contact.id }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Contact creation error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Student registration endpoint (public)
  const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    language: z.enum(['en', 'hr']),
    mathLevel: z.enum(['middle-school', 'high-school', 'statistics', 'linear-algebra', 'sat-act']),
    parentEmail: z.string().email().optional().or(z.literal('')),
    goals: z.string().min(10),
  });

  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "An account with this email already exists. Please sign in instead." 
        });
      }

      // Create new student user
      const newUser = await storage.upsertUser({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'student',
        language: validatedData.language,
      });

      // Create a contact record with registration details
      await storage.createContact({
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.parentEmail || '',
        subject: validatedData.mathLevel,
        message: `New student registration - Math Level: ${validatedData.mathLevel}\n\nGoals: ${validatedData.goals}${validatedData.parentEmail ? `\n\nParent/Guardian Email: ${validatedData.parentEmail}` : ''}`,
      });

      res.status(201).json({ 
        message: "Registration successful! Welcome to LukaMath.",
        userId: newUser.id
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Admin routes
  app.get('/api/admin/students', isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/admin/contacts', isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  console.log("🌐 Creating HTTP server...");
  const httpServer = createServer(app);
  console.log("✅ Route registration completed successfully");
  return httpServer;
}
