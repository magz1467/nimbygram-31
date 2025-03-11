
// Re-export specific items to avoid name conflicts
export { ErrorType, AppError, type ErrorOptions } from './types';
export { detectErrorType, isNonCriticalError } from './detection';
export { formatErrorMessage, logError } from './formatting';
export { createAppError, handleError } from './handler';
