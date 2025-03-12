
export interface SpatialSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  filters: any;
  page: number;
  pageSize: number;
}

export interface SpatialSearchResult {
  id: string;
  latitude: number;
  longitude: number;
  distance: number;
  [key: string]: any;
}
