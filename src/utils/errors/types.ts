
/**
 * Enum representing different types of errors in the application
 */
export enum ErrorType {
  UNKNOWN = 'unknown',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  SPATIAL = 'spatial',
  FRONTEND = 'frontend'
}

/**
 * Options for creating an application error
 */
export interface AppErrorOptions {
  type?: ErrorType;
  cause?: Error | unknown;
  code?: string;
  metadata?: Record<string, any>;
}

/**
 * Extended Error class for application-specific errors
 */
export class AppError extends Error {
  type: ErrorType;
  cause?: Error | unknown;
  code?: string;
  metadata?: Record<string, any>;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.type = options.type || ErrorType.UNKNOWN;
    this.cause = options.cause;
    this.code = options.code;
    this.metadata = options.metadata;
    
    // Set the prototype explicitly to ensure instanceof works properly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Factory function to create AppError instances
 */
export function createAppError(message: string, options: AppErrorOptions = {}): AppError {
  return new AppError(message, options);
}
