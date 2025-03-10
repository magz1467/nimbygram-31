
import { useMemo } from 'react';
import { Application } from '@/types/planning';

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
      sort: activeSort
    });

    if (!applications || applications.length === 0) {
      return [];
    }

    const filtered = applications.filter(app => {
      if (activeFilters.status && app.status !== activeFilters.status) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (activeSort === 'newest') {
        return new Date(b.submissionDate || '').getTime() - new Date(a.submissionDate || '').getTime();
      }
      if (activeSort === 'closingSoon' && coordinates) {
        const dateA = new Date(a.last_date_consultation_comments || '').getTime();
        const dateB = new Date(b.last_date_consultation_comments || '').getTime();
        return dateA - dateB;
      }
      return 0;
    });
  }, [applications, activeFilters, activeSort, coordinates]);
};
