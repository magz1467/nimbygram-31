
/**
 * Utility function to add timeout to any promise
 */
export const withTimeout = <T>(promise: Promise<T> | any, timeoutMs: number, errorMessage?: string): Promise<T> => {
  // Ensure the input is a proper promise
  const promiseToUse = 
    typeof promise.then === 'function' ? promise : 
    (typeof promise === 'function' ? promise() : Promise.resolve(promise));
  
  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  // Race the promises
  return Promise.race([
    promiseToUse,
    timeoutPromise
  ]) as Promise<T>;
};

/**
 * Function that retries a promise multiple times
 */
export const withRetry = async <T>(
  promiseFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: number = 2
): Promise<T> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await promiseFn();
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        // Fix: Don't call the Number object directly, use the primitive number type
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(backoff, retries)));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Max retries reached`);
};

/**
 * Delays execution for specified milliseconds
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
