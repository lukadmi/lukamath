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
  
  app.use(securityLogger);
  app.use(generalLimiter);
  app.use(sanitizeInput);

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage service
  const objectStorageService = new ObjectStorageService();

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

  app.get('/api/admin/homework', isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const homework = await storage.getAllHomework();
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.get('/api/admin/questions', isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
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

  // Get upload URL for homework files (admin/tutor only)
  app.post("/api/homework/upload-url", uploadLimiter, isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Save homework file metadata after upload
  app.post("/api/homework/files", isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const { homeworkId, fileName, fileUrl, fileType, purpose } = req.body;
      const uploaderId = req.user.claims.sub;
      
      // Normalize the file URL from object storage
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(fileUrl);
      
      const fileData = {
        homeworkId,
        fileName,
        fileUrl: normalizedPath,
        fileType,
        uploadedBy: uploaderId,
        purpose: purpose || "assignment"
      };
      
      const savedFile = await storage.addHomeworkFile(fileData);
      
      res.json({ 
        message: "File metadata saved successfully",
        file: savedFile
      });
    } catch (error) {
      console.error("Error saving file metadata:", error);
      res.status(500).json({ message: "Failed to save file metadata" });
    }
  });

  // Serve homework files (authenticated users only)
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
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
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Student registration endpoint (public)
  const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    language: z.enum(['en', 'hr']),
    mathLevel: z.string().min(1),
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

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Homework routes
  app.get("/api/homework/student/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const homework = await storage.getHomeworkForStudent(studentId);
      res.json(homework);
    } catch (error) {
      console.error("Error fetching student homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.get("/api/homework/tutor/:tutorId", isAuthenticated, async (req: any, res) => {
    try {
      const { tutorId } = req.params;
      const homework = await storage.getHomeworkForTutor(tutorId);
      res.json(homework);
    } catch (error) {
      console.error("Error fetching tutor homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.post("/api/homework", isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const tutorId = req.user.claims.sub;
      const validatedData = insertHomeworkSchema.parse({
        ...req.body,
        tutorId, // Ensure tutorId is set from authenticated user
      });
      const homework = await storage.createHomework(validatedData);
      res.status(201).json(homework);
    } catch (error) {
      console.error("Error creating homework:", error);
      res.status(500).json({ message: "Failed to create homework" });
    }
  });

  app.patch("/api/homework/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateHomeworkSchema.parse(req.body);
      const homework = await storage.updateHomework(id, updates);
      if (!homework) {
        return res.status(404).json({ message: "Homework not found" });
      }
      res.json(homework);
    } catch (error) {
      console.error("Error updating homework:", error);
      res.status(500).json({ message: "Failed to update homework" });
    }
  });

  app.get("/api/homework/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const homework = await storage.getHomeworkById(id);
      if (!homework) {
        return res.status(404).json({ message: "Homework not found" });
      }
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  // Homework files routes
  app.get("/api/homework/:id/files", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const files = await storage.getHomeworkFiles(id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching homework files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/homework/:id/files", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { fileName, fileUrl, fileType, uploadedBy, purpose = "submission" } = req.body;
      const file = await storage.addHomeworkFile({
        homeworkId: id,
        fileName,
        fileUrl,
        fileType,
        uploadedBy,
        purpose,
      });
      res.status(201).json(file);
    } catch (error) {
      console.error("Error adding homework file:", error);
      res.status(500).json({ message: "Failed to add file" });
    }
  });

  // Question routes
  app.get("/api/questions/student/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const questions = await storage.getQuestionsForStudent(studentId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching student questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/unanswered", isAuthenticated, async (req: any, res) => {
    try {
      const questions = await storage.getUnansweredQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching unanswered questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(userId, questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.patch("/api/questions/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { answer } = req.body;
      const tutorId = req.user.claims.sub;
      const question = await storage.answerQuestion(id, answer, tutorId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: "Failed to answer question" });
    }
  });

  // Tutor availability endpoints
  app.get("/api/availability", isAuthenticated, async (req: any, res) => {
    try {
      const { date } = req.query;
      const availability = await storage.getTutorAvailability(date as string);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching tutor availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Progress tracking endpoint
  app.get("/api/progress/student/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const progress = await storage.getStudentProgress(studentId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Data export endpoints (admin/tutor only)
  app.get('/api/admin/export-summary', isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const students = await storage.getAllStudents();
      const homework = await storage.getAllHomework();
      const contacts = await storage.getAllContacts();
      
      const summary = {
        students: students.length,
        homework: homework.length,
        contacts: contacts.length,
        progress: 0, // Placeholder for progress records
        total: students.length + homework.length + contacts.length,
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching export summary:", error);
      res.status(500).json({ message: "Failed to fetch export summary" });
    }
  });

  app.post('/api/admin/export', apiLimiter, isAuthenticated, requireRole(["admin", "tutor"]), async (req: any, res) => {
    try {
      const { type, dateRange, filters } = req.body;
      
      let data: any[] = [];
      let filename = `lukamath-${type}`;
      
      switch (type) {
        case 'students':
          data = await storage.getAllStudents();
          if (filters?.mathLevel) {
            data = data.filter((student: any) => student.mathLevel === filters.mathLevel);
          }
          break;
          
        case 'homework':
          data = await storage.getAllHomework();
          if (filters?.status) {
            data = data.filter((hw: any) => hw.status === filters.status);
          }
          break;
          
        case 'contacts':
          data = await storage.getAllContacts();
          break;
          
        case 'full-backup':
          const students = await storage.getAllStudents();
          const homework = await storage.getAllHomework();
          const contacts = await storage.getAllContacts();
          data = { students, homework, contacts };
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid export type' });
      }
      
      // Apply date filters if provided
      if (dateRange?.start && dateRange?.end && Array.isArray(data)) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        data = data.filter((item: any) => {
          const itemDate = new Date(item.createdAt || item.submittedAt || item.dueDate);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      // Convert to CSV format
      const csvData = convertToCSV(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
      
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
