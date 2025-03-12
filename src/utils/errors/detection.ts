
import { AppError, ErrorType } from './types';

/**
 * Automatically detect the type of error based on message and properties
 */
export function detectErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Extract message for easier pattern matching
  const message = error.message?.toLowerCase() || '';
  
  // Check for network-related errors
  if (
    message.includes('network') || 
    message.includes('fetch') ||
    message.includes('internet') ||
    message.includes('offline') ||
    !navigator.onLine
  ) {
    return ErrorType.NETWORK;
  }
  
  // Check for timeout errors
  if (
    error.code === '57014' || // PostgreSQL statement_timeout
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('too long')
  ) {
    return ErrorType.TIMEOUT;
  }
  
  // Check for not found errors
  if (
    message.includes('not found') ||
    message.includes('does not exist') ||
    message.includes('404') ||
    error.status === 404
  ) {
    return ErrorType.NOT_FOUND;
  }
  
  // Check for authentication errors
  if (
    message.includes('login') ||
    message.includes('authentication') ||
    message.includes('unauthenticated') ||
    message.includes('401') ||
    error.status === 401
  ) {
    return ErrorType.AUTHENTICATION;
  }
  
  // Check for permission/authorization errors
  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('403') ||
    error.status === 403
  ) {
    return ErrorType.PERMISSION;
  }
  
  // Check for validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required field') ||
    message.includes('constraint') ||
    error.status === 400
  ) {
    return ErrorType.VALIDATION;
  }
  
  // Check for database errors
  if (
    message.includes('database') ||
    message.includes('db error') ||
    message.includes('sql') ||
    (error.code && error.code.startsWith('22')) ||
    (error.code && error.code.startsWith('23'))
  ) {
    return ErrorType.DATABASE;
  }
  
  // Check for server errors
  if (
    message.includes('server') ||
    message.includes('5xx') ||
    error.status >= 500
  ) {
    return ErrorType.SERVER;
  }
  
  // Default to unknown
  return ErrorType.UNKNOWN;
}
