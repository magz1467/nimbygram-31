
/**
 * A utility for retrying async operations with exponential backoff
 */

type RetryOptions = {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
};

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffFactor: 2,
  retryableErrors: () => true, // By default, retry all errors
  onRetry: () => {}
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  
  let lastError: any;
  let attempt = 0;
  
  while (attempt <= config.maxRetries!) {
    try {
      // Attempt operation
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!config.retryableErrors!(error)) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw error;
      }
      
      // Calculate delay for next retry
      const delay = Math.min(
        config.initialDelayMs! * Math.pow(config.backoffFactor!, attempt),
        config.maxDelayMs!
      );
      
      // Call onRetry callback
      config.onRetry!(error, attempt + 1, delay);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increment attempt counter
      attempt++;
    }
  }
  
  // This should never happen, but TypeScript needs it
  throw lastError;
}
