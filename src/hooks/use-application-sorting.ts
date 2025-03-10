
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { SortType } from '@/types/application-types';

interface SortingParams {
  type: SortType;
  applications: Application[];
}

export const useApplicationSorting = ({ type, applications }: SortingParams): Application[] => {
  return useMemo(() => {
    if (!applications?.length) return [];
    
    const appsCopy = [...applications];
    
    switch (type) {
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
        return appsCopy.sort((a, b) => {
          const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
          const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
          return distanceA - distanceB;
        });
        
      default:
        return appsCopy;
    }
  }, [type, applications]);
};
