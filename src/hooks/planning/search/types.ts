
import { Application } from "@/types/planning";

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export interface ProgressiveSearchState {
  results: Application[];
  isLoading: boolean;
}

export interface SearchOptions {
  coordinates: [number, number] | null;
  radius: number;
  filters: SearchFilters;
}

export interface SearchResult {
  applications: Application[];
  searchMethod: 'spatial' | 'fallback' | 'cache';
}
