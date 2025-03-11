
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
    return isNonCriticalError(error);
  }, []);
  
  return {
    handleError: handleAppError,
    isNonCritical,
    ErrorType
  };
}
