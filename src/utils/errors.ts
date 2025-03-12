
import { ErrorType } from "./errors/types";

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
  } else if (message.includes('network') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
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
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handle error with optional toast notification
 */
export function handleError(error: unknown, toast?: any, options?: any): any {
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
