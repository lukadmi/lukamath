import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertContactSchema, 
  insertHomeworkSchema, 
  updateHomeworkSchema,
  insertQuestionSchema 
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/homework", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertHomeworkSchema.parse(req.body);
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

  // Object Storage routes for logo uploads
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/logos", async (req, res) => {
    if (!req.body.logoURL) {
      return res.status(400).json({ error: "logoURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.logoURL,
      );

      res.status(200).json({
        objectPath: objectPath,
        message: "Logo uploaded successfully"
      });
    } catch (error) {
      console.error("Error setting logo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
