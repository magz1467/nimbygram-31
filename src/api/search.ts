import { Application } from '@/types/planning';

interface SearchResult {
  applications: Application[];
  coordinates: [number, number] | null;
  totalCount: number;
  totalPages: number;
  hasPartialResults: boolean;
}

export async function fetchSearchResults(
  term: string, 
  type: 'postcode' | 'location' = 'location'
): Promise<SearchResult> {
  // This is a mock implementation
  // Replace with actual API call in production
  
  console.log(`Searching for ${term} as ${type}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    applications: [],
    coordinates: null,
    totalCount: 0,
    totalPages: 0,
    hasPartialResults: false
  };
} 