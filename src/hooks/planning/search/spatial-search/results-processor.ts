
import { Application } from "@/types/planning";
import { calculateDistance } from "../../utils/distance-calculator";

/**
 * Processes and formats the results from the spatial search
 */
export function processSpatialSearchResults(data: any[], lat: number, lng: number, filters: any): Application[] {
  if (!data) return [];
  
  // Apply filters and add distance calculations
  return data
    .filter((app: any) => {
      if (!app.latitude || !app.longitude) return false;
      
      // Apply additional filters
      if (filters?.status && !app.status?.toLowerCase().includes(filters.status.toLowerCase())) {
        return false;
      }
      if (filters?.type && !app.type?.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
      if (filters?.classification && !app.classification?.toLowerCase().includes(filters.classification.toLowerCase())) {
        return false;
      }
      return true;
    })
    .map((app: any) => {
      const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
      return {
        ...app,
        distance: `${(distanceKm * 0.621371).toFixed(1)} mi`,
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    });
}
