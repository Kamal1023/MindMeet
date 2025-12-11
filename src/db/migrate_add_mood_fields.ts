import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function migrate() {
  try {
    const migrationPath = join(__dirname, 'migration_add_mood_fields.sql');
    const migration = readFileSync(migrationPath, 'utf-8');
    await pool.query(migration);
    console.log('Migration completed successfully: Added mood_score and user_note fields');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();

