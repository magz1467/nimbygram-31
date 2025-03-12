
/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap with a timeout
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Message to use in the timeout error
 * @returns Promise that will reject if the timeout is reached
 */
export const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  // Create a timeout promise that rejects after timeoutMs
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error['type'] = 'TIMEOUT';
      reject(error);
    }, timeoutMs);
  });
  
  // Create a promise that cleans up the timeout regardless of outcome
  const wrappedPromise = promise
    .then(result => {
      clearTimeout(timeoutId);
      return result;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      // Enhance error with more information if it's from Supabase
      if (typeof error === 'object' && error !== null) {
        if ('code' in error) {
          console.error(`Enhanced error details - Code: ${error.code}, Message: ${error.message}`);
          
          // Format Supabase error with full details
          const formattedError = new Error(error.message || 'Unknown database error');
          formattedError['code'] = error.code;
          formattedError['details'] = error.details;
          formattedError['hint'] = error.hint;
          formattedError['originalError'] = error;
          
          throw formattedError;
        }
      }
      throw error;
    });
  
  // Race between the original promise and the timeout
  return Promise.race([wrappedPromise, timeoutPromise]) as Promise<T>;
};
