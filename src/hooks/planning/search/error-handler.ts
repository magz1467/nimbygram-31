
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
  toast: ReturnType<typeof useToast>["toast"],
  retry?: () => void
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
    'search',
    isTimeoutError ? ErrorType.TIMEOUT : undefined
  );
  
  // For timeout errors, provide a more user-friendly message
  if (isTimeoutError && appError.type === ErrorType.TIMEOUT) {
    appError.message = "The search took too long to complete. Please try a more specific location or different filters.";
  }
  
  // Track significant search errors (but not timeouts which are common)
  const shouldTrackToServer = appError.type !== ErrorType.TIMEOUT && appError.type !== ErrorType.NOT_FOUND;
  
  // Use centralized error handler
  handleError(appError, toast, {
    context: 'search',
    retry: retry,
    logToServer: shouldTrackToServer
  });
  
  // Add telemetry for slow searches even when they don't fail completely
  if (isTimeoutError) {
    try {
      console.info('Slow search telemetry:', {
        errorType: 'timeout',
        message: appError.message,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    } catch (e) {
      // Ignore telemetry errors
    }
  }
  
  throw appError; // Re-throw to let the error handling in the component deal with it
}
