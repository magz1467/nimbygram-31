
import { Application } from "@/types/planning";
import { SearchFilters } from "../types";

export interface SpatialSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: SearchFilters;
  page: number;
  pageSize: number;
}

export interface SpatialSearchResult {
  applications: Application[];
  searchMethod: 'spatial';
}

export interface SpatialSearchError {
  message: string;
  context: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    filters?: SearchFilters;
    [key: string]: any;
  };
  type: string;
}
