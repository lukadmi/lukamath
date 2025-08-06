import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional();

export const nameSchema = z.string()
  .min(1, 'This field is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-ZčćžšđČĆŽŠĐ\s]+$/, 'Name can only contain letters and spaces');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const mathLevelSchema = z.enum(['middle', 'high-school', 'university', 'sat-act'], {
  required_error: 'Please select a math level'
});

export const languageSchema = z.enum(['en', 'hr'], {
  required_error: 'Please select a language'
});

export const difficultySchema = z.enum(['easy', 'medium', 'hard'], {
  required_error: 'Please select difficulty level'
});

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Form validation helpers
export function validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => file.type.includes(type) || file.name.toLowerCase().endsWith(type));
}

export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const allowedDocumentTypes = ['application/pdf', '.doc', '.docx', '.txt', '.rtf'];
export const allowedFileTypes = [...allowedImageTypes, ...allowedDocumentTypes];

// Error message helpers
export function getValidationErrorMessage(error: any): string {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred. Please try again.';
}

export function formatZodErrors(errors: any): string[] {
  if (!errors || typeof errors !== 'object') return [];
  
  const messages: string[] = [];
  Object.keys(errors).forEach(key => {
    const error = errors[key];
    if (error?.message) {
      messages.push(error.message);
    }
  });
  
  return messages;
}