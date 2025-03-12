
import { toast } from "@/hooks/use-toast";
import { 
  ErrorType, 
  isNonCriticalError, 
  formatErrorMessage, 
  detectErrorType 
} from "@/utils/errors";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  performanceData?: Record<string, any>;
}

/**
 * Centralized error handling function for consistent error management
 */
export function handleError(
  error: unknown,
  source: string = 'unknown',
  options: ErrorHandlerOptions = { showToast: true, logToConsole: true }
): { message: string; type: ErrorType } {
  const { showToast = true, logToConsole = true, performanceData } = options;
  const timestamp = new Date().toISOString();
  
  // Determine if error is critical or can be safely ignored
  const isCritical = !isNonCriticalError(error);
  const errorType = detectErrorType(error);
  const message = formatErrorMessage(error);
  
  // Always log errors to console with context
  if (logToConsole) {
    console.error(`Error [${timestamp}] in ${source}:`, error);
    if (performanceData) {
      console.info(`Performance data for error context:`, performanceData);
    }
  }
  
  // Only show toast for critical errors that should interrupt the user
  if (showToast && isCritical) {
    toast({
      title: errorType === ErrorType.TIMEOUT ? "Search Timeout" : "Error",
      description: message,
      variant: "destructive",
    });
  }
  
  return {
    message,
    type: errorType
  };
}
