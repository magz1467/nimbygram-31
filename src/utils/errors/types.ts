
/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  UNKNOWN = 'unknown',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  DATABASE = 'database',
  SPATIAL = 'spatial'
}

/**
 * Interface for application errors with proper typing
 */
export interface AppError extends Error {
  type: ErrorType;
  details?: string;
  code?: string;
  context?: Record<string, any>;
}

/**
 * Create a typed application error
 */
export function createAppError(
  message: string, 
  type: ErrorType = ErrorType.UNKNOWN,
  details?: string,
  code?: string,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  if (details) error.details = details;
  if (code) error.code = code;
  if (context) error.context = context;
  return error;
}
