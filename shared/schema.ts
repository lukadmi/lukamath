import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp,
  boolean,
  integer,
  index,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for student and tutor accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // bcrypt hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // 'student', 'tutor', 'admin'
  language: varchar("language").notNull().default("en"), // 'en' or 'hr'
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact forms (from marketing site)
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Homework assignments
export const homework = pgTable("homework", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  subject: varchar("subject").notNull(), // 'algebra', 'geometry', 'calculus', etc.
  difficulty: varchar("difficulty").notNull().default("medium"), // 'easy', 'medium', 'hard'
  dueDate: timestamp("due_date"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed'
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  grade: integer("grade"), // 0-100
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Homework files (attachments from tutor or student submissions)
export const homeworkFiles = pgTable("homework_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").notNull().references(() => homework.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // 'pdf', 'image', 'doc', etc.
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id), // who uploaded it
  purpose: varchar("purpose").notNull(), // 'assignment', 'submission', 'feedback'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Questions students can ask
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  subject: varchar("subject").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isAnswered: boolean("is_answered").notNull().default(false),
  answer: text("answer"),
  answeredAt: timestamp("answered_at"),
  answeredBy: varchar("answered_by").references(() => users.id),
  priority: varchar("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student homework submissions
export const studentSubmissions = pgTable("student_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").notNull().references(() => homework.id),
  studentId: varchar("student_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tutor availability for scheduling
export const tutorAvailability = pgTable("tutor_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(), // '09:00'
  endTime: varchar("end_time").notNull(), // '17:00'
  isAvailable: boolean("is_available").notNull().default(true),
  notes: text("notes"),
  bookedBy: varchar("booked_by").references(() => users.id),
  bookingNotes: text("booking_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedHomework: many(homework, { relationName: "studentHomework" }),
  createdHomework: many(homework, { relationName: "tutorHomework" }),
  questions: many(questions, { relationName: "studentQuestions" }),
  answeredQuestions: many(questions, { relationName: "tutorAnswers" }),
  uploadedFiles: many(homeworkFiles),
}));

export const homeworkRelations = relations(homework, ({ one, many }) => ({
  student: one(users, {
    fields: [homework.studentId],
    references: [users.id],
    relationName: "studentHomework",
  }),
  tutor: one(users, {
    fields: [homework.tutorId],
    references: [users.id],
    relationName: "tutorHomework",
  }),
  files: many(homeworkFiles),
}));

export const homeworkFilesRelations = relations(homeworkFiles, ({ one }) => ({
  homework: one(homework, {
    fields: [homeworkFiles.homeworkId],
    references: [homework.id],
  }),
  uploader: one(users, {
    fields: [homeworkFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  student: one(users, {
    fields: [questions.studentId],
    references: [users.id],
    relationName: "studentQuestions",
  }),
  tutor: one(users, {
    fields: [questions.answeredBy],
    references: [users.id],
    relationName: "tutorAnswers",
  }),
}));

export const tutorAvailabilityRelations = relations(tutorAvailability, ({ one }) => ({
  tutor: one(users, {
    fields: [tutorAvailability.tutorId],
    references: [users.id],
  }),
}));

export const studentSubmissionsRelations = relations(studentSubmissions, ({ one }) => ({
  homework: one(homework, {
    fields: [studentSubmissions.homeworkId],
    references: [homework.id],
  }),
  student: one(users, {
    fields: [studentSubmissions.studentId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject selection is required"),
  message: z.string().min(1, "Please describe your math goals"),
});

export const insertHomeworkSchema = createInsertSchema(homework).pick({
  studentId: true,
  tutorId: true,
  title: true,
  description: true,
  instructions: true,
  subject: true,
  difficulty: true,
  dueDate: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  subject: true,
  title: true,
  content: true,
  priority: true,
});

export const updateHomeworkSchema = createInsertSchema(homework).pick({
  isCompleted: true,
  grade: true,
  feedback: true,
}).partial();

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  language: z.enum(["en", "hr"]).default("en"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homework.$inferSelect;
export type HomeworkFile = typeof homeworkFiles.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type UpdateHomework = z.infer<typeof updateHomeworkSchema>;
export type TutorAvailability = typeof tutorAvailability.$inferSelect;
export type StudentSubmission = typeof studentSubmissions.$inferSelect;
