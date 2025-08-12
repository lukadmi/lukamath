import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth-service.js';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and add user to request
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required',
      messageKey: 'auth.token_required'
    });
  }

  const tokenResult = await AuthService.verifyToken(token);

  if (!tokenResult.valid) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token',
      messageKey: 'auth.token_invalid'
    });
  }

  req.user = {
    userId: tokenResult.userId!,
    email: tokenResult.email!,
    role: tokenResult.role!
  };

  next();
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        messageKey: 'auth.authentication_required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions',
        messageKey: 'auth.insufficient_permissions'
      });
    }

    next();
  };
}

/**
 * Optional authentication - adds user to request if token is valid, but doesn't block if no token
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const tokenResult = await AuthService.verifyToken(token);
    if (tokenResult.valid) {
      req.user = {
        userId: tokenResult.userId!,
        email: tokenResult.email!,
        role: tokenResult.role!
      };
    }
  }

  next();
}
