
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
  if (err && typeof err === 'object' && err.message) {
    if (
      err.message.includes('timeout') || 
      err.message.includes('too long') ||
      err.message.includes('canceling statement')
    ) {
      errorType = ErrorType.TIMEOUT;
    } else if (err.message.includes('network') || !navigator.onLine) {
      errorType = ErrorType.NETWORK;
    } else if (err.message.includes('not found') || err.message.includes('no results')) {
      errorType = ErrorType.NOT_FOUND;
    }
  }
  
  // Use the centralized error handler
  handleError(err, toast, {
    context: 'map',
    retry: retry,
    silent: false
  });
}
