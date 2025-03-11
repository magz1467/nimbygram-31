
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
