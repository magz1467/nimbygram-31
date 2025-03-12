
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { AppError, ErrorType } from './types';

/**
 * Create a standardized error
 */
export function createAppError(error: any, context?: string, errorType?: ErrorType): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const message = error.message || 'An error occurred';
  return new AppError(message, errorType || ErrorType.UNKNOWN, error, context);
}

/**
 * Handle errors in a standardized way
 */
export function handleError(
  error: any, 
  toast: ReturnType<typeof useToast>["toast"],
  options: { context?: string; retry?: () => void; silent?: boolean } = {}
): AppError {
  const { context, retry, silent = false } = options;
  
  // Create standardized app error
  const appError = error instanceof AppError 
    ? error 
    : createAppError(error, context);
  
  // Log to console
  console.error(`Error${context ? ` in ${context}` : ''}:`, appError);
  
  // Show toast notification if not silent
  if (!silent) {
    toast({
      title: context ? `Error in ${context}` : "Error",
      description: appError.message,
      variant: "destructive",
      action: retry ? (
        <ToastAction altText="Retry" onClick={retry}>
          Retry
        </ToastAction>
      ) : undefined
    });
  }
  
  return appError;
}
