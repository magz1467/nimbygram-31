
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { AppError, ErrorOptions, ErrorType } from './types';
import { detectErrorType } from './detection';
import { formatErrorMessage, logError } from './formatting';
import React from 'react';

/**
 * Create a standardized AppError from any error
 */
export function createAppError(error: any, context?: string, errorType?: ErrorType): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  // Use provided errorType if available, otherwise detect it
  const type = errorType !== undefined ? errorType : detectErrorType(error);
  const message = formatErrorMessage(error, context);
  
  return new AppError(message, type, error, context);
}

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
      action: retry ? (
        <ToastAction altText="Retry" onClick={retry}>
          Retry
        </ToastAction>
      ) : undefined
    });
  }
  
  // Track errors for analytics
  if (logToServer) {
    try {
      // In a real implementation, this would send to an analytics service
      console.info('Error tracked for analytics:', { 
        type: appError.type,
        message: appError.message,
        context: context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Implementation for server logging would go here
      // e.g., sendToErrorTracking(appError, context);
    } catch (trackingError) {
      // Don't let tracking errors break the app
      console.error('Error during error tracking:', trackingError);
    }
  }
  
  return appError;
}

/**
 * Optional: Send error to a tracking service
 * This is just a placeholder - implement with your preferred service
 */
function sendToErrorTracking(error: AppError, context?: string): void {
  // Example implementations:
  // 1. Send to Sentry
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error.originalError || error, {
  //     tags: { context, errorType: error.type }
  //   });
  // }
  
  // 2. Send to custom endpoint
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message: error.message,
  //     type: error.type,
  //     context,
  //     stack: error.stack,
  //     timestamp: new Date().toISOString(),
  //     url: window.location.href
  //   })
  // }).catch(e => console.error('Failed to log error to server:', e));
}
