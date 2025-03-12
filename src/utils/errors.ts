
import { ErrorType, AppError, safeStringify, ErrorOptions } from "./errors/types";
import { createAppError } from "./errors/error-factory";

/**
 * Checks if an error is non-critical (can be safely ignored in the UI)
 */
export function isNonCriticalError(errorOrMessage: unknown): boolean {
  if (!errorOrMessage) return true;
  
  const message = typeof errorOrMessage === 'string' 
    ? errorOrMessage.toLowerCase() 
    : errorOrMessage instanceof Error 
      ? errorOrMessage.message.toLowerCase()
      : '';
  
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
  
  // Check if it's a Supabase error with a code
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as any;
    if (supabaseError.code && supabaseError.code.startsWith('PGRST')) {
      return ErrorType.DATABASE;
    }
  }
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error).toLowerCase()
        : '';
  
  if (message.includes('timeout') || message.includes('too long') || message.includes('canceling statement')) {
    return ErrorType.TIMEOUT;
  } else if (message.includes('network') || message.includes('fetch') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('coordinates') || message.includes('location')) {
    return ErrorType.COORDINATES;
  } else if (message.includes('database') || message.includes('sql') || message.includes('function')) {
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
  
  // Specially handle Supabase errors
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && 'message' in error) {
      const supabaseError = error as any;
      let message = supabaseError.message || 'Database error';
      
      // Include hint if available
      if (supabaseError.hint) {
        message = `${message} (${supabaseError.hint})`;
      }
      
      return message;
    }
    
    // For other objects, safely convert to string
    return safeStringify(error);
  }
  
  // Fallback
  return String(error);
}

/**
 * Handle error with optional toast notification
 */
export function handleError(error: unknown, toast?: any): any {
  console.error('Error:', error);
  
  if (toast && !isNonCriticalError(error)) {
    toast({
      title: "Error",
      description: formatErrorMessage(error),
      variant: "destructive",
    });
  }
  
  return {
    message: formatErrorMessage(error),
    type: detectErrorType(error)
  };
}

// Export everything from types as well
export type { AppError, ErrorOptions };
export { ErrorType, createAppError };
