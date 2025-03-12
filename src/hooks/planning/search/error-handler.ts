
import { useToast } from "@/hooks/use-toast";
import { AppError, ErrorType, createAppError, handleError, isNonCriticalError } from "@/utils/errors";

/**
 * Handles search errors by determining error type and displaying appropriate messages
 * With enhanced error handling for better user experience
 * 
 * @param err The error object
 * @param toast Toast function for showing notifications
 * @returns Empty array for non-critical errors or throws the error
 */
export function handleSearchError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"]
) {
  console.group('🚨 Search Error Handler');
  console.log('Original error:', err);
  console.log('Error type:', err?.constructor?.name);
  console.log('Error message:', err?.message);
  
  // Log stack trace for debugging
  if (err?.stack) {
    console.log('Error stack:', err.stack);
  }
  
  // Don't treat missing support table or functions as real errors
  if (isNonCriticalError(err)) {
    console.log('Classified as non-critical infrastructure error');
    console.groupEnd();
    return [];
  }
  
  // Create a base error object
  const appError = createAppError(err, 'search');
  console.log('Created AppError:', appError);
  
  // Detect common error patterns
  let errorType = ErrorType.UNKNOWN;
  
  // Check for timeout errors (most common issue)
  const isTimeoutError = 
    (err.code === '57014') || 
    (err.message && (
      err.message.toLowerCase().includes('timeout') ||
      err.message.toLowerCase().includes('timed out') ||
      err.message.toLowerCase().includes('too long') ||
      err.message.toLowerCase().includes('canceling statement')
    ));
  
  // Check for network-related errors
  const isNetworkError =
    err.message && (
      err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('fetch') ||
      err.message.toLowerCase().includes('connect')
    ) || !navigator.onLine;
  
  // Check for location-specific errors
  const isLocationError =
    err.message && (
      err.message.toLowerCase().includes('location') ||
      err.message.toLowerCase().includes('coordinates') ||
      err.message.toLowerCase().includes('geocod')
    );
  
  console.log({
    isTimeoutError,
    isNetworkError,
    isLocationError
  });
  
  // Set appropriate error type and user-friendly message
  if (isTimeoutError) {
    console.log('Handling as timeout error');
    errorType = ErrorType.TIMEOUT;
    appError.message = "The search took too long to complete. Please try a more specific location or different filters.";
  } else if (isNetworkError) {
    console.log('Handling as network error');
    errorType = ErrorType.NETWORK;
    appError.message = "We're having trouble connecting to our servers. Please check your internet connection and try again.";
  } else if (isLocationError) {
    console.log('Handling as location error');
    errorType = ErrorType.NOT_FOUND;
    appError.message = "We couldn't find that location. Please try a different postcode or place name.";
  }
  
  // Set the error type
  appError.type = errorType;
  
  // Use centralized error handler to show toast
  handleError(appError, toast, {
    context: 'search'
  });
  
  // Return empty array for common errors instead of throwing
  // This prevents unnecessary retries and improves user experience
  if (isTimeoutError || isNetworkError || isLocationError) {
    console.log('Returning empty array for handled error instead of throwing');
    console.groupEnd();
    return [];
  }
  
  console.log('Re-throwing error for regular error handling');
  console.groupEnd();
  throw appError; // Re-throw other errors to let the error handling in the component deal with it
}
