
import { useToast } from "@/hooks/use-toast";
import { createAppError, ErrorType, handleError, isNonCriticalError } from "@/utils/errors";

/**
 * Handles search errors by determining error type and displaying appropriate messages
 * @param err The error object
 * @param toast Toast function for showing notifications
 * @param retry Optional retry function
 * @returns Empty array for non-critical errors or throws the error
 */
export function handleSearchError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"],
  retry?: () => void
) {
  // Don't treat missing support table or functions as real errors
  if (isNonCriticalError(err)) {
    console.log('Non-critical error in search:', err);
    return [];
  }
  
  // Get the properly formatted app error
  const appError = createAppError(err, 'search');
  
  // Use centralized error handler
  handleError(appError, toast, {
    context: 'search',
    retry: retry
  });
  
  throw appError; // Re-throw to let the error handling in the component deal with it
}
