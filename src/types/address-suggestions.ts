
export interface PostcodeSuggestion {
  postcode: string;
  country: string;
  nhs_ha: string;
  admin_district: string;
  address?: string;
  isPlaceId?: boolean;
}

export interface AddressSuggestionOptions {
  limit?: number;
}
