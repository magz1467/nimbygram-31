
import { ErrorType, AppError, createAppError } from './index';

/**
 * Generic try-catch helper that wraps async operations 
 * and handles errors consistently
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  options: {
    type?: ErrorType,
    context?: Record<string, any>,
    onError?: (error: AppError) => void
  } = {}
): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    const appError = createAppError(
      errorMessage,
      err,
      {
        type: options.type || ErrorType.UNKNOWN,
        context: options.context
      }
    );
    
    if (options.onError) {
      options.onError(appError);
    }
    
    throw appError;
  }
}

/**
 * Attempts multiple strategies in sequence until one succeeds
 * Useful for implementing fallbacks
 */
export async function tryEach<T>(
  strategies: Array<() => Promise<T>>,
  errorMessage: string,
  options: {
    type?: ErrorType,
    context?: Record<string, any>,
    onError?: (error: AppError, strategyIndex: number) => void
  } = {}
): Promise<T> {
  let lastError: any = null;
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      return await strategies[i]();
    } catch (err) {
      lastError = err;
      
      if (options.onError) {
        const appError = err instanceof Error 
          ? createAppError(err.message, err, { type: options.type, context: options.context })
          : createAppError(errorMessage, err, { type: options.type, context: options.context });
        
        options.onError(appError, i);
      }
      
      // Continue to next strategy
    }
  }
  
  // If we get here, all strategies failed
  throw createAppError(
    errorMessage,
    lastError,
    { 
      type: options.type || ErrorType.UNKNOWN,
      context: { ...options.context, allStrategiesFailed: true }
    }
  );
}

/**
 * Retry an operation multiple times with configurable backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number,
    retryDelay?: number,
    backoffFactor?: number,
    retryableErrors?: Array<ErrorType | string>,
    onRetry?: (error: any, attempt: number) => void,
    errorMessage?: string
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffFactor = 2,
    retryableErrors = [ErrorType.NETWORK, ErrorType.TIMEOUT],
    onRetry,
    errorMessage = "Operation failed after multiple attempts"
  } = options;
  
  let attempt = 0;
  let delay = retryDelay;
  
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      
      // Check if we've hit max retries
      if (attempt > maxRetries) {
        throw createAppError(
          errorMessage,
          err,
          { context: { maxRetries, attempts: attempt } }
        );
      }
      
      // Check if this error type is retryable
      const errorType = getErrorTypeFromError(err);
      const isRetryable = retryableErrors.includes(errorType) || 
                          retryableErrors.some(e => err instanceof Error && err.message.includes(String(e)));
      
      if (!isRetryable) {
        throw err; // Don't retry non-retryable errors
      }
      
      // Notify about retry if callback provided
      if (onRetry) {
        onRetry(err, attempt);
      }
      
      // Wait before next attempt with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }
  
  // This should never be reached due to the throw inside the loop
  throw createAppError(
    errorMessage,
    null,
    { type: ErrorType.UNKNOWN }
  );
}

// Helper to extract error type from various error objects
function getErrorTypeFromError(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  // If it's an AppError, use its type
  if (error.type && Object.values(ErrorType).includes(error.type)) {
    return error.type as ErrorType;
  }
  
  // Try to detect error type from message
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || !navigator.onLine) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('timeout') || message.includes('too long')) {
      return ErrorType.TIMEOUT;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }
    
    if (message.includes('permission') || message.includes('unauthorized') || 
        message.includes('forbidden') || message.includes('401') || message.includes('403')) {
      return ErrorType.PERMISSION;
    }
  }
  
  return ErrorType.UNKNOWN;
}
