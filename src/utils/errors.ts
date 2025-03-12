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
  
  // Handle Supabase error objects
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      if (error.message.includes('statement timeout')) {
        return 'The search took too long. Please try a smaller area or add filters.';
      }
      return error.message;
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Detect timeout errors specifically
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error) return false;
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : '';
      
  return message.includes('timeout') || 
         message.includes('too long') || 
         message.includes('canceling statement');
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
