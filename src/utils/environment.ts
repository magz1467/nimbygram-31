
/**
 * Environment detection utilities
 * Provides consistent functions for working with environment information
 */

/**
 * Returns the current hostname, safely handling server-side rendering
 * @returns Current hostname or 'server' if not in browser
 */
export const getCurrentHostname = (): string => {
  if (typeof window === 'undefined') return 'server';
  return window.location.hostname;
};

/**
 * Checks if the current hostname is a production domain
 * @returns Boolean indicating if this is a production domain
 */
export const isProdDomain = (): boolean => {
  const hostname = getCurrentHostname();
  return hostname.includes('nimbygram.com');
};

/**
 * Checks if the current environment is development
 * @returns Boolean indicating if this is a development environment
 */
export const isDevEnvironment = (): boolean => {
  const hostname = getCurrentHostname();
  return hostname === 'localhost' || 
         hostname.includes('127.0.0.1') || 
         hostname.includes('sandbox') || 
         hostname.includes('lovable') ||
         hostname === 'server';
};

/**
 * Gets the environment name as a string
 * @returns Environment name: 'production', 'development', or 'unknown'
 */
export const getEnvironmentName = (): string => {
  if (isProdDomain()) return 'production';
  if (isDevEnvironment()) return 'development';
  return 'unknown';
};

/**
 * Checks if the current environment is a sandbox or preview environment
 * @returns Boolean indicating if this is a sandbox environment
 */
export const isSandboxEnvironment = (): boolean => {
  const hostname = getCurrentHostname();
  return hostname === 'server' || 
         hostname.includes('sandbox') || 
         hostname.includes('lovable');
};
