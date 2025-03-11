
import { useToast } from "@/hooks/use-toast";
import { AppError, ErrorType, createAppError, handleError, isNonCriticalError } from "@/utils/errors";

/**
 * Handles search errors by determining error type and displaying appropriate messages
 * With enhanced error logging for better debugging
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
  
  // Detect if this is a timeout error
  const isTimeoutError = 
    (err.code === '57014') || 
    (err.message && (
      err.message.includes('timeout') ||
      err.message.includes('timed out') ||
      err.message.includes('canceling statement') ||
      err.message.toLowerCase().includes('too long')
    ));
  
  console.log('Is timeout error:', isTimeoutError);
  
  // For timeout errors, provide a more user-friendly message
  if (isTimeoutError) {
    console.log('Handling as timeout error');
    appError.message = "The search took too long to complete. Please try a more specific location or different filters.";
    appError.type = ErrorType.TIMEOUT;
  }
  
  // Use centralized error handler
  handleError(appError, toast, {
    context: 'search'
  });
  
  // Return empty array instead of throwing to avoid React Query retries for timeout errors
  if (isTimeoutError) {
    console.log('Returning empty array for timeout error instead of throwing');
    console.groupEnd();
    return [];
  }
  
  console.log('Re-throwing error for regular error handling');
  console.groupEnd();
  throw appError; // Re-throw other errors to let the error handling in the component deal with it
}
