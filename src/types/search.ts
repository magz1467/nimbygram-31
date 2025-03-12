
import { Application } from "./planning";

export type SearchResult = {
  applications: Application[];
  total: number;
  method: 'spatial' | 'fallback' | 'error';
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
};

export type SearchCoordinates = {
  lat: number;
  lng: number;
};

export type SearchError = {
  message: string;
  code?: string;
  details?: string;
};
