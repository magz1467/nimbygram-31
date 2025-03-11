
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { AppError, ErrorOptions, ErrorType } from './types';
import { detectErrorType } from './detection';
import { formatErrorMessage, logError, createAppError } from './formatting';

/**
 * Handle errors in a standardized way across the application
 */
export function handleError(
  error: any, 
  toast: ReturnType<typeof useToast>["toast"],
  options: ErrorOptions = {}
): AppError {
  const { type, context, retry, silent = false, logToServer = false } = options;
  
  // Create standardized app error
  const appError = error instanceof AppError 
    ? error 
    : new AppError(
        formatErrorMessage(error, context), 
        type || detectErrorType(error), 
        error, 
        context
      );
  
  // Always log to console
  logError(appError, context);
  
  // Show toast notification if not silent
  if (!silent) {
    toast({
      title: context ? `Error in ${context}` : "Error",
      description: appError.message,
      variant: "destructive",
      action: retry ? 
        React.createElement(ToastAction, {
          onClick: retry,
          children: "Retry"
        }) : undefined
    });
  }
  
  // Log to server for important errors (could implement actual server logging here)
  if (logToServer) {
    console.info('Would log to server:', { error: appError, context });
    // Implementation for server logging would go here
  }
  
  return appError;
}
