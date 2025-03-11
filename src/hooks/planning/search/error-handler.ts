
import { useToast } from "@/hooks/use-toast";
import { AppError, ErrorType, createAppError, handleError, isNonCriticalError } from "@/utils/errors";

/**
 * Handles search errors by determining error type and displaying appropriate messages
 * @param err The error object
 * @param toast Toast function for showing notifications
 * @param retry Optional retry function
 * @returns Empty array for non-critical errors or throws the error
 */
export function handleSearchError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"]
) {
  // Don't treat missing support table or functions as real errors
  if (isNonCriticalError(err)) {
    console.log('Non-critical error in search:', err);
    return [];
  }
  
  // Detect if this is a timeout error
  const isTimeoutError = 
    (err.code === '57014') || 
    (err.message && (
      err.message.includes('timeout') ||
      err.message.includes('timed out') ||
      err.message.includes('canceling statement') ||
      err.message.toLowerCase().includes('too long')
    ));
  
  // Get the properly formatted app error
  const appError = createAppError(
    err, 
    'search'
  );
  
  // For timeout errors, provide a more user-friendly message
  if (isTimeoutError) {
    appError.message = "The search took too long to complete. Please try a more specific location or different filters.";
    // Set the error type to TIMEOUT
    appError.type = ErrorType.TIMEOUT;
  }
  
  // Use centralized error handler
  handleError(appError, toast, {
    context: 'search'
  });
  
  throw appError; // Re-throw to let the error handling in the component deal with it
}
