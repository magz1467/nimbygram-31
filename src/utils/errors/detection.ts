
import { ErrorType } from './types';

/**
 * Detect the type of error based on error properties
 */
export function detectErrorType(error: any): ErrorType {
  // Handle null or undefined errors
  if (!error) {
    return ErrorType.UNKNOWN;
  }
  
  // Extract error message for easier checking
  const errorMessage = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message ? error.message.toLowerCase() : '');
  
  // Check for explicit error codes
  const errorCode = error.code || error.status || error.statusCode;
  
  // Timeout errors - check first as they're critical for UX
  if (
    errorCode === 'ETIMEDOUT' ||
    errorCode === '57014' ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('too long') ||
    errorMessage.includes('canceling statement') ||
    error.name === 'TimeoutError'
  ) {
    return ErrorType.TIMEOUT;
  }

  // Network errors
  if (
    error.name === 'NetworkError' ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network request failed') ||
    !navigator.onLine
  ) {
    return ErrorType.NETWORK;
  }

  // Authentication errors
  if (
    errorCode === 401 ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('auth')
  ) {
    return ErrorType.AUTHENTICATION;
  }

  // Authorization errors
  if (
    errorCode === 403 ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('permission')
  ) {
    return ErrorType.AUTHORIZATION;
  }

  // Not found errors
  if (
    errorCode === 404 ||
    errorMessage.includes('not found') ||
    errorMessage.includes('no results') ||
    errorMessage.includes('empty response')
  ) {
    return ErrorType.NOT_FOUND;
  }

  // Validation errors
  if (
    errorCode === 422 ||
    errorMessage.includes('validation') ||
    errorMessage.includes('required field') ||
    errorMessage.includes('invalid')
  ) {
    return ErrorType.VALIDATION;
  }

  // Database errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('sql') ||
    errorMessage.includes('query')
  ) {
    return ErrorType.DATABASE;
  }

  // Server errors
  if (
    (errorCode && errorCode >= 500) ||
    errorMessage.includes('server')
  ) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Check if an error is non-critical (e.g. missing optional functionality)
 */
export function isNonCriticalError(error: any): boolean {
  if (!error) return true;
  
  const errorMessage = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message ? error.message.toLowerCase() : '');
  
  // Infrastructure setup errors
  if (
    errorMessage.includes('support table') ||
    errorMessage.includes('extension') ||
    errorMessage.toLowerCase().includes('function') ||
    errorMessage.includes('not supported')
  ) {
    return true;
  }
  
  // Missing data that's not essential
  if (
    errorMessage.includes('no results') ||
    errorMessage.includes('empty response')
  ) {
    return true;
  }
  
  return false;
}
