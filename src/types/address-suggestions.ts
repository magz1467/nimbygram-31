
export interface PostcodeSuggestion {
  postcode: string;
  country: string;
  county?: string;
  district?: string;
  locality?: string;
  nhs_ha: string;
  admin_district: string;
  address?: string;
  isPlaceId?: boolean;
  isManualPostcode?: boolean;
  id?: string; // Adding this to support potential unique identifiers
}

export interface AddressSuggestionOptions {
  limit?: number;
}
