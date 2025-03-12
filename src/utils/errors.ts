
import { ErrorType } from "./errors/types";

/**
 * Checks if an error is non-critical (can be safely ignored in the UI)
 */
export function isNonCriticalError(errorOrMessage: unknown): boolean {
  if (!errorOrMessage) return true;
  
  const message = typeof errorOrMessage === 'string' 
    ? errorOrMessage.toLowerCase() 
    : errorOrMessage instanceof Error 
      ? errorOrMessage.message.toLowerCase()
      : '';
  
  // List of patterns that indicate non-critical errors
  const nonCriticalPatterns = [
    'get_nearby_applications',
    'could not find the function',
    'function does not exist',
    'support table',
    'searches',
    'crystal_roof.support_count',
    'classification'
  ];
  
  return nonCriticalPatterns.some(pattern => message.includes(pattern));
}

export { ErrorType };
