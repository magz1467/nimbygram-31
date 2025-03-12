
import { ErrorType, AppError, AppErrorOptions, ErrorHandlerOptions } from './types';
import { detectErrorType } from './detection';
import { formatErrorMessage } from './formatting';
import { toast } from 'sonner';

/**
 * Centralized error handler for the application
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const { 
    context = 'application', 
    silent = false,
    logToConsole = true,
    showToast = !silent
  } = options;
  
  // Detect error type
  const errorType = 
    (error as AppError)?.type || 
    (typeof error === 'object' && error !== null && 'type' in error ? 
      (error as any).type : 
      detectErrorType(error));
  
  // Format error message
  const errorMessage = formatErrorMessage(error);
  
  // Log error to console
  if (logToConsole) {
    console.error(`[${context}] ${errorType}:`, error);
  }
  
  // Show toast for non-silent errors
  if (showToast) {
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
