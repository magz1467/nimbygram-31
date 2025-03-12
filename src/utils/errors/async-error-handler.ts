
import { ErrorType } from './types';

type TryCatchResult<T, F> = [T, null] | [null, F];

/**
 * A utility function that wraps a promise and returns a tuple with the result or error
 * 
 * @param promise The promise or async function to execute
 * @param fallbackValue The fallback value to return in case of error
 * @param options Additional options
 * @returns A tuple with [result, null] or [null, error]
 */
export async function tryCatch<T, F = Error>(
  promise: Promise<T> | (() => Promise<T>),
  fallbackValue: F | null = null,
  options: {
    context?: string;
    errorTransformer?: (error: any) => F;
  } = {}
): Promise<TryCatchResult<T, F>> {
  try {
    const result = typeof promise === 'function' ? await promise() : await promise;
    return [result, null];
  } catch (error) {
    if (options.context) {
      console.error(`Error in ${options.context}:`, error);
    } else {
      console.error('Error in tryCatch:', error);
    }

    if (options.errorTransformer) {
      return [null, options.errorTransformer(error)];
    }

    return [null, (error instanceof Error ? error : new Error(String(error))) as F];
  }
}

/**
 * A utility function that attempts multiple fallback strategies in order
 * 
 * @param strategies Array of functions to try in sequence
 * @param fallbackValue The value to return if all strategies fail
 * @param options Additional options
 * @returns The result of the first successful strategy or the fallback value
 */
export async function tryEach<T>(
  strategies: Array<() => Promise<T>>,
  fallbackValue: T | null = null,
  options: {
    context?: string;
    stopOnError?: boolean;
  } = {}
): Promise<T | null> {
  const errors: Error[] = [];

  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = await strategies[i]();
      return result;
    } catch (error) {
      const strategyName = `Strategy ${i + 1}`;
      if (options.context) {
        console.error(`Error in ${options.context} (${strategyName}):`, error);
      } else {
        console.error(`Error in tryEach (${strategyName}):`, error);
      }

      errors.push(error instanceof Error ? error : new Error(String(error)));

      if (options.stopOnError) {
        break;
      }
    }
  }

  // Log all collected errors
  if (errors.length > 0) {
    console.error(`All ${errors.length} strategies failed:`, errors);
  }

  return fallbackValue;
}

/**
 * Create a retry wrapper around an async function
 * 
 * @param fn The async function to retry
 * @param options Retry options
 * @returns A function that will retry the original function
 */
export function withRetry<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    context?: string;
    retryIf?: (error: any) => boolean;
  } = {}
): (...args: Args) => Promise<T> {
  const {
    maxRetries = 3,
    delay = 300,
    backoff = true,
    context = 'retry',
    retryIf = () => true,
  } = options;

  return async (...args: Args): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryIf(error)) {
          console.error(`Failed after ${attempt} retries in ${context}:`, error);
          throw error;
        }

        const sleepTime = backoff ? delay * Math.pow(2, attempt) : delay;
        console.warn(`Retry ${attempt + 1}/${maxRetries} in ${context} after ${sleepTime}ms`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
      }
    }

    // This should never happen due to the throw in the catch block
    throw lastError;
  };
}

/**
 * Create an error object with contextual information
 */
export function createError(
  message: string,
  originalError?: any,
  errorType: ErrorType = ErrorType.UNKNOWN
): Error {
  const error = new Error(message);
  
  // Add additional properties
  (error as any).originalError = originalError;
  (error as any).type = errorType;
  
  return error;
}
