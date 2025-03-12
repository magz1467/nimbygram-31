
import { ErrorType, AppError, AppErrorOptions } from './types';
import { detectErrorType } from './detection';
import { formatErrorMessage } from './formatting';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  context?: string;
  silent?: boolean;
}

/**
 * Centralized error handler for the application
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const { context = 'application', silent = false } = options;
  
  // Detect error type
  const errorType = 
    (error as AppError)?.type || 
    (typeof error === 'object' && error !== null && 'type' in error ? 
      (error as any).type : 
      detectErrorType(error));
  
  // Format error message
  const errorMessage = formatErrorMessage(error);
  
  // Log error to console
  console.error(`[${context}] ${errorType}:`, error);
  
  // Show toast for non-silent errors
  if (!silent) {
    toast.error(errorMessage, {
      description: `Error type: ${errorType}`,
      duration: 5000,
    });
  }
  
  return {
    type: errorType,
    message: errorMessage,
    error
  };
}
