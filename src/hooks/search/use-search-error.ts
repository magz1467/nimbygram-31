
import { useState, useCallback, useRef } from 'react';
import { ErrorType, detectErrorType } from "@/utils/errors";
import { formatErrorMessage } from "@/utils/errors";

export const useSearchError = (onError?: (error: Error | null) => void) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(ErrorType.UNKNOWN);
  const handleErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleError = useCallback((err: Error | any) => {
    if (err) {
      console.log('❌ SearchView error detected:', err);
      
      if (handleErrorTimeoutRef.current) {
        clearTimeout(handleErrorTimeoutRef.current);
      }
      
      handleErrorTimeoutRef.current = setTimeout(() => {
        const errorObj = err instanceof Error ? err : new Error(formatErrorMessage(err));
        setError(errorObj);
        setErrorType(detectErrorType(err));
        onError?.(errorObj);
        handleErrorTimeoutRef.current = null;
      }, 0);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(ErrorType.UNKNOWN);
  }, []);

  return { error, errorType, handleError, clearError };
};
