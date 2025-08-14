import { db } from './server/db.js';
import { homeworkFiles, homework } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function addTestHomeworkFile() {
  try {
    // First, get any existing homework assignment
    const existingHomework = await db.select().from(homework).limit(1);
    
    if (existingHomework.length === 0) {
      console.log('No homework assignments found in database');
      return;
    }
    
    const homeworkId = existingHomework[0].id;
    const tutorId = existingHomework[0].tutorId;
    
    console.log('Adding test file to homework:', homeworkId);
    
    // Add a test file record
    const testFile = await db.insert(homeworkFiles).values({
      homeworkId: homeworkId,
      fileName: 'test-math-problems.pdf',
      fileUrl: '/uploads/test-math-problems.pdf',
      fileType: 'pdf',
      uploadedBy: tutorId,
      purpose: 'assignment'
    }).returning();
    
    console.log('Test file added:', testFile[0]);
    
    // Verify the file was added by querying it back
    const files = await db.select().from(homeworkFiles).where(eq(homeworkFiles.homeworkId, homeworkId));
    console.log('All files for homework:', files);
    
  } catch (error) {
    console.error('Error adding test file:', error);
  }
}

addTestHomeworkFile();
