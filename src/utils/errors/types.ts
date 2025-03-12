
/**
 * Error types for application-specific errors with detailed information
 */
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  DATABASE = 'database',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server'
}

/**
 * Extension of standard error with additional context
 */
export class AppError extends Error {
  type: ErrorType;
  context?: string;
  originalError?: Error;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, context?: string) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
  }
}

/**
 * Determine if an error is non-critical for the application flow
 * Used to prevent showing error messages for expected infrastructure issues
 */
export function isNonCriticalError(err: any): boolean {
  if (!err) return true;
  
  // Infrastructure setup messages (functions not existing yet)
  if (typeof err.message === 'string' && (
    err.message.toLowerCase().includes('support table') || 
    err.message.toLowerCase().includes('function does not exist') ||
    err.message.toLowerCase().includes('relation') && err.message.toLowerCase().includes('does not exist')
  )) {
    return true;
  }
  
  return false;
}
