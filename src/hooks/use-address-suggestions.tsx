import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface PostcodeInfo {
  latitude: number;
  longitude: number;
}

const fetchAddressSuggestions = async (searchTerm: string): Promise<any[]> => {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.getAddress.io/autocomplete/${searchTerm}?api-key=${process.env.NEXT_PUBLIC_GET_ADDRESS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Failed to fetch address suggestions:", error);
    return [];
  }
};

const fetchPostcodeInfo = async (postcode: string): Promise<PostcodeInfo | null> => {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();

    if (data.status === 200 && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
      };
    } else {
      console.error("Failed to fetch postcode info:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch postcode info:", error);
    return null;
  }
};

export const useAddressSuggestions = (searchTerm: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['address-suggestions', searchTerm] as const,
    queryFn: () => fetchAddressSuggestions(searchTerm),
    enabled: !!searchTerm,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    suggestions: data || [],
    isLoading,
    error,
  };
};
