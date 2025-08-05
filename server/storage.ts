import { 
  users,
  contacts,
  homework,
  homeworkFiles,
  questions,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
  type Homework,
  type InsertHomework,
  type UpdateHomework,
  type HomeworkFile,
  type Question,
  type InsertQuestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Contact operations
  getContacts(): Promise<Contact[]>;
  createContact(insertContact: InsertContact): Promise<Contact>;
  
  // Homework operations
  getHomeworkForStudent(studentId: string): Promise<Homework[]>;
  getHomeworkForTutor(tutorId: string): Promise<Homework[]>;
  createHomework(insertHomework: InsertHomework): Promise<Homework>;
  updateHomework(id: string, updates: UpdateHomework): Promise<Homework | undefined>;
  getHomeworkById(id: string): Promise<Homework | undefined>;
  
  // Homework files operations
  getHomeworkFiles(homeworkId: string): Promise<HomeworkFile[]>;
  addHomeworkFile(file: Omit<HomeworkFile, 'id' | 'createdAt'>): Promise<HomeworkFile>;
  
  // Question operations
  getQuestionsForStudent(studentId: string): Promise<Question[]>;
  getUnansweredQuestions(): Promise<Question[]>;
  createQuestion(studentId: string, question: InsertQuestion): Promise<Question>;
  answerQuestion(id: string, answer: string, tutorId: string): Promise<Question | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  // Homework operations
  async getHomeworkForStudent(studentId: string): Promise<Homework[]> {
    return await db
      .select()
      .from(homework)
      .where(eq(homework.studentId, studentId))
      .orderBy(desc(homework.createdAt));
  }

  async getHomeworkForTutor(tutorId: string): Promise<Homework[]> {
    return await db
      .select()
      .from(homework)
      .where(eq(homework.tutorId, tutorId))
      .orderBy(desc(homework.createdAt));
  }

  async createHomework(insertHomework: InsertHomework): Promise<Homework> {
    const [hw] = await db
      .insert(homework)
      .values(insertHomework)
      .returning();
    return hw;
  }

  async updateHomework(id: string, updates: UpdateHomework): Promise<Homework | undefined> {
    const [hw] = await db
      .update(homework)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(homework.id, id))
      .returning();
    return hw;
  }

  async getHomeworkById(id: string): Promise<Homework | undefined> {
    const [hw] = await db
      .select()
      .from(homework)
      .where(eq(homework.id, id));
    return hw;
  }

  // Homework files operations
  async getHomeworkFiles(homeworkId: string): Promise<HomeworkFile[]> {
    return await db
      .select()
      .from(homeworkFiles)
      .where(eq(homeworkFiles.homeworkId, homeworkId))
      .orderBy(desc(homeworkFiles.createdAt));
  }

  async addHomeworkFile(file: Omit<HomeworkFile, 'id' | 'createdAt'>): Promise<HomeworkFile> {
    const [hwFile] = await db
      .insert(homeworkFiles)
      .values(file)
      .returning();
    return hwFile;
  }

  // Question operations
  async getQuestionsForStudent(studentId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.studentId, studentId))
      .orderBy(desc(questions.createdAt));
  }

  async getUnansweredQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.isAnswered, false))
      .orderBy(desc(questions.createdAt));
  }

  async createQuestion(studentId: string, question: InsertQuestion): Promise<Question> {
    const [q] = await db
      .insert(questions)
      .values({ ...question, studentId })
      .returning();
    return q;
  }

  async answerQuestion(id: string, answer: string, tutorId: string): Promise<Question | undefined> {
    const [q] = await db
      .update(questions)
      .set({
        answer,
        answeredBy: tutorId,
        answeredAt: new Date(),
        isAnswered: true,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();
    return q;
  }
}

export const storage = new DatabaseStorage();
