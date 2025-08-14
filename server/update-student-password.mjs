import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateStudentPassword() {
  try {
    console.log('Updating student password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('!HeliosDecor0987!', 12);
    
    // Update student user password
    const updatedStudent = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, 'heliosssdecor@gmail.com'))
      .returning();

    if (updatedStudent.length === 0) {
      console.error('Student user not found');
      process.exit(1);
    }

    console.log('Student password updated successfully!');
    console.log('Email: heliosssdecor@gmail.com');
    console.log('Password: !HeliosDecor0987!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating student password:', error);
    process.exit(1);
  }
}

updateStudentPassword();
