
import { useToast } from "@/hooks/use-toast";
import { AppError, ErrorType, createAppError, handleError } from "@/utils/errors";

/**
 * Handles map-related errors with appropriate user feedback
 * @param err The error object
 * @param toast Toast function for showing notifications
 */
export function handleMapError(
  err: any, 
  toast: ReturnType<typeof useToast>["toast"]
) {
  console.error('Map Error:', err);
  
  // Create an app error
  const appError = createAppError(err, 'map');
  
  // Check for specific map-related errors
  if (err.message && err.message.toLowerCase().includes('coordinates')) {
    appError.type = ErrorType.VALIDATION;
    appError.message = "Invalid coordinates. Please try a different location.";
  }
  
  // Handle the error with the central handler
  handleError(appError, toast, {
    context: 'map'
  });
}
