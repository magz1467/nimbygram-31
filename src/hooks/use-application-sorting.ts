
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { SortType } from '@/types/application-types';
import { transformAndSortApplications } from '@/services/applications/transforms/distance-sort';

interface SortingParams {
  type: SortType;
  applications: Application[];
  coordinates?: [number, number] | null;
}

export const useApplicationSorting = ({ type, applications, coordinates }: SortingParams): Application[] => {
  return useMemo(() => {
    // Validate applications array
    if (!applications || !Array.isArray(applications)) {
      console.log('No valid applications provided to sorting function');
      return [];
    }
    
    // Return empty array for empty input
    if (applications.length === 0) {
      console.log('Empty applications array provided to sorting function');
      return [];
    }
    
    // Create a copy to avoid mutating the original array
    const appsCopy = [...applications];

    console.log(`🔄 Sorting applications by type: ${type}`);
    
    try {
      // Ensure we have a valid sort type
      const validSortType = typeof type === 'string' ? type : 'newest';
      
      switch (validSortType) {
        case 'newest':
          console.log('Sorting by newest');
          return [...appsCopy].sort((a, b) => {
            // Ensure we have valid dates
            const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
            const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
            return dateB - dateA;
          });
          
        case 'closingSoon':
          console.log('Sorting by closing soon');
          return [...appsCopy].sort((a, b) => {
            // Ensure we have valid dates
            const dateA = a.last_date_consultation_comments 
              ? new Date(a.last_date_consultation_comments).getTime() 
              : Number.MAX_SAFE_INTEGER;
            const dateB = b.last_date_consultation_comments 
              ? new Date(b.last_date_consultation_comments).getTime()
              : Number.MAX_SAFE_INTEGER;
            return dateA - dateB;
          });
          
        case 'distance':
          console.log('Sorting by distance');
          // Validate coordinates before distance sorting
          if (coordinates && 
              Array.isArray(coordinates) && 
              coordinates.length === 2 &&
              typeof coordinates[0] === 'number' &&
              typeof coordinates[1] === 'number') {
            return transformAndSortApplications(appsCopy, coordinates);
          }
          // If we don't have valid coordinates, return unsorted
          console.warn('No valid coordinates provided for distance sorting');
          return appsCopy;
          
        default:
          console.log('No sort type specified, returning unsorted');
          return appsCopy;
      }
    } catch (error) {
      console.error('Error during application sorting:', error);
      return appsCopy; // Return original copy on error
    }
  }, [type, applications, coordinates]);
};
