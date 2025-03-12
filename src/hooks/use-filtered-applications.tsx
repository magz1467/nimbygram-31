
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { sortApplicationsByDistance } from '@/utils/distance';
import { isAfter, isSameDay, parseISO } from 'date-fns';

interface ActiveFilters {
  status?: string;
  type?: string;
  search?: string;
  date?: string;
}

export const useFilteredApplications = (
  applications: Application[],
  activeFilters: ActiveFilters = {},
  activeSort?: SortType,
  coordinates?: [number, number] | null,
  searchTerm?: string,
  page: number = 0,
  pageSize: number = 25
) => {
  return useMemo(() => {
    if (!applications?.length) {
      return { applications: [], totalCount: 0 };
    }

    // Apply filters
    let filtered = applications.filter(app => {
      // Apply status filter
      if (activeFilters.status && !app.status?.toLowerCase().includes(activeFilters.status.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (activeFilters.type && !app.type?.toLowerCase().includes(activeFilters.type.toLowerCase())) {
        return false;
      }
      
      // Apply date filter (using valid_date field)
      if (activeFilters.date && app.valid_date) {
        try {
          const filterDate = parseISO(activeFilters.date);
          const appValidDate = parseISO(app.valid_date);
          
          // Only include applications whose valid_date is same as or after the filter date
          if (!isAfter(appValidDate, filterDate) && !isSameDay(appValidDate, filterDate)) {
            return false;
          }
        } catch (error) {
          console.error('Date parsing error:', error);
        }
      }
      
      return true;
    });

    // Apply sorting
    if (coordinates && activeSort === 'distance') {
      filtered = sortApplicationsByDistance(filtered, coordinates);
    } else if (activeSort === 'newest' || activeSort === 'date') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
        const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
        return dateB - dateA;
      });
    } else if (activeSort === 'closingSoon') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.consultationEnd ? new Date(a.consultationEnd).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.consultationEnd ? new Date(b.consultationEnd).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      });
    } else if (activeSort === 'impact') {
      filtered = [...filtered].sort((a, b) => {
        const impactA = a.impact_score || 0;
        const impactB = b.impact_score || 0;
        return impactB - impactA;
      });
    }

    // Calculate pagination
    const totalCount = filtered.length;
    const paginatedApplications = filtered.slice(page * pageSize, (page + 1) * pageSize);

    return { 
      applications: paginatedApplications, 
      totalCount 
    };
  }, [applications, activeFilters, activeSort, coordinates, searchTerm, page, pageSize]);
};
