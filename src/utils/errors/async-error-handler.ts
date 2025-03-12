import { ErrorType } from './types';
import { createAppError } from './error-factory';
import { formatErrorMessage } from '../errors';

/**
 * Wraps an async function with error handling
 * @param fn The async function to wrap
 * @param errorHandler Optional custom error handler
 * @returns A wrapped function that handles errors
 */
export function withAsyncErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler?: (error: unknown) => void
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Log the error
      console.error('Async operation failed:', error);
      
      // Call custom error handler if provided
      if (errorHandler) {
        errorHandler(error);
      }
      
      // Rethrow as AppError for consistent error handling
      throw createAppError(
        formatErrorMessage(error),
        error,
        { type: detectAsyncErrorType(error) }
      );
    }
  };
}

/**
 * Detect error type from async errors
 */
function detectAsyncErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : '';
  
  if (!navigator.onLine || message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK;
  } else if (message.includes('timeout') || message.includes('timed out')) {
    return ErrorType.TIMEOUT;
  } else if (message.includes('not found') || message.includes('404')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('permission') || message.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  } else if (message.includes('database') || message.includes('sql')) {
    return ErrorType.DATABASE;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Log an async error with context
 */
export const logAsyncError = async (
  error: unknown,
  context: Record<string, any> = {}
): Promise<void> => {
  try {
    // Determine error type
    let errorType: ErrorType = ErrorType.UNKNOWN;
    
    // Add error type detection logic here
    if (typeof error === 'string') {
      // Detect type from message
      if (error.toLowerCase().includes('network')) {
        errorType = ErrorType.NETWORK;
      } else if (error.toLowerCase().includes('timeout')) {
        errorType = ErrorType.TIMEOUT;
      } else if (error.toLowerCase().includes('not found')) {
        errorType = ErrorType.NOT_FOUND;
      } else if (error.toLowerCase().includes('permission')) {
        errorType = ErrorType.PERMISSION;
      }
    } else if (error instanceof Error) {
      // Similar detection from error message
      if (error.message.toLowerCase().includes('network')) {
        errorType = ErrorType.NETWORK;
      } else if (error.message.toLowerCase().includes('timeout')) {
        errorType = ErrorType.TIMEOUT;
      } else if (error.message.toLowerCase().includes('not found')) {
        errorType = ErrorType.NOT_FOUND;
      } else if (error.message.toLowerCase().includes('permission')) {
        errorType = ErrorType.PERMISSION;
      }
    }
    
    // Log error with determined type
    console.error('Async error:', {
      type: errorType,
      message: formatErrorMessage(error),
      context,
      timestamp: new Date().toISOString()
    });
    
    // Here you could send the error to a logging service
    // await reportErrorToService(error, errorType, context);
  } catch (err) {
    console.error('Error in async error handler:', err);
  }
};

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryableErrors?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 5000,
    backoffFactor = 2,
    retryableErrors = () => true
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!retryableErrors(error)) {
        throw createAppError(
          formatErrorMessage(error),
          error,
          { type: detectAsyncErrorType(error) }
        );
      }
      
      // If we've used all retries, throw the error
      if (attempt === maxRetries) {
        throw createAppError(
          `Operation failed after ${maxRetries} retries: ${formatErrorMessage(error)}`,
          error,
          { type: detectAsyncErrorType(error) }
        );
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);
      
      // Add some jitter to prevent all retries happening simultaneously
      const jitter = Math.random() * 100;
      const finalDelay = delay + jitter;
      
      console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) in ${Math.round(finalDelay)}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  // This should never happen due to the throw in the loop
  throw lastError;
}
