import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { authenticateToken } from "./auth-middleware";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { EmailNotificationService } from "./email-service.js";
import {
  insertContactSchema,
  insertHomeworkSchema,
  updateHomeworkSchema,
  insertQuestionSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
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

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// JWT-based role checking middleware
function requireJWTRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

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

  // Import admin routes from admin-routes.ts
  const adminRoutes = await import('./admin-routes');
  app.use('/api/admin', adminRoutes.default);

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

  // Questions endpoint - students can submit questions
  app.post("/api/questions", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);

      // Ensure the student is submitting for themselves
      const studentId = (req as any).user?.userId;
      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const question = await storage.createQuestion({
        ...validatedData,
        studentId: studentId
      });

      // Send email notification
      try {
        const user = await storage.getUserById(studentId);
        if (user) {
          await EmailNotificationService.notifyNewQuestion({
            studentEmail: user.email,
            subject: validatedData.subject,
            title: validatedData.title,
            content: validatedData.content,
          });
        }
      } catch (emailError) {
        console.error("Failed to send question notification:", emailError);
        // Don't fail the request if email notification fails
      }

      res.status(201).json({
        success: true,
        message: "Question submitted successfully",
        question: { id: question.id }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      } else {
        console.error("Question creation error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // Get questions for a student
  app.get("/api/questions/student/:id", authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const requestingUserId = (req as any).user?.userId;

      // Students can only see their own questions, admins can see any
      if (requestingUserId !== studentId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const questions = await storage.getQuestionsForStudent(studentId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching student questions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Get homework for a student
  app.get("/api/homework/student/:id", authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const requestingUserId = (req as any).user?.userId;

      // Students can only see their own homework, admins can see any
      if (requestingUserId !== studentId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const homework = await storage.getHomeworkForStudent(studentId);
      res.json(homework);
    } catch (error) {
      console.error("Error fetching student homework:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Get progress for a student
  app.get("/api/progress/student/:id", authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const requestingUserId = (req as any).user?.userId;

      // Students can only see their own progress, admins can see any
      if (requestingUserId !== studentId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      // Get homework for progress calculation
      const homework = await storage.getHomeworkForStudent(studentId);
      const totalHomework = homework.length;
      const completedHomework = homework.filter(hw => hw.isCompleted).length;
      const pendingHomework = homework.filter(hw => hw.status === 'pending').length;
      const inProgressHomework = homework.filter(hw => hw.status === 'in_progress').length;

      // Calculate average grade from completed homework
      const gradedHomework = homework.filter(hw => hw.grade !== null);
      const averageGrade = gradedHomework.length > 0
        ? gradedHomework.reduce((sum, hw) => sum + (hw.grade || 0), 0) / gradedHomework.length
        : null;

      const progress = {
        totalHomework,
        completedHomework,
        pendingHomework,
        inProgressHomework,
        averageGrade: averageGrade ? Math.round(averageGrade) : null,
        recentHomework: homework.slice(0, 5), // Latest 5 assignments
      };

      res.json(progress);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Availability endpoint - public access for students to see tutor availability
  app.get("/api/availability", async (req, res) => {
    try {
      const date = req.query.date as string;
      const availability = await storage.getTutorAvailability(date);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Book availability slot endpoint
  app.post("/api/availability/book", authenticateToken, async (req, res) => {
    try {
      const { slotId, notes } = req.body;
      const studentId = (req as any).user?.userId;
      const studentEmail = (req as any).user?.email;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      if (!slotId) {
        return res.status(400).json({
          success: false,
          message: "Slot ID is required"
        });
      }

      // Get the availability slot details first
      const slot = await storage.getAvailabilitySlot(slotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Availability slot not found"
        });
      }

      if (!slot.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "This slot is no longer available"
        });
      }

      // Book the slot (mark as unavailable and add booking info)
      const booking = await storage.bookAvailabilitySlot(slotId, studentId, notes);

      // Send email notification to admin
      try {
        await EmailNotificationService.notifySlotBooked({
          studentEmail: studentEmail,
          slotDate: new Date(slot.date).toLocaleDateString(),
          slotTime: `${slot.startTime} - ${slot.endTime}`,
          notes: notes
        });
      } catch (emailError) {
        console.error("Failed to send booking notification:", emailError);
        // Don't fail the booking if email fails
      }

      res.status(201).json({
        success: true,
        message: "Session booked successfully! You will receive a confirmation email shortly.",
        booking: { id: booking.id }
      });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to book session. Please try again."
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

      // Send email notification about new registration
      try {
        await EmailNotificationService.notifyNewRegistration({
          studentEmail: validatedData.email,
          studentName: `${validatedData.firstName} ${validatedData.lastName}`,
          mathLevel: validatedData.mathLevel,
          goals: validatedData.goals,
        });
      } catch (emailError) {
        console.error("Failed to send registration notification:", emailError);
      }

      res.status(201).json({
        message: "Registration successful! Welcome to LukaMath.",
        userId: newUser.id
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Student homework file upload endpoint
  app.post("/api/homework/:homeworkId/student-upload", authenticateToken, uploadLimiter, upload.single('file'), async (req, res) => {
    try {
      const homeworkId = req.params.homeworkId;
      const studentId = (req as any).user?.userId;
      const notes = req.body.notes || '';

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Verify the homework exists and the student is authorized
      const homework = await storage.getHomeworkById(homeworkId);
      if (!homework) {
        return res.status(404).json({
          success: false,
          message: "Homework not found"
        });
      }

      // Check if this homework is assigned to the student
      const studentHomework = await storage.getHomeworkForStudent(studentId);
      const isAssigned = studentHomework.some(hw => hw.id === homeworkId);

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to submit for this homework"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // Upload file to object storage
      const objectStorage = new ObjectStorageService();
      const fileName = `homework-submissions/${homeworkId}/${studentId}/${Date.now()}-${req.file.originalname}`;
      const fileUrl = await objectStorage.uploadFile(fileName, req.file.buffer, req.file.mimetype);

      // Save submission record to database
      const submission = await storage.createStudentSubmission({
        homeworkId,
        studentId,
        fileName,
        originalName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        notes: notes || null
      });

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        submission: {
          id: submission.id,
          originalName: req.file.originalname,
          fileUrl,
          notes
        }
      });
    } catch (error) {
      console.error("Student file upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload file"
      });
    }
  });

  // Serve uploaded files from local storage
  app.get("/api/files/*", authenticateToken, async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const filePath = req.params[0]; // Everything after /api/files/
      const fullPath = path.join(process.cwd(), 'uploads', filePath);

      // Security check - ensure the file is within uploads directory
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      const resolvedPath = path.resolve(fullPath);

      if (!resolvedPath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Get file stats for content type and size
      const stats = fs.statSync(resolvedPath);
      const ext = path.extname(resolvedPath).toLowerCase();

      // Set content type based on extension
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.txt') contentType = 'text/plain';
      else if (ext === '.doc') contentType = 'application/msword';
      else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'private, max-age=3600'
      });

      // Stream the file
      const stream = fs.createReadStream(resolvedPath);
      stream.pipe(res);

    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Error serving file" });
    }
  });

  // Get student submissions for a homework assignment
  app.get("/api/homework/:homeworkId/student-submissions/:studentId", authenticateToken, async (req, res) => {
    try {
      const { homeworkId, studentId } = req.params;
      const requestingUserId = (req as any).user?.userId;

      // Students can only see their own submissions, admins can see any
      if (requestingUserId !== studentId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const submissions = await storage.getStudentSubmissions(homeworkId, studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Delete student submission
  app.delete("/api/homework/student-submission/:submissionId", authenticateToken, async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const studentId = (req as any).user?.userId;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Get submission to verify ownership
      const submission = await storage.getStudentSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found"
        });
      }

      // Verify the student owns this submission
      if (submission.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own submissions"
        });
      }

      // Delete file from object storage
      try {
        const objectStorage = new ObjectStorageService();
        await objectStorage.deleteFile(submission.fileName);
      } catch (error) {
        console.warn("Failed to delete file from object storage:", error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete submission record from database
      await storage.deleteStudentSubmission(submissionId);

      res.json({
        success: true,
        message: "Submission deleted successfully"
      });
    } catch (error) {
      console.error("Delete submission error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete submission"
      });
    }
  });

  // Get homework files for students
  app.get("/api/homework/:homeworkId/files", authenticateToken, async (req, res) => {
    try {
      const homeworkId = req.params.homeworkId;
      const studentId = (req as any).user?.userId;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Verify the homework belongs to this student
      const homework = await storage.getHomeworkById(homeworkId);
      if (!homework) {
        return res.status(404).json({
          success: false,
          message: "Homework not found"
        });
      }

      // Check if this homework is assigned to the student
      const studentHomework = await storage.getHomeworkForStudent(studentId);
      const isAssigned = studentHomework.some(hw => hw.id === homeworkId);

      if (!isAssigned && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const files = await storage.getHomeworkFiles(homeworkId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching homework files:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Homework text submission endpoint (for text answers, not file uploads)
  app.post("/api/homework/submit", authenticateToken, apiLimiter, async (req, res) => {
    try {
      const { homeworkId, submission } = req.body;
      const studentId = (req as any).user?.userId;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      if (!homeworkId || !submission) {
        return res.status(400).json({
          success: false,
          message: "Homework ID and submission text are required"
        });
      }

      // Verify the homework exists and the student is authorized
      const homework = await storage.getHomeworkById(homeworkId);
      if (!homework) {
        return res.status(404).json({
          success: false,
          message: "Homework not found"
        });
      }

      // Check if this homework is assigned to the student
      const studentHomework = await storage.getHomeworkForStudent(studentId);
      const isAssigned = studentHomework.some(hw => hw.id === homeworkId);

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to submit for this homework"
        });
      }

      // Save submission as text-based submission
      const textSubmission = await storage.createStudentSubmission({
        homeworkId,
        studentId,
        fileName: `text-submission-${Date.now()}.txt`,
        originalName: 'Text Submission',
        fileUrl: '', // No file URL for text submissions
        fileSize: Buffer.byteLength(submission, 'utf8'),
        mimeType: 'text/plain',
        notes: submission // Store the text content in notes field
      });

      // Send email notification to admin
      try {
        const student = await storage.getUserById(studentId);
        if (student) {
          await EmailNotificationService.notifyHomeworkSubmitted({
            studentEmail: student.email,
            homeworkTitle: homework.title,
            subject: homework.subject,
            submissionType: 'text',
            submissionContent: submission
          });
        }
      } catch (emailError) {
        console.error("Failed to send submission notification:", emailError);
      }

      res.status(201).json({
        success: true,
        message: "Homework submitted successfully",
        submission: {
          id: textSubmission.id,
          type: 'text',
          content: submission,
          submittedAt: textSubmission.createdAt
        }
      });
    } catch (error) {
      console.error("Homework text submission error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit homework"
      });
    }
  });

  // Admin routes are now handled by admin-routes.ts

  console.log("🌐 Creating HTTP server...");
  const httpServer = createServer(app);
  console.log("✅ Route registration completed successfully");
  return httpServer;
}
