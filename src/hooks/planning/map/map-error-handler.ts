
import { useToast } from "@/hooks/use-toast";
import { createAppError, ErrorType, handleError, isNonCriticalError } from "@/utils/errors";

/**
 * Handles map-related errors with appropriate user feedback
 * @param err The error object
 * @param toast Toast function for showing notifications
 * @param retry Optional retry function
 */
export function handleMapError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"],
  retry?: () => void
) {
  // Skip handling for non-critical infrastructure errors
  if (isNonCriticalError(err)) {
    console.log('Non-critical error in map handling:', err);
    return;
  }
  
  // Determine error type
  let errorType = ErrorType.UNKNOWN;
  let errorMessage = err?.message || 'An unknown error occurred';
  
  if (err && typeof err === 'object') {
    if (
      errorMessage.includes('timeout') || 
      errorMessage.includes('too long') ||
      errorMessage.includes('canceling statement') ||
      errorMessage.includes('57014')
    ) {
      errorType = ErrorType.TIMEOUT;
      errorMessage = 'The search took too long to complete. Please try a more specific location or a smaller search radius.';
    } else if (errorMessage.includes('network') || !navigator.onLine) {
      errorType = ErrorType.NETWORK;
      errorMessage = 'A network error occurred. Please check your internet connection and try again.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('no results')) {
      errorType = ErrorType.NOT_FOUND;
      errorMessage = 'No planning applications were found in this area. Try expanding your search radius or searching a different location.';
    }
  }
  
  // Create a proper error object
  const appError = createAppError(
    errorMessage,
    errorType,
    err.stack || 'No stack trace available',
    { context: 'map', originalError: err }
  );
  
  // Use the centralized error handler with our processed error
  handleError(appError, toast, {
    context: 'map',
    retry: retry,
    silent: false
  });
}
