
import { ErrorType } from "./types";

/**
 * Detects the type of error based on message and properties
 */
export function detectErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : '';
  
  // Network errors
  if (message.includes('network') || message.includes('connection') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out') || 
      message.includes('too long') || message.includes('canceling statement')) {
    return ErrorType.TIMEOUT;
  }
  
  // Not found errors
  if (message.includes('not found') || message.includes('no results') || 
      message.includes('404') || message.includes('does not exist')) {
    return ErrorType.NOT_FOUND;
  }
  
  // Server errors
  if (message.includes('server error') || message.includes('500')) {
    return ErrorType.SERVER;
  }
  
  // Authentication/Authorization errors
  if (message.includes('unauthorized') || message.includes('not authorized') || 
      message.includes('permission denied') || message.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  // Authentication errors
  if (message.includes('authentication') || message.includes('unauthenticated') || 
      message.includes('login') || message.includes('credentials')) {
    return ErrorType.AUTHENTICATION;
  }
  
  // Database errors
  if (message.includes('database') || message.includes('sql') || 
      message.includes('query') || message.includes('db error')) {
    return ErrorType.DATABASE;
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('required') || message.includes('must be')) {
    return ErrorType.VALIDATION;
  }
  
  // Spatial search errors
  if (message.includes('spatial') || message.includes('coordinates') || 
      message.includes('location') || message.includes('geography')) {
    return ErrorType.SPATIAL;
  }
  
  // Default to unknown
  return ErrorType.UNKNOWN;
}
