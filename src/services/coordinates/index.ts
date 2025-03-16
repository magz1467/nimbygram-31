
/**
 * Coordinates service - exports all coordinate-related functionality
 */
export { fetchCoordinatesFromPlaceId } from './fetch-coordinates-by-place-id';
export { fetchCoordinatesByLocationName } from './fetch-coordinates-by-location-name';
export { fetchCoordinatesFromPostcodesIo } from './fetch-coordinates-from-postcode';
export { fetchCoordinatesByAddress } from './fetch-coordinates-by-address';
export { fetchCoordinatesFromOutcode } from './fetch-coordinates-from-outcode';
export { fetchCoordinatesFromTown } from './fetch-coordinates-from-town';
export { ensureGoogleMapsLoaded } from './google-maps-loader';
export { 
  isGooglePlaceId, 
  isLocationName,
  isAddressLike,
  isUKPostcode,
  isUKOutcode,
  isTownOrCity,
  detectLocationType,
  extractPlaceName
} from './location-type-detector';
