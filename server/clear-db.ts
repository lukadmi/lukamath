import { db } from "./db";
import { users, contacts, homework, questions, tutorAvailability, homeworkFiles } from "@shared/schema";
import { eq, ne } from "drizzle-orm";

async function clearDatabase() {
  console.log("🧹 Clearing sample data from database...");

  try {
    // Delete all homework files
    await db.delete(homeworkFiles);
    console.log("✅ Cleared homework files");

    // Delete all homework assignments
    await db.delete(homework);
    console.log("✅ Cleared homework assignments");

    // Delete all student questions
    await db.delete(questions);
    console.log("✅ Cleared student questions");

    // Delete all tutor availability
    await db.delete(tutorAvailability);
    console.log("✅ Cleared tutor availability");

    // Delete all contacts
    await db.delete(contacts);
    console.log("✅ Cleared contact inquiries");

    // Delete sample users but keep the authenticated user
    await db.delete(users).where(ne(users.id, "46014057"));
    console.log("✅ Cleared sample users (kept your authenticated account)");

    console.log("🎉 Database cleared successfully!");
    console.log("\nYour authenticated account is preserved.");
    console.log("You can now add real data through the admin dashboard.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

// Run clearing if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase();
}

export { clearDatabase };