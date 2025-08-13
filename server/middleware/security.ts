import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for development and testing
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development assets
    return req.url.includes('/@fs/') || 
           req.url.includes('/@vite/') || 
           req.url.includes('/src/') ||
           req.url.includes('/node_modules/') ||
           req.url.startsWith('/attached_assets/');
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Much higher limit for API endpoints during development
  message: {
    error: 'API rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit file uploads
  message: {
    error: 'Upload limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// CSRF protection (simple token-based)
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and authentication endpoints
  if (req.method === 'GET' || req.path.includes('/api/auth') || req.path.includes('/api/login')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionToken = (req.session as any)?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Generate CSRF token for session
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Content Security Policy headers
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Allow Builder.io to iframe the site
  res.setHeader('X-Frame-Options', 'ALLOWALL');

  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // More permissive CSP for Builder.io compatibility
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss: ws:; frame-ancestors 'self' https://builder.io https://*.builder.io;"
  );

  // Add CORS headers for Builder.io
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
}

// File upload validation
export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
  // This would be used with multer or similar file upload middleware
  // For now, we'll validate file metadata in the request body
  
  if (req.body.fileName) {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = req.body.fileName.toLowerCase().split('.').pop();
    
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      return res.status(400).json({ error: 'File type not allowed' });
    }
  }

  if (req.body.fileSize) {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (parseInt(req.body.fileSize) > maxSizeInBytes) {
      return res.status(400).json({ error: 'File size too large' });
    }
  }

  next();
}

// Request logging for security monitoring
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn('Security alert:', logData);
    }
  });
  
  next();
}
