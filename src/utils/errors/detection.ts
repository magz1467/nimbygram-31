
import { ErrorType } from './types';

/**
 * Detect the type of error based on error properties
 */
export function detectErrorType(error: any): ErrorType {
  // Network errors
  if (
    error.name === 'NetworkError' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('Network request failed') ||
    !navigator.onLine
  ) {
    return ErrorType.NETWORK;
  }

  // Authentication errors
  if (
    error.status === 401 ||
    error.statusCode === 401 ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('authentication') ||
    error.message?.includes('auth')
  ) {
    return ErrorType.AUTHENTICATION;
  }

  // Authorization errors
  if (
    error.status === 403 ||
    error.statusCode === 403 ||
    error.message?.includes('forbidden') ||
    error.message?.includes('permission')
  ) {
    return ErrorType.AUTHORIZATION;
  }

  // Not found errors
  if (
    error.status === 404 ||
    error.statusCode === 404 ||
    error.message?.includes('not found')
  ) {
    return ErrorType.NOT_FOUND;
  }

  // Validation errors
  if (
    error.status === 422 ||
    error.statusCode === 422 ||
    error.message?.includes('validation') ||
    error.message?.includes('required field') ||
    error.message?.includes('invalid')
  ) {
    return ErrorType.VALIDATION;
  }

  // Timeout errors
  if (
    error.name === 'TimeoutError' ||
    error.message?.includes('timeout') ||
    error.code === 'ETIMEDOUT'
  ) {
    return ErrorType.TIMEOUT;
  }

  // Database errors
  if (
    error.message?.includes('database') ||
    error.message?.includes('sql') ||
    error.message?.includes('query')
  ) {
    return ErrorType.DATABASE;
  }

  // Server errors
  if (
    (error.status && error.status >= 500) ||
    (error.statusCode && error.statusCode >= 500) ||
    error.message?.includes('server')
  ) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Check if an error is non-critical (e.g. missing optional functionality)
 */
export function isNonCriticalError(error: any): boolean {
  // Infrastructure setup errors
  if (
    error.message?.includes('support table') ||
    error.message?.includes('extension') ||
    error.message?.toLowerCase().includes('function') ||
    error.message?.includes('not supported')
  ) {
    return true;
  }
  
  // Missing data that's not essential
  if (
    error.message?.includes('no results') ||
    error.message?.includes('empty response')
  ) {
    return true;
  }
  
  return false;
}
