
import { ErrorType, safeStringify } from "./errors/types";

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
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : '';
  
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

export type ErrorOptions = {
  showToast?: boolean;
  critical?: boolean;
};

export type AppError = {
  message: string;
  type: ErrorType;
};

export { ErrorType };
