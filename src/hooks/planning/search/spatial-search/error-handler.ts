
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType, safeStringify } from "@/utils/errors/types";

/**
 * Handles and formats errors from spatial search
 */
export function handleSpatialSearchError(error: any, params: { lat: number, lng: number, radiusKm: number, filters?: any }) {
  if (error.name === 'AppError') throw error;
  
  const isTimeout = String(error).toLowerCase().includes('timeout') || 
                    String(error).toLowerCase().includes('canceling statement');
  
  throw createAppError(
    `Spatial search failed: ${safeStringify(error)}`,
    error,
    {
      type: isTimeout ? ErrorType.TIMEOUT : ErrorType.DATABASE,
      context: params,
      userMessage: isTimeout 
        ? 'The search took too long. Please try a smaller area.'
        : 'We encountered an issue with the search. Please try again.'
    }
  );
}

/**
 * Validates spatial search parameters
 */
export function validateSpatialSearchParams(lat: number, lng: number) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    throw createAppError('Invalid coordinates for spatial search', null, {
      type: ErrorType.COORDINATES,
      context: { lat, lng },
      userMessage: 'We couldn\'t perform the search with the provided location.'
    });
  }
}
