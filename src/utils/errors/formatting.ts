
import { ErrorType, AppError } from './types';
import { detectErrorType } from './detection';

/**
 * Format error for user-friendly display
 */
export function formatErrorMessage(error: any, context?: string): string {
  if (!error) return 'An unknown error occurred';
  
  // If it's already an AppError, use its message
  if (error instanceof AppError) {
    return error.message;
  }
  
  const errorType = detectErrorType(error);
  const originalMessage = error.message || String(error);
  
  // Create user-friendly messages based on error type
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    
    case ErrorType.TIMEOUT:
      return context === 'search' 
        ? 'The search took too long to complete. Please try a more specific location or different filters.'
        : 'The operation timed out. Please try again.';
    
    case ErrorType.AUTHENTICATION:
      return 'You need to be logged in to perform this action.';
    
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    
    case ErrorType.VALIDATION:
      return 'There was a problem with the provided information.';
    
    case ErrorType.NOT_FOUND:
      return 'The requested resource could not be found.';
    
    case ErrorType.DATABASE:
      // Don't expose database errors to users
      console.error('Database error:', originalMessage);
      return 'There was a problem accessing the data. Our team has been notified.';
    
    case ErrorType.SERVER:
      return 'The server encountered an error. Please try again later.';
    
    default:
      // For unknown errors, log the original message but show a generic one to users
      console.error('Unknown error:', originalMessage);
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Log error to console with useful formatting and context
 */
export function logError(error: any, context?: string): void {
  const errorType = error instanceof AppError ? error.type : detectErrorType(error);
  
  console.group(`🚨 Error [${errorType}]${context ? ` in ${context}` : ''}`);
  console.error(error);
  if (error.stack) {
    console.debug('Stack trace:', error.stack);
  }
  console.groupEnd();
}

/**
 * Create a standardized AppError from any error
 */
export function createAppError(error: any, context?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const errorType = detectErrorType(error);
  const message = formatErrorMessage(error, context);
  
  return new AppError(message, errorType, error, context);
}
