
/**
 * Utility functions for error formatting and logging
 */

/**
 * Format and log errors with detailed information
 */
export function logError(error: any, context?: string): void {
  console.error(`Error in ${context || 'application'}:`, error);
  
  if (error?.stack) {
    console.error('Stack trace:', error.stack);
  }
  
  // Log extra attributes for AppErrors
  if (error?.type) {
    console.log('Error type:', error.type);
  }
  
  if (error?.originalError) {
    console.log('Original error:', error.originalError);
  }
}

/**
 * Format an error message for display based on context
 */
export function formatErrorMessage(error: Error, friendlyMessage?: string): string {
  if (friendlyMessage) {
    return friendlyMessage;
  }
  
  const message = error.message || 'An unexpected error occurred';
  
  // Don't expose internal error details to users in production
  if (process.env.NODE_ENV === 'production') {
    return message.includes('Error:') 
      ? message
      : `Error: ${message}`;
  }
  
  // In development, show more details
  return `${error.name}: ${message}`;
}
