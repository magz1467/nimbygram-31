
import { AppError, ErrorType } from './types';

/**
 * Formats an error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Formats an error for logging to console
 */
export function formatErrorForLogging(
  error: unknown, 
  context?: Record<string, any>
): Record<string, any> {
  const baseInfo = {
    timestamp: new Date().toISOString(),
    message: formatErrorMessage(error),
    type: error instanceof AppError ? error.type : 'unknown',
    ...(context || {})
  };
  
  if (error instanceof AppError) {
    return {
      ...baseInfo,
      details: error.details,
      code: error.code,
      context: error.context
    };
  }
  
  if (error instanceof Error) {
    return {
      ...baseInfo,
      name: error.name,
      stack: error.stack
    };
  }
  
  return baseInfo;
}
