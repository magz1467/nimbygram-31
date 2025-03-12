
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
  SPATIAL = 'spatial',
  AUTHORIZATION = 'authorization'
}

/**
 * Interface for application errors with proper typing
 */
export interface AppErrorOptions {
  type?: ErrorType;
  details?: string;
  code?: string;
  context?: Record<string, any>;
}

export class AppError extends Error {
  type: ErrorType;
  details?: string;
  code?: string;
  context?: Record<string, any>;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.type = options.type || ErrorType.UNKNOWN;
    this.details = options.details;
    this.code = options.code;
    this.context = options.context;
  }
}

export type ErrorHandlerOptions = {
  showToast?: boolean;
  critical?: boolean;
  context?: Record<string, any>;
};

/**
 * Create a typed application error
 */
export function createAppError(
  message: string, 
  options: AppErrorOptions = {}
): AppError {
  return new AppError(message, options);
}
