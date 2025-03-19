
// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[], status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng;
      placeId?: string;
      bounds?: LatLngBounds;
      region?: string;
      componentRestrictions?: GeocoderComponentRestrictions;
    }

    interface GeocoderComponentRestrictions {
      country: string | string[];
    }

    interface GeocoderResult {
      types: string[];
      formatted_address: string;
      address_components: GeocoderAddressComponent[];
      geometry: GeocoderGeometry;
      partial_match: boolean;
      place_id: string;
    }

    interface GeocoderAddressComponent {
      short_name: string;
      long_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    enum GeocoderLocationType {
      APPROXIMATE,
      GEOMETRIC_CENTER,
      RANGE_INTERPOLATED,
      ROOFTOP
    }

    enum GeocoderStatus {
      ERROR = "ERROR",
      INVALID_REQUEST = "INVALID_REQUEST",
      OK = "OK",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
      ZERO_RESULTS = "ZERO_RESULTS"
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): {lat: number, lng: number};
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds): boolean;
      extend(latLng: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds): boolean;
      isEmpty(): boolean;
      toJSON(): {north: number, east: number, south: number, west: number};
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds): LatLngBounds;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[], status: PlacesServiceStatus) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (result: PlaceResult, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        bounds?: LatLngBounds;
        componentRestrictions?: ComponentRestrictions;
        location?: LatLng;
        offset?: number;
        radius?: number;
        types?: string[];
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      interface AutocompletePrediction {
        description: string;
        matched_substrings: PredictionSubstring[];
        place_id: string;
        reference: string;
        structured_formatting: StructuredFormatting;
        terms: PredictionTerm[];
        types: string[];
      }

      interface StructuredFormatting {
        main_text: string;
        main_text_matched_substrings: PredictionSubstring[];
        secondary_text: string;
      }

      interface PredictionTerm {
        offset: number;
        value: string;
      }

      interface PredictionSubstring {
        length: number;
        offset: number;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        adr_address?: string;
        formatted_address?: string;
        geometry?: PlaceGeometry;
        icon?: string;
        name?: string;
        photos?: PlacePhoto[];
        place_id?: string;
        plus_code?: PlusCode;
        types?: string[];
        url?: string;
        utc_offset?: number;
        vicinity?: string;
        html_attributions?: string[];
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      interface PlaceGeometry {
        location: LatLng;
        viewport: LatLngBounds;
      }

      interface PlacePhoto {
        height: number;
        html_attributions: string[];
        width: number;
        getUrl(opts: PhotoOptions): string;
      }

      interface PhotoOptions {
        maxHeight?: number;
        maxWidth?: number;
      }

      interface PlusCode {
        compound_code: string;
        global_code: string;
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        NOT_FOUND = "NOT_FOUND"
      }
    }
  }
}
