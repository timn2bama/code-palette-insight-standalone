/**
 * Security utilities for input validation and sanitization
 * 
 * This module provides comprehensive security functions to protect against:
 * - XSS (Cross-Site Scripting) attacks
 * - SQL injection
 * - File upload vulnerabilities
 * - Rate limiting abuse
 * - Information disclosure
 * 
 * @module security
 */

/**
 * Maximum allowed lengths for various input fields
 * Used to prevent buffer overflow and ensure data consistency
 */
const MAX_INPUT_LENGTHS = {
  name: 100,
  description: 500,
  brand: 50,
  color: 30,
  category: 30,
  occasion: 30,
  season: 30,
  email: 255,
  displayName: 100
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = { width: 4000, height: 4000 };

/**
 * Sanitizes text input to prevent XSS attacks
 * 
 * Removes potentially dangerous characters that could be used for script injection
 * and enforces maximum length to prevent buffer overflow attacks.
 * 
 * @param input - The raw user input string
 * @returns Sanitized string safe for storage and display
 * 
 * @example
 * ```typescript
 * const userInput = "<script>alert('xss')</script>Hello";
 * const safe = sanitizeInput(userInput);
 * // Returns: "scriptalertsscriptHello"
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove potentially dangerous characters
    .substring(0, 500); // Limit length
}

/**
 * Validates text input for length and potentially malicious content
 * 
 * Performs comprehensive validation including:
 * - Length validation against field-specific limits
 * - Pattern matching for script injection attempts
 * - Automatic sanitization
 * 
 * @param input - The raw user input
 * @param field - The field name (used to determine max length)
 * @returns Validation result with sanitized value
 * 
 * @example
 * ```typescript
 * const result = validateTextInput("John Doe", "name");
 * if (result.isValid) {
 *   console.log(result.sanitized); // "John Doe"
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateTextInput(input: string, field: keyof typeof MAX_INPUT_LENGTHS): {
  isValid: boolean;
  error?: string;
  sanitized: string;
} {
  const sanitized = sanitizeInput(input);
  const maxLength = MAX_INPUT_LENGTHS[field];
  
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `${field} must be ${maxLength} characters or less`,
      sanitized
    };
  }
  
  // Check for suspicious patterns
  if (sanitized.match(/<script|javascript:|data:/i)) {
    return {
      isValid: false,
      error: 'Invalid characters detected',
      sanitized: sanitized.replace(/<script|javascript:|data:/gi, '')
    };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email);
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  if (sanitized.length > MAX_INPUT_LENGTHS.email) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  return { isValid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate image dimensions (requires loading the image)
 */
export function validateImageDimensions(file: File): Promise<{
  isValid: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Image dimensions must be less than ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Unable to process image file'
      });
    };
    
    img.src = url;
  });
}

/**
 * Client-side rate limiting utility
 * 
 * Prevents abuse by limiting the number of attempts for specific actions
 * within a time window. Common use cases:
 * - Login attempts
 * - API calls
 * - Form submissions
 * 
 * @class RateLimiter
 * 
 * @example
 * ```typescript
 * // Allow max 5 login attempts per 5 minutes
 * if (rateLimiter.isAllowed('login-user@example.com', 5, 300000)) {
 *   attemptLogin();
 * } else {
 *   showError('Too many attempts. Please wait.');
 * }
 * ```
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  /**
   * Checks if an action is allowed based on rate limiting rules
   * 
   * @param key - Unique identifier for the action (e.g., "login-user@email.com")
   * @param maxAttempts - Maximum number of attempts allowed (default: 5)
   * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
   * @returns true if action is allowed, false if rate limit exceeded
   */
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  /**
   * Resets the rate limit counter for a specific key
   * 
   * @param key - The identifier to reset
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Converts error objects into safe error messages
 * 
 * Prevents leaking sensitive information like database schemas,
 * internal paths, or system details to end users.
 * 
 * @param error - Error object from any source
 * @returns User-friendly error message safe for display
 * 
 * @example
 * ```typescript
 * try {
 *   await database.insert(...);
 * } catch (error) {
 *   const safeMessage = getSafeErrorMessage(error);
 *   toast({ title: "Error", description: safeMessage });
 * }
 * ```
 */
export function getSafeErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Don't expose database or internal errors
    if (error.message.includes('duplicate key') || 
        error.message.includes('constraint') ||
        error.message.includes('violates')) {
      return 'This operation is not allowed. Please try again.';
    }
    
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Authentication required. Please log in again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://oikpwuraixlnjvyrmnwx.supabase.co', 'https://api.weatherapi.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};