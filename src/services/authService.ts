import { pool } from '../db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserCreateInput, UserLoginInput, AuthResponse } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: UserCreateInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase();

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, 'user', NOW(), NOW())
       RETURNING id, email, role, created_at as "createdAt", updated_at as "updatedAt"`,
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = this.generateToken(user);
    return { user, token };
  }

  /**
   * Login user
   */
  async login(input: UserLoginInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase();
    
    // Debug Log 1: Check if request reaches here
    console.log(`[AuthService] Login attempt for: ${email}`);

    const result = await pool.query(
      `SELECT id, email, password_hash, role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.error(`[AuthService] User not found in DB: ${email}`);
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const userRow: any = result.rows[0];
    const isValidPassword = await bcrypt.compare(input.password, userRow.password_hash);

    if (!isValidPassword) {
      console.error(`[AuthService] Password hash mismatch for: ${email}`);
      // Log the hash version to catch $2y vs $2b issues
      console.error(`[AuthService] DB Hash starts with: ${userRow.password_hash.substring(0, 4)}`); 
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Hide password hash from result
    delete userRow.password_hash;

    const token = this.generateToken(userRow);
    console.log(`[AuthService] Login successful for: ${email}`);
    return { user: userRow, token };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create OR Reset admin user
   * (Run at app start to ensure admin credentials are always valid)
   */
  async createAdminUser(adminEmail = 'admin@gmail.com', adminPassword = 'admin@123'): Promise<void> {
    const email = adminEmail.toLowerCase();
    const saltRounds = 10;
    // Generate the hash using the CURRENT environment's bcrypt library
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingAdmin.rows.length > 0) {
      // FIX: Update the password even if user exists to fix bad hashes
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
      console.log(`✅ Admin user found. Password RESET to: ${adminPassword}`);
    } else {
      // Create new
      await pool.query(
        `INSERT INTO users (email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, 'admin', NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [email, passwordHash]
      );
      console.log(`✅ Admin user created with password: ${adminPassword}`);
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { id: number; email: string; role: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}