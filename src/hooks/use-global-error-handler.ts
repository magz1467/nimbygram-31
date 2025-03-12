
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ErrorType, 
  detectErrorType,
  isNonCriticalError, 
  formatErrorMessage,
  createAppError
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
  handleError: (error: unknown, options?: ErrorHandlerOptions) => Error;
  isNonCritical: (error: unknown) => boolean;
  formatMessage: (error: unknown) => string;
  createError: (message: string, options?: any) => Error;
  ErrorType: typeof ErrorType;
}

export function useGlobalErrorHandler(): GlobalErrorHandler {
  const { toast } = useToast();
  
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}): Error => {
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
    if (!opts.silent && !isNonCritical(error)) {
      toast({
        title: `Error ${opts.context ? `in ${opts.context}` : ''}`,
        description: appError.userMessage || formattedMessage,
        variant: "destructive",
        action: opts.retry ? {
          altText: "Retry",
          onClick: opts.retry
        } : undefined
      });
    }
    
    return appError;
  }, [toast]);

  const createError = useCallback((message: string, options: any = {}): Error => {
    return createAppError(message, null, options);
  }, []);

  return {
    handleError,
    isNonCritical: isNonCriticalError,
    formatMessage: formatErrorMessage,
    createError,
    ErrorType
  };
}
