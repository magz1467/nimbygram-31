
/**
 * Environment detection utilities
 */

/**
 * Checks if the current hostname is a production domain
 * @returns boolean indicating if this is a production domain
 */
export const isProdDomain = (): boolean => {
  const hostname = window.location.hostname || '';
  return hostname.includes('nimbygram.com') || 
         hostname.includes('www.nimbygram.com') ||
         // For local development testing of production mode
         hostname.includes('localhost');
};

/**
 * Returns the current hostname or empty string if not available
 * (useful for debugging)
 */
export const getCurrentHostname = (): string => {
  return typeof window !== 'undefined' ? window.location.hostname || '' : '';
};
