
import { Application } from "@/types/planning";

// Simple in-memory cache for searches
type CacheEntry = {
  timestamp: number;
  data: Application[];
  coordinates: [number, number];
  radius: number;
  filters: any;
};

class SearchCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxEntries: number = 10;
  private cacheLifespanMs: number = 15 * 60 * 1000; // 15 minutes
  
  constructor(maxEntries = 10, cacheLifespanMs = 15 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.cacheLifespanMs = cacheLifespanMs;
  }
  
  private createCacheKey(coordinates: [number, number], radius: number, filters: any): string {
    const [lat, lng] = coordinates;
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLng = Math.round(lng * 1000) / 1000;
    return `${roundedLat},${roundedLng}-${radius}-${JSON.stringify(filters)}`;
  }
  
  get(coordinates: [number, number], radius: number, filters: any): Application[] | null {
    const key = this.createCacheKey(coordinates, radius, filters);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.cacheLifespanMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(coordinates: [number, number], radius: number, filters: any, data: Application[]): void {
    const key = this.createCacheKey(coordinates, radius, filters);
    
    // Add new entry
    this.cache.set(key, {
      timestamp: Date.now(),
      data,
      coordinates,
      radius,
      filters
    });
    
    // Prune cache if it exceeds max size
    if (this.cache.size > this.maxEntries) {
      // Find oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      
      this.cache.forEach((entry, entryKey) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = entryKey;
        }
      });
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Create singleton instance
export const searchCache = new SearchCacheService();
