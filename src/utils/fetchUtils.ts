
/**
 * Helper function to implement timeout for promises
 * Works with Supabase query builders by ensuring they are converted to promises
 */
export const withTimeout = async <T>(
  promiseOrBuilder: Promise<T> | { then: (onfulfilled: any) => any },
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> => {
  // Ensure we're working with a proper promise
  // This handles both regular promises and Supabase query builders
  const promise = Promise.resolve(promiseOrBuilder);
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};
