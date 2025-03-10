
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { SortType } from '@/types/application-types';

/**
 * Simple hook to sort applications based on sort type and coordinates
 */
export const useApplicationSorting = (
  applications: Application[] = [], 
  sortType: SortType = null,
  coordinates?: [number, number] | null
): Application[] => {
  return useMemo(() => {
    if (!applications || applications.length === 0) {
      return [];
    }
    
    const appsCopy = [...applications];
    
    switch (sortType) {
      case 'newest':
        return appsCopy.sort((a, b) => {
          const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
          const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
          return dateB - dateA;
        });
        
      case 'closingSoon':
        return appsCopy.sort((a, b) => {
          const dateA = a.last_date_consultation_comments 
            ? new Date(a.last_date_consultation_comments).getTime() 
            : Number.MAX_SAFE_INTEGER;
          const dateB = b.last_date_consultation_comments 
            ? new Date(b.last_date_consultation_comments).getTime()
            : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });
        
      case 'distance':
        if (coordinates && coordinates.length === 2) {
          return sortByDistance(appsCopy, coordinates);
        }
        return appsCopy;
        
      default:
        // If no sort type is specified and we have coordinates, sort by distance as default
        if (coordinates && coordinates.length === 2) {
          return sortByDistance(appsCopy, coordinates);
        }
        return appsCopy;
    }
  }, [applications, sortType, coordinates]);
};

/**
 * Sort applications by distance from search coordinates, ensuring proper numeric sorting
 */
const sortByDistance = (
  applications: Application[],
  coordinates: [number, number]
): Application[] => {
  // First add distance information to each application
  const appsWithDistance = applications.map(app => {
    const appCopy = { ...app };
    
    if (app.coordinates) {
      try {
        // Calculate distance using the Haversine formula
        const [lat1, lon1] = coordinates;
        const [lat2, lon2] = app.coordinates;
        
        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Store both raw value and formatted string for display
        const distanceInMiles = distance * 0.621371;
        appCopy.distance = `${distanceInMiles.toFixed(1)} mi`;
        
        // Ensure we store a numeric value for proper sorting
        const distanceValue = Number(distance);
        (appCopy as any).distanceValue = isNaN(distanceValue) ? Number.MAX_SAFE_INTEGER : distanceValue;
        
        console.log(`Distance for app ${app.id}: ${distance.toFixed(2)}km (${distanceInMiles.toFixed(2)} mi)`);
      } catch (error) {
        console.warn(`Error calculating distance for app ${app.id}:`, error);
        (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
      }
    } else {
      console.warn(`Application ${app.id} has no coordinates, setting max distance`);
      (appCopy as any).distanceValue = Number.MAX_SAFE_INTEGER;
    }
    
    return appCopy;
  });
  
  // Then sort by the calculated distance value
  const sortedApps = [...appsWithDistance].sort((a, b) => {
    const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
    
    // Ensure we're comparing numbers
    const numA = typeof distanceA === 'number' ? distanceA : Number.MAX_SAFE_INTEGER;
    const numB = typeof distanceB === 'number' ? distanceB : Number.MAX_SAFE_INTEGER;
    
    return numA - numB;
  });
  
  // Log the first few sorted applications for debugging
  if (sortedApps.length > 0) {
    console.log("🔍 Applications sorted by distance:");
    sortedApps.slice(0, 3).forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app.id}, Distance: ${app.distance}, Value: ${(app as any).distanceValue}`);
    });
  }
  
  return sortedApps;
};
