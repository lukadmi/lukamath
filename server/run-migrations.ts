import { db, pool } from './db.js';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    // Test database connection first
    console.log('🔗 Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully:', testResult.rows[0]);

    // Read and execute the migration file
    const migrationPath = join(__dirname, 'migrations', '001_create_users_auth.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration: 001_create_users_auth.sql');

    // Execute the migration using the pool
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Database tables created:');
    console.log('  - sessions (authentication sessions)');
    console.log('  - users (user accounts with authentication)');

    // Test that the tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions')
      ORDER BY table_name
    `);

    console.log('📋 Created tables:', tablesResult.rows.map(row => row.table_name));

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
