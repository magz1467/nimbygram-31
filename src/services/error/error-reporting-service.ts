
import { AppError } from '@/utils/errors';
import { searchTelemetry, TelemetryEventType } from '@/services/telemetry/search-telemetry';

interface ErrorReportingOptions {
  context?: string;
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  silent?: boolean;
}

/**
 * Reports errors to telemetry and centralized error tracking
 */
export function reportError(
  error: Error | AppError | unknown,
  options: ErrorReportingOptions = {}
): void {
  // Format error details
  const errorDetails = formatErrorDetails(error);
  
  // Log to console
  if (!options.silent) {
    const context = options.context ? ` in ${options.context}` : '';
    console.error(`Error${context}:`, error);
  }
  
  // Log to telemetry service
  searchTelemetry.logEvent(TelemetryEventType.SEARCH_ERROR, {
    errorType: errorDetails.type || 'unknown',
    errorMessage: errorDetails.message,
    errorStack: errorDetails.stack,
    ...options
  });
  
  // In the future, you could add more reporting services here:
  // - Sentry
  // - LogRocket
  // - Custom backend error logging endpoint
}

/**
 * Format error details for consistent reporting
 */
function formatErrorDetails(error: unknown): {
  message: string;
  type?: string;
  stack?: string;
  code?: string;
} {
  if (!error) {
    return { message: 'Unknown error (null or undefined)' };
  }
  
  // Handle AppError
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const appError = error as AppError;
    return {
      message: appError.message || 'Unknown error',
      type: appError.type,
      stack: appError.stack,
      code: (appError as any).code
    };
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return {
      message: error.message || 'Unknown error',
      stack: error.stack,
      code: (error as any).code
    };
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // Handle other types of errors
  try {
    return {
      message: JSON.stringify(error),
      type: typeof error
    };
  } catch {
    return { message: 'Unserializable error' };
  }
}
