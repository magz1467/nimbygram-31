
import { ErrorType } from './types';

/**
 * Determine error type based on the error message or properties
 */
export function detectErrorType(error: any): ErrorType {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toString()?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || 
      code.includes('network') || code === 'err_network' || message.includes('offline')) {
    return ErrorType.NETWORK;
  }

  if (message.includes('timeout') || code.includes('timeout') || code === '57014') {
    return ErrorType.TIMEOUT;
  }

  if (message.includes('authentication') || message.includes('login') || 
      message.includes('signin') || message.includes('auth') || 
      code === '401' || code === 'auth/unauthorized') {
    return ErrorType.AUTHENTICATION;
  }

  if (message.includes('permission') || message.includes('forbidden') || 
      message.includes('not allowed') || code === '403') {
    return ErrorType.AUTHORIZATION;
  }

  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('required field') || message.includes('constraint')) {
    return ErrorType.VALIDATION;
  }

  if (message.includes('not found') || code === '404') {
    return ErrorType.NOT_FOUND;
  }

  if (message.includes('database') || message.includes('sql') || 
      message.includes('db error') || message.includes('relation')) {
    return ErrorType.DATABASE;
  }

  if (message.includes('server') || code === '500') {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Determine if an error is a non-critical infrastructure issue
 * (like missing tables during development)
 */
export function isNonCriticalError(error: any): boolean {
  if (!error) return false;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message || String(error)).toLowerCase();
  
  return (
    // Development infrastructure errors
    (message.includes('relation') && message.includes('does not exist')) ||
    message.includes('support table') ||
    message.includes('function not available') ||
    // Feature flags/missing features
    message.includes('feature disabled') ||
    message.includes('not implemented')
  );
}
