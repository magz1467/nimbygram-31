
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { calculateDistance } from '@/utils/distance';

export const useFilteredAndSortedApplications = (
  applications: Application[] | undefined,
  activeFilters: {
    status?: string;
    type?: string;
    classification?: string;
  },
  activeSort: string,
  coordinates: [number, number] | null
) => {
  // Memoize filtered and sorted applications
  return useMemo(() => {
    console.log('🔍 Filtering applications:', {
      total: applications?.length || 0,
      filters: activeFilters,
      sort: activeSort,
      coordinates: coordinates ? `[${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}]` : null
    });

    if (!applications || applications.length === 0) {
      return [];
    }

    // Filter applications based on active filters
    const filtered = applications.filter(app => {
      // Filter by status if specified
      if (activeFilters.status && app.status !== activeFilters.status) {
        return false;
      }
      
      // Filter by type if specified
      if (activeFilters.type && app.type !== activeFilters.type) {
        return false;
      }
      
      // Filter by classification if specified
      if (activeFilters.classification && app.class_3 !== activeFilters.classification) {
        return false;
      }
      
      return true;
    });

    // Sort filtered applications
    return filtered.sort((a, b) => {
      // Sort by newest first (most recent submission date)
      if (activeSort === 'newest') {
        const dateA = new Date(a.submissionDate || '').getTime() || 0;
        const dateB = new Date(b.submissionDate || '').getTime() || 0;
        return dateB - dateA;
      }
      
      // Sort by closing soon (earliest consultation end date)
      if (activeSort === 'closingSoon') {
        const dateA = new Date(a.last_date_consultation_comments || '').getTime() || Number.MAX_SAFE_INTEGER;
        const dateB = new Date(b.last_date_consultation_comments || '').getTime() || Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      }
      
      // Sort by distance from search coordinates
      if (activeSort === 'nearest' && coordinates) {
        const distanceA = a.coordinates ? calculateDistance(coordinates, a.coordinates) : Number.MAX_SAFE_INTEGER;
        const distanceB = b.coordinates ? calculateDistance(coordinates, b.coordinates) : Number.MAX_SAFE_INTEGER;
        return distanceA - distanceB;
      }
      
      // Default sorting: by distance from search coordinates if available
      if (coordinates) {
        const distanceA = a.coordinates ? calculateDistance(coordinates, a.coordinates) : Number.MAX_SAFE_INTEGER;
        const distanceB = b.coordinates ? calculateDistance(coordinates, b.coordinates) : Number.MAX_SAFE_INTEGER;
        return distanceA - distanceB;
      }
      
      return 0;
    });
  }, [applications, activeFilters, activeSort, coordinates]);
};
