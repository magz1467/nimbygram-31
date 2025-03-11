
/**
 * Utility functions for fetch operations
 */

/**
 * Adds a timeout to a fetch promise
 * @param promise The fetch promise
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Error message to display on timeout
 * @returns Promise with timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]) as Promise<T>;
};
