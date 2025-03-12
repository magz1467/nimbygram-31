import { ErrorType, AppError } from './types';

/**
 * Formats an error for display to the user
 * @param error The error object to format
 * @returns A user-friendly error message
 */
export function formatErrorForUser(error: any): string {
  // If it's already an AppError, use its userMessage property
  if (error && typeof error === 'object' && 'userMessage' in error) {
    return error.userMessage || getUserFriendlyMessage(error.type || ErrorType.UNKNOWN);
  }
  
  // Otherwise, determine error type and get a message
  const errorType = getErrorType(error);
  return getUserFriendlyMessage(errorType, error?.message);
}

/**
 * Gets a user-friendly error message based on error type
 * @param type The type of error
 * @param originalMessage The original error message (optional)
 * @returns A user-friendly error message
 */
export function getUserFriendlyMessage(type: ErrorType, originalMessage?: string): string {
  switch (type) {
    case ErrorType.NETWORK:
      return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    case ErrorType.TIMEOUT:
      return "The search took too long to complete. Please try a more specific location or different filters.";
    case ErrorType.NOT_FOUND:
      return "We couldn't find any planning applications matching your search criteria.";
    case ErrorType.PERMISSION:
      return "You don't have permission to access this information. Please log in or contact support if you believe this is a mistake.";
    case ErrorType.DATA:
      return "We encountered an issue with the data. Please try again or contact support if the issue persists.";
    default:
      return originalMessage || "We encountered an unexpected issue. Please try again later.";
  }
}

/**
 * Gets the type of an error
 * @param error The error object
 * @returns The error type
 */
export function getErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  // If it's already an AppError, use its type
  if (typeof error === 'object' && 'type' in error) {
    return error.type;
  }
  
  // Default to unknown
  return ErrorType.UNKNOWN;
}
