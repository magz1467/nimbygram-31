
import { Application } from "@/types/planning";
import { SearchFilters } from "../types";

export interface ProgressiveSearchParams {
  coordinates: [number, number];
  searchRadius: number;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

export interface ProgressiveSearchOptions {
  useCache?: boolean;
  quickSearchRadiusFactor?: number;
  timeout?: number;
}

export interface ProgressiveSearchState {
  results: Application[];
  isLoading: boolean;
}
