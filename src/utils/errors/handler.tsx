import { AppError, ErrorType } from './types';
import { logError } from './formatting';

interface ErrorHandlerOptions {
  context?: string;
  silent?: boolean;
}

/**
 * Create a standardized application error from any error source
 */
export function createAppError(err: any, context?: string): AppError {
  // If it's already an AppError, just return it
  if (err instanceof AppError) {
    return err;
  }
  
  // Create a new AppError with the error message and context
  const appError = new AppError(
    err?.message || 'An unknown error occurred',
    ErrorType.UNKNOWN,
    context
  );
  
  // Keep a reference to the original error
  appError.originalError = err;
  
  // Copy the stack if available
  if (err?.stack) {
    appError.stack = err.stack;
  }
  
  return appError;
}

/**
 * Centralized error handler for consistent error handling
 */
export function handleError(
  error: Error | AppError, 
  toast: any,
  options: ErrorHandlerOptions = {}
): void {
  // Log the error with detailed information
  logError(error, options.context);
  
  // Skip toast notification if silent is true
  if (options.silent) {
    return;
  }
  
  // Convert to AppError if needed
  const appError = error instanceof AppError 
    ? error 
    : createAppError(error, options.context);
  
  // Show toast notification with appropriate styling based on error type
  toast({
    title: getErrorTitle(appError),
    description: appError.message,
    variant: "destructive",
  });
}

/**
 * Get a user-friendly error title based on error type
 */
function getErrorTitle(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.TIMEOUT:
      return 'Request Timeout';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.DATABASE:
      return 'Database Error';
    case ErrorType.PERMISSION:
      return 'Permission Denied';
    case ErrorType.VALIDATION:
      return 'Invalid Input';
    default:
      return 'Error';
  }
}
