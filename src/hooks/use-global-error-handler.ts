
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ErrorType, 
  AppError, 
  createAppError, 
  isNonCriticalError, 
  formatErrorMessage,
  detectErrorType 
} from '@/utils/errors';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

interface ErrorHandlerOptions {
  context?: string;
  retry?: () => void;
  silent?: boolean;
  log?: boolean;
  trackTelemetry?: boolean;
  userMessage?: string;
}

interface GlobalErrorHandler {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => AppError;
  isNonCritical: (error: unknown) => boolean;
  formatMessage: (error: unknown) => string;
  createError: (message: string, options?: any) => AppError;
  ErrorType: typeof ErrorType;
}

export function useGlobalErrorHandler(): GlobalErrorHandler {
  const { toast } = useToast();
  
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}): AppError => {
    // Default options
    const opts = {
      context: 'application',
      retry: undefined,
      silent: false,
      log: true,
      trackTelemetry: true,
      userMessage: '',
      ...options
    };
    
    // Log to console unless disabled
    if (opts.log) {
      console.error(`Error in ${opts.context}:`, error);
    }
    
    // Determine error type
    const errorType = 'type' in (error as any) 
      ? (error as any).type 
      : detectErrorType(error);
    
    // Format message for display
    const formattedMessage = formatErrorMessage(error);
    
    // Create standardized error object
    const appError = createAppError(
      formattedMessage,
      error,
      {
        type: errorType,
        context: { context: opts.context },
        userMessage: opts.userMessage
      }
    );
    
    // Log to telemetry if enabled
    if (opts.trackTelemetry) {
      searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
        errorType: appError.type,
        errorMessage: appError.message,
        context: opts.context
      });
    }
    
    // Show toast notification if not silent and error is critical
    if (!opts.silent && !isNonCriticalError(error)) {
      toast({
        title: `Error ${opts.context ? `in ${opts.context}` : ''}`,
        description: appError.userMessage || formattedMessage,
        variant: "destructive",
        action: opts.retry ? {
          label: "Retry",
          onClick: opts.retry
        } : undefined
      });
    }
    
    return appError;
  }, [toast]);

  return {
    handleError,
    isNonCritical: isNonCriticalError,
    formatMessage: formatErrorMessage,
    createError: createAppError,
    ErrorType
  };
}
