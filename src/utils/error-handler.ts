
import { useToast } from "@/hooks/use-toast";

/**
 * Types of errors for better categorization and handling
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  DATABASE = 'database',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Error options for the error handler
 */
export interface ErrorOptions {
  type?: ErrorType;
  context?: string;
  retry?: () => void;
  fallback?: any;
  silent?: boolean;
  logToServer?: boolean;
}

/**
 * Standard application error that includes type information
 */
export class AppError extends Error {
  type: ErrorType;
  context?: string;
  originalError?: any;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, originalError?: any, context?: string) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.context = context;
  }
}

/**
 * Determine error type based on the error message or properties
 */
export function detectErrorType(error: any): ErrorType {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toString()?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || 
      code.includes('network') || code === 'err_network' || message.includes('offline')) {
    return ErrorType.NETWORK;
  }

  if (message.includes('timeout') || code.includes('timeout') || code === '57014') {
    return ErrorType.TIMEOUT;
  }

  if (message.includes('authentication') || message.includes('login') || 
      message.includes('signin') || message.includes('auth') || 
      code === '401' || code === 'auth/unauthorized') {
    return ErrorType.AUTHENTICATION;
  }

  if (message.includes('permission') || message.includes('forbidden') || 
      message.includes('not allowed') || code === '403') {
    return ErrorType.AUTHORIZATION;
  }

  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('required field') || message.includes('constraint')) {
    return ErrorType.VALIDATION;
  }

  if (message.includes('not found') || code === '404') {
    return ErrorType.NOT_FOUND;
  }

  if (message.includes('database') || message.includes('sql') || 
      message.includes('db error') || message.includes('relation')) {
    return ErrorType.DATABASE;
  }

  if (message.includes('server') || code === '500') {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Format error for user-friendly display
 */
export function formatErrorMessage(error: any, context?: string): string {
  if (!error) return 'An unknown error occurred';
  
  // If it's already an AppError, use its message
  if (error instanceof AppError) {
    return error.message;
  }
  
  const errorType = detectErrorType(error);
  const originalMessage = error.message || String(error);
  
  // Create user-friendly messages based on error type
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    
    case ErrorType.TIMEOUT:
      return context === 'search' 
        ? 'The search took too long to complete. Please try a more specific location or different filters.'
        : 'The operation timed out. Please try again.';
    
    case ErrorType.AUTHENTICATION:
      return 'You need to be logged in to perform this action.';
    
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    
    case ErrorType.VALIDATION:
      return 'There was a problem with the provided information.';
    
    case ErrorType.NOT_FOUND:
      return 'The requested resource could not be found.';
    
    case ErrorType.DATABASE:
      // Don't expose database errors to users
      console.error('Database error:', originalMessage);
      return 'There was a problem accessing the data. Our team has been notified.';
    
    case ErrorType.SERVER:
      return 'The server encountered an error. Please try again later.';
    
    default:
      // For unknown errors, log the original message but show a generic one to users
      console.error('Unknown error:', originalMessage);
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Log error to console with useful formatting and context
 */
export function logError(error: any, context?: string): void {
  const errorType = error instanceof AppError ? error.type : detectErrorType(error);
  
  console.group(`🚨 Error [${errorType}]${context ? ` in ${context}` : ''}`);
  console.error(error);
  if (error.stack) {
    console.debug('Stack trace:', error.stack);
  }
  console.groupEnd();
}

/**
 * Create a standardized AppError from any error
 */
export function createAppError(error: any, context?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const errorType = detectErrorType(error);
  const message = formatErrorMessage(error, context);
  
  return new AppError(message, errorType, error, context);
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
      action: retry ? {
        label: "Retry",
        onClick: retry
      } : undefined
    });
  }
  
  // Log to server for important errors (could implement actual server logging here)
  if (logToServer) {
    console.info('Would log to server:', { error: appError, context });
    // Implementation for server logging would go here
  }
  
  return appError;
}

/**
 * Determine if an error is a non-critical infrastructure issue
 * (like missing tables during development)
 */
export function isNonCriticalError(error: any): boolean {
  if (!error) return false;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message || String(error)).toLowerCase();
  
  return (
    // Development infrastructure errors
    (message.includes('relation') && message.includes('does not exist')) ||
    message.includes('support table') ||
    message.includes('function not available') ||
    // Feature flags/missing features
    message.includes('feature disabled') ||
    message.includes('not implemented')
  );
}
