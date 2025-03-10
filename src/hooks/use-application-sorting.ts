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
    
    // Create a copy of the array to avoid mutating the original
    const appsCopy = [...applications];
    
    switch (type) {
      case 'newest':
        return appsCopy.sort((a, b) => {
          // Sort by date received descending (newest first)
          const dateA = a.date_received ? new Date(a.date_received).getTime() : 0;
          const dateB = b.date_received ? new Date(b.date_received).getTime() : 0;
          return dateB - dateA;
        });
        
      case 'closingSoon':
        return appsCopy.sort((a, b) => {
          // Sort by consultation end date ascending (soonest first)
          const dateA = a.last_date_consultation_comments 
            ? new Date(a.last_date_consultation_comments).getTime() 
            : Number.MAX_SAFE_INTEGER;
          const dateB = b.last_date_consultation_comments 
            ? new Date(b.last_date_consultation_comments).getTime() 
            : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });
        
      case 'highestImpact':
        return appsCopy.sort((a, b) => {
          // Sort by impact score descending (highest first)
          const scoreA = a.final_impact_score || 0;
          const scoreB = b.final_impact_score || 0;
          return scoreB - scoreA;
        });
        
      case 'distance':
      case 'nearest':
        return appsCopy.sort((a, b) => {
          // Sort by distance ascending (closest first)
          const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
          const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
          return distanceA - distanceB;
        });
        
      default:
        // Default to sorting by distance if available
        if (appsCopy[0] && (appsCopy[0] as any).distanceValue) {
          return appsCopy.sort((a, b) => {
            const distanceA = (a as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
            const distanceB = (b as any).distanceValue ?? Number.MAX_SAFE_INTEGER;
            return distanceA - distanceB;
          });
        }
        // Otherwise, sort by newest
        return appsCopy.sort((a, b) => {
          const dateA = a.date_received ? new Date(a.date_received).getTime() : 0;
          const dateB = b.date_received ? new Date(b.date_received).getTime() : 0;
          return dateB - dateA;
        });
    }
  }, [type, applications]);
};
