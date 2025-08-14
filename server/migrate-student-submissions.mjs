import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { studentSubmissions } from "../shared/schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("🔄 Starting student submissions table migration...");

try {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  // Create the student_submissions table
  await pool.query(`
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

  console.log("✅ Student submissions table created successfully");

  await pool.end();
  console.log("🎉 Migration completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
