
import { ErrorType } from "@/utils/errors/types";

export interface FallbackSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: any;
}

export interface ErrorTypeMapping {
  [key: string]: ErrorType;
}

export interface UserErrorMessages {
  [key in ErrorType]: string;
}
