
import { toast } from "@/components/ui/use-toast";
import { ErrorType, AppError } from './types';
import { formatErrorForUser, getErrorType } from './formatting';

/**
 * Handles an error by showing a toast notification and optionally logging
 * @param error The error to handle
 * @param options Options for handling the error
 */
export function handleError(error: any, options: {
  showToast?: boolean;
  logToConsole?: boolean;
  title?: string;
  callback?: (error: any) => void;
} = {}): void {
  const {
    showToast = true,
    logToConsole = true,
    title = "Error",
    callback
  } = options;
  
  // Default to unknown if no error
  if (!error) return;
  
  // Log to console if requested
  if (logToConsole) {
    console.error('Application error:', error);
  }
  
  // Show toast if requested
  if (showToast) {
    const errorType = getErrorType(error);
    const message = formatErrorForUser(error);
    
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  }
  
  // Call callback if provided
  if (callback) {
    callback(error);
  }
}
