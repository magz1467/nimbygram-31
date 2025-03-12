
// Re-export types
export type { AppError, ErrorOptions } from './types';

// Re-export enums
export { ErrorType } from './types';

// Re-export functions
export { createAppError } from './error-factory';
export { isNonCriticalError, detectErrorType } from './detection';
export { formatErrorForUser, getUserFriendlyMessage } from './formatting';
export { handleError } from './handler';

/**
 * For backward compatibility
 * Determines if an error is non-critical and should be ignored in UI
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
