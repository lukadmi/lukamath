import { db } from "./db";
import { users, contacts, homework as homeworkTable, questions, tutorAvailability, homeworkFiles } from "@shared/schema";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  console.log("🔄 Initializing database with sample data...");

  try {
    // Check if Luka (tutor) already exists
    let [lukaUser] = await db.select().from(users).where(eq(users.email, "luka@lukamath.com"));
    
    if (!lukaUser) {
      // Create Luka as the tutor with admin role
      [lukaUser] = await db
        .insert(users)
        .values({
          id: "tutor-luka-001",
          email: "luka@lukamath.com",
          firstName: "Luka",
          lastName: "Savčić",
          profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          role: "admin"
        })
        .onConflictDoNothing()
        .returning();
      console.log("✅ Created tutor account for Luka");
    }

    // Create sample students if they don't exist
    const students = [
      {
        id: "student-001",
        email: "ana.petrovic@example.com",
        firstName: "Ana",
        lastName: "Petrović",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        role: "student"
      },
      {
        id: "student-002", 
        email: "marko.nikolic@example.com",
        firstName: "Marko",
        lastName: "Nikolić",
        profileImageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face",
        role: "student"
      },
      {
        id: "student-003",
        email: "petra.jovanovic@example.com", 
        firstName: "Petra",
        lastName: "Jovanović",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "student"
      }
    ];

    for (const student of students) {
      await db
        .insert(users)
        .values(student)
        .onConflictDoNothing();
    }
    console.log("✅ Created sample student accounts");

    // Create sample contacts
    const sampleContacts = [
      {
        name: "Stefan Marković",
        email: "stefan.markovic@example.com",
        phone: "+381 60 123 4567",
        subject: "High School Math",
        message: "Trebam pomoć sa trigonometrijom i derivatima. Kada mogu zakazati prvi čas?"
      },
      {
        name: "Milica Stojanović", 
        email: "milica.stojanovic@example.com",
        phone: "+381 63 987 6543",
        subject: "SAT/ACT Prep",
        message: "Preparing for SAT exam. Need help with algebra and geometry sections."
      },
      {
        name: "Nikola Jovanović",
        email: "nikola.jovanovic@example.com", 
        phone: "+381 64 555 7890",
        subject: "Middle School Math",
        message: "Moj sin ima problema sa razlomcima i osnovama algebre. Da li možete pomoći?"
      }
    ];

    for (const contact of sampleContacts) {
      await db
        .insert(contacts)
        .values(contact)
        .onConflictDoNothing();
    }
    console.log("✅ Created sample contact inquiries");

    // Create sample homework assignments
    const homeworkAssignments = [
      {
        studentId: "student-001",
        tutorId: lukaUser.id,
        title: "Kvadratne Jednačine - Domaći Zadatak 1",
        description: "Rešiti kvadratne jednačine koristeći formulu i faktorisanje",
        instructions: "1. Rešiti svih 10 jednačina\n2. Pokazati sva rešenja korak po korak\n3. Proveriti rezultate uvrštavanjem",
        subject: "Algebra",
        difficulty: "intermediate",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "assigned",
        totalPoints: 100
      },
      {
        studentId: "student-002", 
        tutorId: lukaUser.id,
        title: "Geometry - Triangle Properties",
        description: "Study triangles, their properties and calculate areas",
        instructions: "1. Complete worksheet on triangle types\n2. Calculate areas using different formulas\n3. Solve word problems",
        subject: "Geometry", 
        difficulty: "beginner",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "assigned",
        totalPoints: 80
      },
      {
        studentId: "student-003",
        tutorId: lukaUser.id, 
        title: "Calculus - Derivatives Practice",
        description: "Practice finding derivatives of polynomial and trigonometric functions",
        instructions: "1. Find derivatives of given functions\n2. Apply chain rule where necessary\n3. Interpret geometric meaning",
        subject: "Calculus",
        difficulty: "advanced", 
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: "assigned",
        totalPoints: 120
      }
    ];

    const createdHomework = [];
    for (const hw of homeworkAssignments) {
      const [createdHw] = await db
        .insert(homeworkTable)
        .values(hw)
        .onConflictDoNothing()
        .returning();
      if (createdHw) createdHomework.push(createdHw);
    }
    console.log("✅ Created sample homework assignments");

    // Create sample questions from students
    const studentQuestions = [
      {
        studentId: "student-001",
        subject: "Algebra",
        title: "Kako rešiti kompleksne kvadratne jednačine?",
        content: "Ne razumem kako da rešim jednačinu x² + 4x + 13 = 0. Diskriminanta je negativna, šta to znači?",
        priority: "medium"
      },
      {
        studentId: "student-002",
        subject: "Geometry", 
        title: "Area calculation confusion",
        content: "I'm confused about when to use different triangle area formulas. Can you explain?",
        priority: "high"
      },
      {
        studentId: "student-003",
        subject: "Calculus",
        title: "Chain rule application",
        content: "Kada tačno primenjujem chain rule? Možete li objasniti na konkretnom primeru?", 
        priority: "low"
      }
    ];

    for (const question of studentQuestions) {
      await db
        .insert(questions)
        .values(question)
        .onConflictDoNothing();
    }
    console.log("✅ Created sample student questions");

    // Create sample tutor availability
    const now = new Date();
    const availabilitySlots = [];
    
    // Generate availability for next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Morning slots (9:00-12:00)
      availabilitySlots.push({
        tutorId: lukaUser.id,
        date: date,
        startTime: "09:00",
        endTime: "10:00", 
        isAvailable: true,
        notes: "Morning session - best for complex topics"
      });
      
      availabilitySlots.push({
        tutorId: lukaUser.id,
        date: date,
        startTime: "10:00", 
        endTime: "11:00",
        isAvailable: true
      });
      
      // Afternoon slots (14:00-17:00)
      availabilitySlots.push({
        tutorId: lukaUser.id,
        date: date,
        startTime: "14:00",
        endTime: "15:00",
        isAvailable: true
      });
      
      availabilitySlots.push({
        tutorId: lukaUser.id,
        date: date, 
        startTime: "15:00",
        endTime: "16:00",
        isAvailable: Math.random() > 0.3 // 70% available
      });
      
      availabilitySlots.push({
        tutorId: lukaUser.id,
        date: date,
        startTime: "16:00", 
        endTime: "17:00",
        isAvailable: Math.random() > 0.5 // 50% available
      });
    }

    for (const slot of availabilitySlots) {
      await db
        .insert(tutorAvailability)
        .values(slot)
        .onConflictDoNothing();
    }
    console.log("✅ Created tutor availability schedule");

    // Create sample homework files
    if (createdHomework.length > 0) {
      const sampleFiles = [
        {
          homeworkId: createdHomework[0].id,
          fileName: "kvadratne_jednacine_worksheet.pdf",
          fileUrl: "/files/kvadratne_jednacine_worksheet.pdf",
          fileType: "pdf",
          uploadedBy: lukaUser.id,
          purpose: "assignment"
        },
        {
          homeworkId: createdHomework[1].id,
          fileName: "triangle_properties_guide.pdf", 
          fileUrl: "/files/triangle_properties_guide.pdf",
          fileType: "pdf",
          uploadedBy: lukaUser.id,
          purpose: "reference"
        },
        {
          homeworkId: createdHomework[2].id,
          fileName: "derivatives_practice_problems.pdf",
          fileUrl: "/files/derivatives_practice_problems.pdf", 
          fileType: "pdf",
          uploadedBy: lukaUser.id,
          purpose: "assignment"
        }
      ];

      for (const file of sampleFiles) {
        await db
          .insert(homeworkFiles)
          .values(file)
          .onConflictDoNothing();
      }
      console.log("✅ Created sample homework files");
    }

    console.log("🎉 Database initialization completed successfully!");
    console.log("\nSample accounts created:");
    console.log("👨‍🏫 Tutor: luka@lukamath.com (Admin)");
    console.log("👩‍🎓 Students: ana.petrovic@example.com, marko.nikolic@example.com, petra.jovanovic@example.com");
    console.log("\n📊 Sample data includes:");
    console.log("• Contact inquiries");
    console.log("• Homework assignments with files");
    console.log("• Student questions");
    console.log("• Tutor availability schedule");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };