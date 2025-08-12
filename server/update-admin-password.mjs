import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateAdminPassword() {
  try {
    console.log('Updating admin password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('!LukaMath0987!', 12);
    
    // Update admin user password
    const updatedAdmin = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, 'olovka0987@gmail.com'))
      .returning();

    if (updatedAdmin.length === 0) {
      console.error('Admin user not found');
      process.exit(1);
    }

    console.log('Admin password updated successfully!');
    console.log('Email: olovka0987@gmail.com');
    console.log('Password: !LukaMath0987!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
