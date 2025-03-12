
import { toast } from "@/hooks/use-toast";
import { ErrorType, AppError, ErrorHandlerOptions } from "./types";
import { detectErrorType } from "./detection";

/**
 * Centralized error handling function for consistent error management
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): { message: string; type: ErrorType } {
  const { showToast = true, critical = true } = options;
  const timestamp = new Date().toISOString();
  
  // Convert to AppError if not already
  const appError = error instanceof AppError 
    ? error 
    : new AppError(error instanceof Error ? error.message : String(error), {
        type: detectErrorType(error),
        context: options.context
      });
  
  // Log error with context
  console.error(`Error [${timestamp}]:`, appError);
  
  // Show toast for critical errors that should interrupt the user
  if (showToast && critical) {
    toast({
      title: appError.type === ErrorType.TIMEOUT ? "Search Timeout" : "Error",
      description: appError.message,
      variant: "destructive",
    });
  }
  
  return {
    message: appError.message,
    type: appError.type
  };
}
