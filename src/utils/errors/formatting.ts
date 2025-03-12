
import { AppError, ErrorType } from './types';

/**
 * Format error messages consistently
 */
export function formatErrorMessage(error: any, context?: string): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

/**
 * Log errors to console with consistent formatting
 */
export function logError(error: any, context?: string): void {
  const errorObject = error instanceof AppError ? error : error;
  
  console.group('🚨 Application Error');
  console.error(`Error ${context ? `in ${context}` : ''}:`, errorObject);
  
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  
  console.groupEnd();
}

// NOTE: This function is deprecated - use createAppError from handler.tsx instead
// @deprecated
export function createAppError(error: any, context?: string): AppError {
  console.warn('This createAppError function in formatting.ts is deprecated. Use the one from handler.tsx instead.');
  
  if (error instanceof AppError) {
    return error;
  }
  
  let errorType = ErrorType.UNKNOWN;
  let message = formatErrorMessage(error, context);
  
  return new AppError(message, errorType, error, context);
}
