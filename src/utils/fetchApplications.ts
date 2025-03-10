
import { searchApplications } from "@/services/search/search-service";
import { Application } from "@/types/planning";

export const fetchApplications = async (
  coordinates: [number, number] | null, 
  searchTerm?: string
): Promise<Application[]> => {
  console.log('🔍 fetchApplications called with:', { coordinates, searchTerm });
  
  if (!coordinates && !searchTerm) {
    console.log('❌ No search parameters provided to fetchApplications');
    return [];
  }
  
  return searchApplications(coordinates, searchTerm);
};
