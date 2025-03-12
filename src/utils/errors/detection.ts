
import { ErrorType } from './types';

/**
 * Determines if an error is non-critical and can be ignored for user display
 * @param error Error object or message
 * @returns boolean indicating if error is non-critical
 */
export function isNonCriticalError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Infrastructure setup or missing function errors should be ignored
  if (errorMessage.includes('get_nearby_applications') || 
      errorMessage.includes('Could not find the function') ||
      errorMessage.includes('does not exist') ||
      errorMessage.includes('search_applications') ||
      errorMessage.includes('RPC') ||
      errorMessage.includes('supabase_functions')) {
    return true;
  }
  
  return false;
}

/**
 * Detects the type of error based on its message or properties
 * @param error The error object or message
 * @returns The detected error type
 */
export function detectErrorType(error: any): ErrorType {
  const errorMsg = typeof error === 'string' 
    ? error.toLowerCase() 
    : ((error?.message || '').toLowerCase());
  
  // Network errors
  if (!navigator.onLine || 
      errorMsg.includes('network') || 
      errorMsg.includes('fetch') ||
      errorMsg.includes('connection') ||
      error instanceof TypeError) {
    return ErrorType.NETWORK;
  }
  
  // Authentication errors
  if (errorMsg.includes('authentication') ||
      errorMsg.includes('login') ||
      errorMsg.includes('not logged in') ||
      errorMsg.includes('unauthenticated') ||
      errorMsg.includes('auth')) {
    return ErrorType.AUTHENTICATION;
  }
  
  // Authorization errors
  if (errorMsg.includes('authorization') ||
      errorMsg.includes('forbidden') ||
      errorMsg.includes('permission') ||
      errorMsg.includes('not allowed') ||
      errorMsg.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  }
  
  // Timeout errors
  if (errorMsg.includes('timeout') || 
      errorMsg.includes('timed out') ||
      errorMsg.includes('too long') ||
      errorMsg.includes('canceling statement') ||
      errorMsg.includes('57014')) {
    return ErrorType.TIMEOUT;
  }
  
  // Validation errors
  if (errorMsg.includes('validation') ||
      errorMsg.includes('invalid') ||
      errorMsg.includes('not valid') ||
      errorMsg.includes('required')) {
    return ErrorType.VALIDATION;
  }
  
  // Database errors
  if (errorMsg.includes('database') ||
      errorMsg.includes('db error') ||
      errorMsg.includes('sql') ||
      errorMsg.includes('query')) {
    return ErrorType.DATABASE;
  }
  
  // Server errors
  if (errorMsg.includes('server') ||
      errorMsg.includes('500') ||
      errorMsg.includes('internal')) {
    return ErrorType.SERVER;
  }
  
  // Not found errors
  if (errorMsg.includes('not found') || 
      errorMsg.includes('no results') ||
      errorMsg.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  
  // Data errors
  if (errorMsg.includes('data') ||
      errorMsg.includes('parse') ||
      errorMsg.includes('syntax')) {
    return ErrorType.DATA;
  }
  
  return ErrorType.UNKNOWN;
}
