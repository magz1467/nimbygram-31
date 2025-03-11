
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  handleError, 
  ErrorOptions, 
  ErrorType, 
  AppError,
  isNonCriticalError
} from "@/utils/errors";

/**
 * Hook that provides access to error handling functionality
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  const handleAppError = useCallback((
    error: any,
    options: ErrorOptions = {}
  ): AppError => {
    return handleError(error, toast, options);
  }, [toast]);
  
  const isNonCritical = useCallback((error: any): boolean => {
    // Consider timeout errors and database constraint errors non-critical
    if (!error) return true;
    
    // Check for timeout errors
    if (error.message && (
      error.message.includes('timeout') || 
      error.message.includes('57014') ||
      error.message.includes('canceling statement')
    )) {
      return true;
    }
    
    return isNonCriticalError(error);
  }, []);
  
  return {
    handleError: handleAppError,
    isNonCritical,
    ErrorType
  };
}
