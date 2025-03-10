
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { sortApplicationsByDistance } from '@/utils/distance';

/**
 * Hook to sort applications based on sort type and coordinates
 */
export const useApplicationSorting = (
  applications: Application[],
  sortType?: SortType,
  coordinates?: [number, number] | null
): Application[] => {
  return useMemo(() => {
    if (!applications?.length) {
      return [];
    }

    let sortedApps = [...applications];

    switch (sortType) {
      case 'distance':
        if (coordinates) {
          return sortApplicationsByDistance(sortedApps, coordinates);
        }
        break;
      
      case 'newest':
        return sortedApps.sort((a, b) => {
          const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
          const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
          return dateB - dateA;
        });
      
      case 'closingSoon':
        return sortedApps.sort((a, b) => {
          const dateA = a.consultationEnd ? new Date(a.consultationEnd).getTime() : Number.MAX_SAFE_INTEGER;
          const dateB = b.consultationEnd ? new Date(b.consultationEnd).getTime() : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });
    }

    // Default: return applications in original order
    return sortedApps;
  }, [applications, sortType, coordinates]);
};
