
// Re-export specific items to avoid name conflicts
export { ErrorType } from './types';
export type { AppError } from './types';
export type { ErrorOptions } from './types';
export { detectErrorType, isNonCriticalError } from './detection';
export { formatErrorMessage, logError } from './formatting';
export { createAppError } from './types';
export { handleError } from './centralized-handler';
