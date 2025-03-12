
import { Application } from "@/types/planning";
import { SearchFilters } from "../types";

export interface ProgressiveSearchParams {
  coordinates: [number, number];
  searchRadius: number;
  filters: SearchFilters;
}

export interface ProgressiveSearchState {
  results: Application[];
  isLoading: boolean;
}

export interface ProgressiveSearchOptions {
  useCache?: boolean;
  quickSearchRadiusFactor?: number;
}
