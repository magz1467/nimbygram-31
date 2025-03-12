
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
  SERVER = 'server',
  COORDINATES = 'coordinates',
  SEARCH = 'search'
}

export interface AppError extends Error {
  type: ErrorType;
  originalError?: any;
  context?: Record<string, any>;
  recoverable?: boolean;
  userMessage?: string;
  stack?: string;
}

export type ErrorOptions = {
  type?: ErrorType;
  context?: Record<string, any>;
  recoverable?: boolean;
  userMessage?: string;
};

// Helper function to safely stringify objects
export function safeStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return String(obj);
  }
  
  if (obj instanceof Error) {
    return obj.message || obj.toString();
  }
  
  if (typeof obj === 'object') {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return '[Complex Object]';
    }
  }
  
  return String(obj);
}
