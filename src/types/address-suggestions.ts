
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
  isLocationName?: boolean;
}

export interface AddressSuggestionOptions {
  limit?: number;
}
