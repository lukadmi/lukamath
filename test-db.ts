import { db } from './server/db.ts';

console.log("🔍 Testing database connection...");

try {
  // Simple query to test connection
  const result = await db.execute('SELECT NOW() as current_time');
  console.log("✅ Database connection successful:", result);
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
}

console.log("🏁 Database test completed");
process.exit(0);
