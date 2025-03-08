
export interface PostcodeSuggestion {
  postcode: string;
  country: string;
  county?: string; // Add county field
  nhs_ha: string;
  admin_district: string;
  address?: string;
  isPlaceId?: boolean;
}

export interface AddressSuggestionOptions {
  limit?: number;
}
