
import { Application } from "@/types/planning";

export interface FallbackSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: any;
}

export interface FallbackSearchResult {
  applications: Application[];
  method: 'fallback';
}

// Generic filter interface
export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
  [key: string]: string | undefined;
}
