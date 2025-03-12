
/**
 * Coordinates cache service to avoid repeated geocoding requests
 */

// Type for our cached location entries
interface CachedLocation {
  coordinates: [number, number];
  timestamp: number;
  displayName: string;
}

// In-memory cache store
const locationCache = new Map<string, CachedLocation>();

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Store coordinates in cache
 */
export const cacheCoordinates = (
  locationKey: string,
  coordinates: [number, number],
  displayName: string = locationKey
): void => {
  locationCache.set(locationKey, {
    coordinates,
    timestamp: Date.now(),
    displayName
  });
  
  // Also store with lowercase key for case-insensitive lookups
  const lowercaseKey = locationKey.toLowerCase();
  if (lowercaseKey !== locationKey) {
    locationCache.set(lowercaseKey, {
      coordinates,
      timestamp: Date.now(),
      displayName
    });
  }
  
  console.log(`🗄️ Cached coordinates for "${locationKey}":`, coordinates);
};

/**
 * Get coordinates from cache if available and not expired
 */
export const getCachedCoordinates = (
  locationKey: string
): [number, number] | null => {
  // Try exact match
  const cached = locationCache.get(locationKey);
  
  // If not found, try lowercase version
  const lowercaseCached = !cached ? locationCache.get(locationKey.toLowerCase()) : null;
  
  const entry = cached || lowercaseCached;
  
  if (!entry) {
    return null;
  }
  
  // Check if cache entry is expired
  if (Date.now() - entry.timestamp > CACHE_EXPIRATION) {
    locationCache.delete(locationKey);
    return null;
  }
  
  console.log(`🗄️ Using cached coordinates for "${locationKey}":`, entry.coordinates);
  return entry.coordinates;
};

/**
 * Check if we have coordinates cached for a location
 */
export const hasCoordinatesInCache = (locationKey: string): boolean => {
  return getCachedCoordinates(locationKey) !== null;
};

/**
 * Get all cached location entries (for debugging)
 */
export const getAllCachedLocations = (): Record<string, CachedLocation> => {
  return Object.fromEntries(locationCache.entries());
};

/**
 * Clear expired entries from the cache
 */
export const cleanupCache = (): void => {
  const now = Date.now();
  let removedCount = 0;
  
  locationCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_EXPIRATION) {
      locationCache.delete(key);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`🧹 Removed ${removedCount} expired location cache entries`);
  }
};

// Run cleanup periodically
setInterval(cleanupCache, 60 * 60 * 1000); // Every hour
