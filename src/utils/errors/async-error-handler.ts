
import { AppError, createAppError, detectErrorType } from './index';

/**
 * Wraps an async function with error handling
 * @param asyncFn The async function to wrap
 * @param fallbackValue Value to return if the function fails
 * @param options Additional options
 * @returns A tuple with [data, error]
 */
export async function tryCatch<T>(
  asyncFn: () => Promise<T>,
  fallbackValue: T | null = null,
  options: {
    context?: string;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<[T | null, AppError | null]> {
  // Default options
  const opts = {
    context: 'async operation',
    retry: false,
    maxRetries: 3,
    retryDelay: 1000,
    ...options
  };
  
  let retryCount = 0;
  
  const executeWithRetry = async (): Promise<[T | null, AppError | null]> => {
    try {
      const result = await asyncFn();
      return [result, null];
    } catch (error) {
      // Convert to AppError
      const appError = createAppError(
        error instanceof Error ? error.message : String(error),
        error,
        { 
          type: detectErrorType(error),
          context: { context: opts.context, attempt: retryCount + 1 }
        }
      );
      
      // Determine if we should retry
      const shouldRetry = opts.retry && 
        retryCount < opts.maxRetries && 
        (appError.type === 'network' || appError.type === 'timeout');
      
      if (shouldRetry) {
        retryCount++;
        console.log(`Retrying ${opts.context} (attempt ${retryCount}/${opts.maxRetries})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
        return executeWithRetry();
      }
      
      return [fallbackValue, appError];
    }
  };
  
  return executeWithRetry();
}

/**
 * Wraps multiple async operations and returns the first successful result
 * @param asyncFns Array of async functions to try
 * @param fallbackValue Value to return if all functions fail
 * @param options Additional options
 * @returns A tuple with [data, error]
 */
export async function tryEach<T>(
  asyncFns: Array<() => Promise<T>>,
  fallbackValue: T | null = null,
  options: {
    context?: string;
    continueOnError?: boolean;
  } = {}
): Promise<[T | null, AppError | null]> {
  // Default options
  const opts = {
    context: 'operations',
    continueOnError: true,
    ...options
  };
  
  const errors: AppError[] = [];
  
  for (let i = 0; i < asyncFns.length; i++) {
    try {
      const result = await asyncFns[i]();
      return [result, null];
    } catch (error) {
      const appError = createAppError(
        error instanceof Error ? error.message : String(error),
        error,
        { 
          type: detectErrorType(error),
          context: { context: `${opts.context} (method ${i + 1}/${asyncFns.length})` }
        }
      );
      
      errors.push(appError);
      console.error(`Error in ${opts.context} method ${i + 1}:`, appError.message);
      
      if (!opts.continueOnError) {
        return [fallbackValue, appError];
      }
    }
  }
  
  // If we get here, all methods failed
  const combinedError = createAppError(
    `All ${asyncFns.length} methods failed in ${opts.context}`,
    errors,
    { 
      type: 'unknown',
      context: { context: opts.context, attempts: asyncFns.length, errors }
    }
  );
  
  return [fallbackValue, combinedError];
}
