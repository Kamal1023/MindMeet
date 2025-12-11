import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';
import { AuthService } from '../services/authService';

async function migrate() {
  try {
    const migrationPath = join(__dirname, 'migration_add_auth.sql');
    const migration = readFileSync(migrationPath, 'utf-8');
    await pool.query(migration);
    console.log('Users table created successfully');

    // Create admin user
    const authService = new AuthService();
    await authService.createAdminUser();

    console.log('Authentication migration completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();

