import { db } from "./db";

async function setupStudentSubmissions() {
  try {
    console.log("🔄 Setting up student_submissions table...");
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "student_submissions" (
        "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        "homework_id" VARCHAR NOT NULL REFERENCES "homework"("id"),
        "student_id" VARCHAR NOT NULL REFERENCES "users"("id"),
        "file_name" TEXT NOT NULL,
        "original_name" TEXT NOT NULL,
        "file_url" TEXT NOT NULL,
        "file_size" INTEGER NOT NULL,
        "mime_type" VARCHAR NOT NULL,
        "notes" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log("✅ student_submissions table created successfully");
  } catch (error) {
    console.error("❌ Failed to create student_submissions table:", error);
  }
}

setupStudentSubmissions();
