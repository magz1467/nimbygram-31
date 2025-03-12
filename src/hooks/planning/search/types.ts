
import { Application } from "@/types/planning";

export type SearchMethod = 'spatial' | 'fallback' | 'cache' | 'paginated' | 'emergency';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
  [key: string]: string | undefined;
}

export interface SearchParams {
  coordinates: [number, number];
  radius: number;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

export interface SearchOptions {
  useCache?: boolean;
  retryCount?: number;
  timeout?: number;
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

export interface SearchError extends Error {
  type?: string;
  context?: any;
}
