import { detectErrorType } from './detection';
import { formatErrorMessage, formatErrorForLogging } from './formatting';
import { handleError } from './centralized-handler';

// Re-export types with the proper syntax
export type { AppError, AppErrorOptions, ErrorHandlerOptions } from './types';
export { ErrorType } from './types';

// Export error utilities
export { detectErrorType, formatErrorMessage, formatErrorForLogging, handleError };

// Other exports
export { isNonCriticalError } from '@/utils/errors';
