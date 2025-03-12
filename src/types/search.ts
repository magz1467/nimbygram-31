
import { Application } from "./planning";

export interface SearchCoordinates {
  lat: number;
  lng: number;
}

export interface SearchResult {
  applications: Application[];
  method: 'spatial' | 'fallback';
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

export const SEARCH_RADIUS = 5; // 5km radius
export const SEARCH_TIMEOUT = 30000; // 30 second timeout
