
import { ErrorType, safeStringify } from "@/utils/errors/types";
import { createAppError } from "@/utils/errors/error-factory";
import { UserErrorMessages } from "./types";

// Error type detection
export function detectErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  const message = typeof error === 'string' 
    ? error.toLowerCase() 
    : error instanceof Error 
      ? error.message.toLowerCase()
      : error.message 
        ? error.message.toLowerCase() 
        : '';
  
  if (message.includes('timeout') || message.includes('too long') || message.includes('canceling statement')) {
    return ErrorType.TIMEOUT;
  } else if (message.includes('network') || message.includes('fetch') || message.includes('connection') || !navigator?.onLine) {
    return ErrorType.NETWORK;
  } else if (message.includes('not found') || message.includes('no results')) {
    return ErrorType.NOT_FOUND;
  } else if (message.includes('coordinates') || message.includes('location')) {
    return ErrorType.COORDINATES;
  } else if (message.includes('database') || message.includes('sql') || message.includes('query') || message.includes('syntax')) {
    return ErrorType.DATABASE;
  } else if (message.includes('permission') || message.includes('access') || message.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  }
  
  return ErrorType.UNKNOWN;
}

// User-friendly error messages
export function getErrorUserMessage(errorType: ErrorType): string {
  const messages: UserErrorMessages = {
    [ErrorType.NETWORK]: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
    [ErrorType.TIMEOUT]: "The search took too long to complete. Please try a more specific location or different filters.",
    [ErrorType.NOT_FOUND]: "We couldn't find any planning applications matching your search criteria.",
    [ErrorType.COORDINATES]: "We couldn't find the location you specified. Please try a different search term.",
    [ErrorType.DATABASE]: "We encountered an issue with our database. Please try again later.",
    [ErrorType.PERMISSION]: "You don't have permission to access this information.",
    [ErrorType.UNKNOWN]: "We had trouble searching for planning applications. Please try again later."
  };
  
  return messages[errorType] || messages[ErrorType.UNKNOWN];
}

// Create an error with proper context for the fallback search
export function createFallbackSearchError(
  message: string, 
  originalError: any,
  context: any,
  errorType?: ErrorType
): Error {
  const detectedType = errorType || detectErrorType(originalError);
  
  return createAppError(
    message,
    originalError,
    {
      type: detectedType,
      recoverable: detectedType === ErrorType.NETWORK || detectedType === ErrorType.TIMEOUT,
      context,
      userMessage: getErrorUserMessage(detectedType)
    }
  );
}
