
import { ErrorType, AppError, ErrorOptions } from './types';

export function createAppError(
  message: string,
  originalError?: any,
  options: ErrorOptions = {}
): AppError {
  // Detect error type from original error if not provided
  const type = options.type || detectErrorType(originalError, message);
  
  const error = new Error(message) as AppError;
  error.name = 'AppError'; // Ensure name property exists
  error.type = type;
  error.originalError = originalError;
  error.context = options.context || {};
  error.recoverable = options.recoverable !== undefined ? options.recoverable : isRecoverableError(type);
  error.userMessage = options.userMessage || getUserFriendlyMessage(type, message);
  
  // Capture stack trace
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createAppError);
  }
  
  return error;
}

function detectErrorType(originalError: any, message: string = ''): ErrorType {
  const errorMsg = originalError?.message || message || '';
  const lowerCaseMsg = errorMsg.toLowerCase();
  
  // Network errors
  if (
    !navigator.onLine || 
    lowerCaseMsg.includes('network') || 
    lowerCaseMsg.includes('fetch') ||
    lowerCaseMsg.includes('connection') ||
    originalError instanceof TypeError
  ) {
    return ErrorType.NETWORK;
  }
  
  // Timeout errors
  if (
    lowerCaseMsg.includes('timeout') || 
    lowerCaseMsg.includes('timed out') ||
    lowerCaseMsg.includes('too long') ||
    lowerCaseMsg.includes('canceling statement') ||
    lowerCaseMsg.includes('57014')
  ) {
    return ErrorType.TIMEOUT;
  }
  
  // Not found errors
  if (
    lowerCaseMsg.includes('not found') || 
    lowerCaseMsg.includes('no results') ||
    lowerCaseMsg.includes('404')
  ) {
    return ErrorType.NOT_FOUND;
  }
  
  // Permission errors
  if (
    lowerCaseMsg.includes('permission') ||
    lowerCaseMsg.includes('unauthorized') ||
    lowerCaseMsg.includes('forbidden') ||
    lowerCaseMsg.includes('401') ||
    lowerCaseMsg.includes('403')
  ) {
    return ErrorType.PERMISSION;
  }
  
  // Data errors
  if (
    lowerCaseMsg.includes('data') ||
    lowerCaseMsg.includes('parse') ||
    lowerCaseMsg.includes('invalid') ||
    lowerCaseMsg.includes('syntax')
  ) {
    return ErrorType.DATA;
  }
  
  return ErrorType.UNKNOWN;
}

function isRecoverableError(type: ErrorType): boolean {
  // Network and timeout errors are potentially recoverable
  return type === ErrorType.NETWORK || type === ErrorType.TIMEOUT;
}

function getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
  switch (type) {
    case ErrorType.NETWORK:
      return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
    case ErrorType.TIMEOUT:
      return "The search took too long to complete. Please try a more specific location or different filters.";
    case ErrorType.NOT_FOUND:
      return "We couldn't find any planning applications matching your search criteria.";
    case ErrorType.PERMISSION:
      return "You don't have permission to access this information. Please log in or contact support if you believe this is a mistake.";
    case ErrorType.DATA:
      return "We encountered an issue with the data. Please try again or contact support if the issue persists.";
    default:
      return "We encountered an unexpected issue. Please try again later.";
  }
}
