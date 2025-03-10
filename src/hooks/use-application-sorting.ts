
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
    if (!applications || !Array.isArray(applications) || !applications.length) {
      console.log('No valid applications provided to sorting function');
      return [];
    }
    
    // Create a copy to avoid mutating the original array
    const appsCopy = [...applications];

    console.log(`🔄 Sorting applications by type: ${type}`);
    
    try {
      switch (type) {
        case 'newest':
          console.log('Sorting by newest');
          return appsCopy.sort((a, b) => {
            const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
            const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
            return dateB - dateA;
          });
          
        case 'closingSoon':
          console.log('Sorting by closing soon');
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
          console.log('Sorting by distance');
          if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            return transformAndSortApplications(appsCopy, coordinates);
          }
          // If we don't have coordinates, return unsorted
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
