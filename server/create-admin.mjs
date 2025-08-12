import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existing = await db.select().from(users).where(eq(users.email, 'olovka0987@gmail.com')).limit(1);
    
    if (existing.length > 0) {
      console.log('Admin user already exists');
      console.log('Existing user:', existing[0]);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const newAdmin = await db.insert(users).values({
      email: 'olovka0987@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      language: 'en',
      isEmailVerified: true,
    }).returning();

    console.log('Admin user created successfully:');
    console.log('Email:', newAdmin[0].email);
    console.log('Role:', newAdmin[0].role);
    console.log('Password: Admin123!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
