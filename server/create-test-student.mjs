import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users, contacts, questions } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function createTestData() {
  try {
    console.log('Creating test data...');
    
    // Check if test student already exists
    const existing = await db.select().from(users).where(eq(users.email, 'student@test.com')).limit(1);
    
    if (existing.length === 0) {
      // Create test student
      const hashedPassword = await bcrypt.hash('Student123!', 12);
      const newStudent = await db.insert(users).values({
        email: 'student@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        language: 'en',
        isEmailVerified: true,
      }).returning();
      console.log('Test student created:', newStudent[0].email);
    } else {
      console.log('Test student already exists');
    }

    // Get all students to get the test student ID
    const students = await db.select().from(users).where(eq(users.role, 'student'));
    const testStudent = students.find(s => s.email === 'student@test.com');

    if (testStudent) {
      // Create some test contacts
      const contactCount = await db.select().from(contacts);
      if (contactCount.length === 0) {
        await db.insert(contacts).values([
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            subject: 'Help with Algebra',
            message: 'I need help with quadratic equations.'
          },
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            subject: 'Calculus Tutoring',
            message: 'Looking for calculus tutoring sessions.'
          }
        ]);
        console.log('Test contacts created');
      }

      // Create some test questions
      const questionCount = await db.select().from(questions);
      if (questionCount.length === 0) {
        await db.insert(questions).values([
          {
            studentId: testStudent.id,
            subject: 'Algebra',
            title: 'Quadratic Formula',
            content: 'Can you explain how to use the quadratic formula step by step?',
            priority: 'medium'
          },
          {
            studentId: testStudent.id,
            subject: 'Geometry',
            title: 'Area of Triangle',
            content: 'How do I calculate the area of a triangle when I only know the three sides?',
            priority: 'low'
          }
        ]);
        console.log('Test questions created');
      }
    }

    console.log('Test data setup complete!');
    console.log('\nTest Credentials:');
    console.log('Admin: olovka0987@gmail.com / Admin123!');
    console.log('Student: student@test.com / Student123!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
