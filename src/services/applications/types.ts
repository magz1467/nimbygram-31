import { LatLngTuple } from 'leaflet';
import { Application } from '@/types/planning';

export interface FetchApplicationsParams {
  center: LatLngTuple;
  radiusInMeters: number;
  pageSize?: number;
  pageNumber?: number;
}

export interface ApplicationsResponse {
  data: Application[];
  count: number;
}

export interface ApplicationsError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}