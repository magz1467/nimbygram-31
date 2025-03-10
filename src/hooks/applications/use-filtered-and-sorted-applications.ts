
import { useMemo } from 'react';
import { Application } from '@/types/planning';
import { sortApplicationsByDistance } from '@/utils/applicationDistance';

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
    let sortedApplications = filtered;
    
    // Sort by newest first (most recent submission date)
    if (activeSort === 'newest') {
      sortedApplications = filtered.sort((a, b) => {
        const dateA = new Date(a.submissionDate || '').getTime() || 0;
        const dateB = new Date(b.submissionDate || '').getTime() || 0;
        return dateB - dateA;
      });
    }
    // Sort by closing soon (earliest consultation end date)
    else if (activeSort === 'closingSoon') {
      sortedApplications = filtered.sort((a, b) => {
        const dateA = new Date(a.last_date_consultation_comments || '').getTime() || Number.MAX_SAFE_INTEGER;
        const dateB = new Date(b.last_date_consultation_comments || '').getTime() || Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      });
    }
    // Sort by distance from search coordinates
    else if ((activeSort === 'nearest' || activeSort === 'distance') && coordinates) {
      sortedApplications = sortApplicationsByDistance(filtered, coordinates);
    }
    // Default sorting: by distance from search coordinates if available
    else if (coordinates) {
      sortedApplications = sortApplicationsByDistance(filtered, coordinates);
    }
    
    // Log the first few sorted applications for debugging
    if (sortedApplications.length > 0 && coordinates) {
      const sampleApps = sortedApplications.slice(0, 3).map(app => ({
        id: app.id,
        distance: app.distance || 'unknown',
        coordinates: app.coordinates,
        address: app.address
      }));
      console.log('Top sorted applications:', sampleApps);
    }
    
    return sortedApplications;
  }, [applications, activeFilters, activeSort, coordinates]);
};
