
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { useFilteredApplications } from '@/hooks/use-filtered-applications';

interface UseFilteredAndSortedApplicationsResult {
  applications: Application[];
  totalCount: number;
  totalPages: number;
}

export const useFilteredAndSortedApplications = (
  applications: Application[] | undefined,
  activeFilters: {
    status?: string;
    type?: string;
    search?: string;
    classification?: string;
  } | undefined,
  activeSort?: SortType,
  coordinates?: [number, number] | null,
  searchTerm?: string,
  pageSize: number = 25,
  currentPage: number = 0
): UseFilteredAndSortedApplicationsResult => {
  // Ensure we have valid inputs - defensive coding
  const validApplications = Array.isArray(applications) ? applications : [];
  const validFilters = activeFilters || {};
  const validCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) ? currentPage : 0;
  const validPageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? pageSize : 25;

  // Get filtered applications using the filtered applications hook
  const result = useFilteredApplications(
    validApplications,
    validFilters,
    activeSort,
    coordinates,
    searchTerm,
    validCurrentPage,
    validPageSize
  );

  // Calculate total pages safely - always return at least 1 page
  const totalPages = useMemo(() => {
    // Ensure result exists and has a valid totalCount
    const count = result && typeof result.totalCount === 'number' ? result.totalCount : 0;
    return Math.max(1, Math.ceil(count / validPageSize));
  }, [result, validPageSize]);

  // Return safe values with fallbacks
  return useMemo(() => ({
    applications: result && Array.isArray(result.applications) ? result.applications : [],
    totalCount: result && typeof result.totalCount === 'number' ? result.totalCount : 0,
    totalPages
  }), [result, totalPages]);
};
