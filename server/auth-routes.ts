import { Router } from 'express';
import { AuthService } from './auth-service.js';
import { authenticateToken } from './auth-middleware.js';
import { registerSchema, loginSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request data
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        messageKey: 'auth.validation_failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }

    // Register user
    const result = await AuthService.register(validationResult.data);

    const statusCode = result.success ? 201 : 400;
    
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('Registration endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request data
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        messageKey: 'auth.validation_failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }

    // Login user
    const result = await AuthService.login(validationResult.data);

    const statusCode = result.success ? 200 : 401;
    
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        messageKey: 'auth.not_authenticated'
      });
    }

    const user = await AuthService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        messageKey: 'auth.user_not_found'
      });
    }

    res.json({
      success: true,
      user,
      message: 'User retrieved successfully',
      messageKey: 'auth.user_retrieved'
    });

  } catch (error) {
    console.error('Get user endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, but useful for logging)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Note: With JWT, logout is mainly handled client-side by removing the token
    // This endpoint is mainly for logging purposes and future session management
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      messageKey: 'auth.logout_success'
    });

  } catch (error) {
    console.error('Logout endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

/**
 * GET /api/auth/user
 * Get current user information (alias for /me endpoint for compatibility)
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        messageKey: 'auth.not_authenticated'
      });
    }

    const user = await AuthService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        messageKey: 'auth.user_not_found'
      });
    }

    // Return user directly for compatibility with useAuth hook
    res.json(user);

  } catch (error) {
    console.error('Get user endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify if a token is valid (useful for client-side token validation)
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token required',
        messageKey: 'auth.token_required'
      });
    }

    const result = await AuthService.verifyToken(token);

    if (result.valid) {
      const user = await AuthService.getUserById(result.userId!);
      res.json({
        success: true,
        valid: true,
        user,
        message: 'Token is valid',
        messageKey: 'auth.token_valid'
      });
    } else {
      res.status(401).json({
        success: false,
        valid: false,
        message: 'Token is invalid or expired',
        messageKey: 'auth.token_invalid'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageKey: 'auth.server_error'
    });
  }
});

export default router;
