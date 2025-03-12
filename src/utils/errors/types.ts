
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout', 
  NOT_FOUND = 'not_found',
  DATA = 'data',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  SERVER = 'server'
}

export interface AppError extends Error {
  type: ErrorType;
  originalError?: any;
  context?: Record<string, any>;
  recoverable?: boolean;
  userMessage?: string;
}

export type ErrorOptions = {
  type?: ErrorType;
  context?: Record<string, any>;
  recoverable?: boolean;
  userMessage?: string;
};
