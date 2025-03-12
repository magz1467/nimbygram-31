
import { Application } from "@/types/planning";
import { SearchFilters } from "../types";
import { ErrorType } from "@/utils/errors/types";

export interface FallbackSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: SearchFilters;
}

export interface FallbackSearchOptions {
  reduced?: boolean;
  lastResort?: boolean;
}

export interface UserErrorMessages {
  [ErrorType.NETWORK]: string;
  [ErrorType.TIMEOUT]: string;
  [ErrorType.NOT_FOUND]: string;
  [ErrorType.COORDINATES]: string;
  [ErrorType.DATABASE]: string;
  [ErrorType.PERMISSION]: string;
  [ErrorType.UNKNOWN]: string;
}

export type FallbackSearchResult = {
  applications: Application[];
  searchMethod: 'fallback';
};
