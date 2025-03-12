
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { sortApplicationsByDistance } from '@/utils/distance';

interface ActiveFilters {
  status?: string;
  type?: string;
  search?: string;
  classification?: string;
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
      if (activeFilters.status && !app.status?.toLowerCase().includes(activeFilters.status.toLowerCase())) {
        return false;
      }
      if (activeFilters.type && !app.type?.toLowerCase().includes(activeFilters.type.toLowerCase())) {
        return false;
      }
      if (activeFilters.classification && !app.classification?.toLowerCase().includes(activeFilters.classification.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (coordinates && activeSort === 'distance') {
      filtered = sortApplicationsByDistance(filtered, coordinates);
    } else if (activeSort === 'newest') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.received_date ? new Date(a.received_date).getTime() : 0;
        const dateB = b.received_date ? new Date(b.received_date).getTime() : 0;
        return dateB - dateA;
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
