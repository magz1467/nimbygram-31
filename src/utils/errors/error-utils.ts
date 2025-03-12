
import { ErrorType, AppError, safeStringify } from './types';
import { createAppError } from './error-factory';

/**
 * Checks if an error is non-critical (can be safely ignored in the UI)
 */
export function isNonCriticalError(errorOrMessage: unknown): boolean {
  if (!errorOrMessage) return true;
  
  const message = typeof errorOrMessage === 'string' 
    ? errorOrMessage.toLowerCase() 
    : errorOrMessage instanceof Error 
      ? errorOrMessage.message.toLowerCase()
      : safeStringify(errorOrMessage).toLowerCase();
  
  // List of patterns that indicate non-critical errors
  const nonCriticalPatterns = [
    'get_nearby_applications',
    'could not find the function',
    'function does not exist',
    'support table',
    'searches',
    'crystal_roof.support_count'
  ];
  
  return nonCriticalPatterns.some(pattern => message.includes(pattern));
}

/**
 * Detect error type based on error message
 */
export function detectErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : safeStringify(error).toLowerCase();
  
  if (message.includes('timeout') || message.includes('too long') || message.includes('canceling statement')) {
    return ErrorType.TIMEOUT;
  } else if (message.includes('network') || message.includes('fetch') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('coordinates') || message.includes('location')) {
    return ErrorType.COORDINATES;
  } else if (message.includes('database') || message.includes('sql')) {
    return ErrorType.DATABASE;
  } else if (message.includes('permission') || message.includes('access')) {
    return ErrorType.PERMISSION;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  
  // Safely convert objects to strings to avoid [object Object]
  return safeStringify(error);
}

/**
 * Handle error with optional toast notification
 */
export function handleError(
  error: unknown, 
  options: { 
    toast?: any, 
    context?: string, 
    retry?: () => void 
  } = {}
): AppError {
  console.error(`Error${options.context ? ` in ${options.context}` : ''}:`, error);
  
  // Create a standardized AppError
  const appError = createAppError(
    formatErrorMessage(error),
    error,
    {
      type: detectErrorType(error),
      context: options.context ? { context: options.context } : undefined
    }
  );
  
  // Show toast notification if provided and error is critical
  if (options.toast && !isNonCriticalError(error)) {
    options.toast({
      title: "Error",
      description: appError.userMessage || formatErrorMessage(error),
      variant: "destructive",
      action: options.retry ? {
        label: "Retry",
        onClick: options.retry
      } : undefined
    });
  }
  
  return appError;
}
