
/**
 * Coordinate fetching strategies
 * This file exports all strategy functions for different location types
 */

// Export individual strategies
export { fetchCoordinatesForPlaceId } from './strategies/place-id-strategy';
export { fetchCoordinatesForTown } from './strategies/town-strategy';
export { fetchCoordinatesForOutcode } from './strategies/outcode-strategy';
export { fetchCoordinatesForAddress } from './strategies/address-strategy';
export { fetchCoordinatesForLocationName } from './strategies/location-name-strategy';
export { fetchCoordinatesForPostcode } from './strategies/postcode-strategy';

// Re-export types
export type { CoordinateCallbacks } from './types/coordinate-callbacks';
