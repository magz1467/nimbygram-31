
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { SortType } from '@/types/application-types';
import { calculateDistance, sortApplicationsByDistance } from '@/utils/distance';

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
    
    console.log(`Sorting applications by type: ${sortType}, with coordinates: ${coordinates ? 'yes' : 'no'}`);
    
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
          // Use our canonical distance sorting function
          return sortApplicationsByDistance(appsCopy, coordinates);
        }
        return appsCopy;
        
      default:
        // If no sort type is specified and we have coordinates, sort by distance as default
        if (coordinates && coordinates.length === 2) {
          // Use our canonical distance sorting function
          return sortApplicationsByDistance(appsCopy, coordinates);
        }
        return appsCopy;
    }
  }, [applications, sortType, coordinates]);
};
