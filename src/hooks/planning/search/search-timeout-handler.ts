
/**
 * Creates an AbortController with a timeout for search operations
 * @param timeoutMs Timeout in milliseconds
 * @returns AbortController and signal for the search operation
 */
export function createSearchTimeoutController(timeoutMs: number): { 
  controller: AbortController; 
  signal: AbortSignal;
  timeoutId: number;
} {
  const controller = new AbortController();
  const signal = controller.signal;
  
  const timeoutId = window.setTimeout(() => {
    controller.abort(new Error('Search operation timed out'));
  }, timeoutMs);
  
  return { controller, signal, timeoutId };
}

/**
 * Cleans up a search timeout
 */
export function clearSearchTimeout(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}
