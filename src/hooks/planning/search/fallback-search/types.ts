
import { SearchFilters, SearchParams } from '../types';

export interface UserErrorMessages {
  INVALID_COORDINATES: string;
  BOUNDARY_ERROR: string;
  DATABASE_ERROR: string;
  TIMEOUT_ERROR: string;
  NO_RESULTS: string;
  UNKNOWN_ERROR: string;
}

export interface FallbackSearchDependencies {
  supabase: any;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
}

export type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export interface FallbackSearchOptions extends SearchParams {
  resultLimit?: number;
}
