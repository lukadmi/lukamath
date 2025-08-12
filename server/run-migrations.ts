import { sql } from './db.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Read and execute the migration file
    const migrationPath = join(__dirname, 'migrations', '001_create_users_auth.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration: 001_create_users_auth.sql');
    
    // Execute the migration
    await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Database tables created:');
    console.log('  - sessions (authentication sessions)');
    console.log('  - users (user accounts with authentication)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('🎉 All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
