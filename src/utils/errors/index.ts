
import { detectErrorType } from './detection';
import { formatErrorMessage, formatErrorForLogging } from './formatting';
import { handleError } from './centralized-handler';
import { isNonCriticalError } from '../errors';
export type { AppError, AppErrorOptions, ErrorHandlerOptions } from './types';
export { ErrorType } from './types';
export { createAppError } from './types';
export { handleError, detectErrorType, formatErrorMessage, formatErrorForLogging, isNonCriticalError };
