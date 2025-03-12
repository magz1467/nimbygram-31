import { Application } from "@/types/planning";

export type SearchMethod = 'spatial' | 'fallback' | 'cache' | 'paginated' | 'emergency' | 'none' | 'error';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
  [key: string]: string | undefined;
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  applications: Application[];
  method: SearchMethod;
  timing?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

// Add the ProgressiveSearchState interface that was missing
export interface ProgressiveSearchState {
  results: Application[];
  isLoading: boolean;
}
