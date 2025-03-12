
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  ErrorType, 
  isNonCriticalError,
  formatErrorMessage,
  detectErrorType
} from "@/utils/errors";

/**
 * Hook that provides access to error handling functionality
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  const handleAppError = useCallback((error: any, options: any = {}) => {
    console.error('Error:', error);
    
    const formattedMessage = formatErrorMessage(error);
    const errorType = detectErrorType(error);
    
    if (toast && !isNonCriticalError(error)) {
      toast({
        title: options.title || "Error",
        description: formattedMessage,
        variant: "destructive",
      });
    }
    
    return {
      message: formattedMessage,
      type: errorType
    };
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
