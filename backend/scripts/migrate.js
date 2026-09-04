const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Run all migrations
 */
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');

    const migrationsDir = __dirname;
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Running migration: ${file}`);
      
      try {
        await db.query(sql);
        console.log(`✅ ${file} completed\n`);
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error.message);
        // Continue with next migration or throw
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Schema already exists, skipping...\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
