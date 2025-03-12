
import { useToast } from "@/hooks/use-toast";
import { AppError, createAppError, handleError, ErrorHandlerOptions } from "@/utils/errors";

/**
 * Hook to provide consistent error handling throughout the application
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  /**
   * Handle any error with consistent UI feedback and logging
   */
  const handleAppError = (error: Error | unknown, options?: ErrorHandlerOptions) => {
    // Convert to AppError and handle centrally
    if (error instanceof Error) {
      handleError(error, toast, options);
    } else {
      handleError(new Error(String(error)), toast, options);
    }
  };

  /**
   * Create an AppError from any error source
   */
  const createError = (error: Error | unknown, context?: string): AppError => {
    if (error instanceof Error) {
      return createAppError(error, context);
    }
    return createAppError(new Error(String(error)), context);
  };

  return {
    handleError: handleAppError,
    createError
  };
};
