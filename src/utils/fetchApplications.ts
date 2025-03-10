
import { searchApplications } from "@/services/search/search-service";
import { Application } from "@/types/planning";

export const fetchApplications = async (coordinates: [number, number] | null): Promise<Application[]> => {
  if (!coordinates) {
    return [];
  }
  
  return searchApplications(coordinates);
};
