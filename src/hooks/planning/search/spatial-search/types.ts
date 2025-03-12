
import { Application } from "@/types/planning";
import { ErrorType } from "@/utils/errors/types";

export interface SpatialSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: any;
  page?: number;
  pageSize?: number;
}

export interface SpatialSearchResult {
  applications: Application[];
  method: 'spatial';
}

export interface SpatialSearchError {
  message: string;
  type: ErrorType;
  context?: any;
  userMessage?: string;
}
