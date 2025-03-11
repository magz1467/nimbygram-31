
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
  
  const detectedType = errorType || detectErrorType(error);
  const message = formatErrorMessage(error, context);
  
  return new AppError(message, detectedType, error, context);
}

/**
 * Handle errors in a standardized way across the application
 */
export function handleError(
  error: any, 
  toast: ReturnType<typeof useToast>["toast"],
  options: ErrorOptions = {}
): AppError {
  const { context, retry, silent = false, logToServer = false } = options;
  
  // Create standardized app error
  const appError = error instanceof AppError 
    ? error 
    : new AppError(
        formatErrorMessage(error, context), 
        detectErrorType(error), 
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
  
  // Log to server for important errors (could implement actual server logging here)
  if (logToServer) {
    console.info('Would log to server:', { error: appError, context });
    // Implementation for server logging would go here
  }
  
  return appError;
}
