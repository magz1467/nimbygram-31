
export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
  [key: string]: string | undefined;
}

export type SearchMethod = 'spatial' | 'fallback' | 'cache';

export interface SearchParams {
  coordinates: [number, number];
  radius: number;
  filters: SearchFilters;
}

export interface SearchOptions {
  coordinates: [number, number];
  radius: number;
  filters: SearchFilters;
}

export interface SearchResult {
  applications: any[];
  searchMethod: SearchMethod;
}

export interface ProgressiveSearchState {
  results: any[];
  isLoading: boolean;
}

export enum SearchErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  COORDINATES = 'coordinates',
  NO_RESULTS = 'no_results',
  UNKNOWN = 'unknown'
}
