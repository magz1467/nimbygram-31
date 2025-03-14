
/**
 * Coordinates service - exports all coordinate-related functionality
 */
export { fetchCoordinatesFromPlaceId } from './fetch-coordinates-by-place-id';
export { fetchCoordinatesByLocationName } from './fetch-coordinates-by-location-name';
export { fetchCoordinatesFromPostcodesIo } from './fetch-coordinates-from-postcode';
export { ensureGoogleMapsLoaded } from './google-maps-loader';
export { 
  isGooglePlaceId, 
  isLocationName, 
  detectLocationType,
  extractPlaceName
} from './location-type-detector';
