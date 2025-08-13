import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { RegisterUser, LoginUser, User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

export interface AuthResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  message: string;
  messageKey?: string; // For translation
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterUser): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists',
          messageKey: 'auth.email_exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          language: userData.language,
          role: 'student',
          isEmailVerified: false,
        })
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          language: users.language,
          isEmailVerified: users.isEmailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      if (newUser.length === 0) {
        return {
          success: false,
          message: 'Failed to create user',
          messageKey: 'auth.registration_failed'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser[0].id, 
          email: newUser[0].email,
          role: newUser[0].role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        user: newUser[0],
        token,
        message: 'Registration successful',
        messageKey: 'auth.registration_success'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Internal server error during registration',
        messageKey: 'auth.server_error'
      };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginUser): Promise<AuthResult> {
    try {
      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email))
        .limit(1);

      if (userResult.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password',
          messageKey: 'auth.invalid_credentials'
        };
      }

      const user = userResult[0];

      // Verify password
      console.log('🔐 Password verification:', {
        email: credentials.email,
        providedPassword: credentials.password,
        storedHashPrefix: user.password.substring(0, 10) + '...'
      });

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      console.log('🔐 Password verification result:', isPasswordValid);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
          messageKey: 'auth.invalid_credentials'
        };
      }

      // Update last login time
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return user without password
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful',
        messageKey: 'auth.login_success'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error during login',
        messageKey: 'auth.server_error'
      };
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string; role?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get user by ID (without password)
   */
  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          language: users.language,
          isEmailVerified: users.isEmailVerified,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return userResult.length > 0 ? userResult[0] : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
