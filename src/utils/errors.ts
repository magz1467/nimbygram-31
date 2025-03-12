
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
  
  // Handle various error types and formats
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error.toLowerCase();
  } else if (error instanceof Error) {
    errorMessage = error.message.toLowerCase();
    
    // Check for AbortError which indicates timeout
    if (error.name === 'AbortError') {
      return ErrorType.TIMEOUT;
    }
  } else if (error && typeof error === 'object') {
    // Try to extract message from error object
    if ('message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message.toLowerCase();
    } else if ('error' in error && typeof (error as any).error === 'string') {
      errorMessage = (error as any).error.toLowerCase();
    } else {
      // Try to stringify the object if it doesn't have a message property
      try {
        errorMessage = JSON.stringify(error).toLowerCase();
      } catch (e) {
        // If we can't stringify it, we'll fall back to the unknown type
      }
    }
  }
  
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('too long') || 
      errorMessage.includes('canceling statement') ||
      errorMessage.includes('abort')) {
    return ErrorType.TIMEOUT;
  } else if (errorMessage.includes('network') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (errorMessage.includes('not found') || errorMessage.includes('no results')) {
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
    if ('message' in error && typeof (error as any).message === 'string') {
      const message = (error as any).message;
      if (message.includes('statement timeout')) {
        return 'The search took too long. Please try a smaller area or add filters.';
      }
      return message;
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
    
    // Try to stringify the object if we can't extract a message
    try {
      return JSON.stringify(error);
    } catch (e) {
      return 'An unexpected error occurred';
    }
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'The search request timed out. Please try a more specific location or different filters.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Detect timeout errors specifically
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error) return false;
  
  // Check for AbortError which indicates timeout
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as any).message).toLowerCase()
        : '';
      
  return message.includes('timeout') || 
         message.includes('too long') || 
         message.includes('canceling statement') ||
         message.includes('abort');
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
