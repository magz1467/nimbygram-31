
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
  const validCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) ? Math.max(0, currentPage) : 0;
  const validPageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? Math.max(1, pageSize) : 25;
  const validCoordinates = coordinates && Array.isArray(coordinates) && coordinates.length === 2 ? coordinates : null;
  const validSearchTerm = typeof searchTerm === 'string' ? searchTerm : '';
  const validActiveSort = typeof activeSort === 'string' ? activeSort : undefined;

  // Get filtered applications using the filtered applications hook
  const filteredResult = useFilteredApplications(
    validApplications,
    validFilters,
    validActiveSort,
    validCoordinates,
    validSearchTerm,
    validCurrentPage,
    validPageSize
  );

  // Safely extract applications and total count from result
  const safeApplications = (filteredResult && Array.isArray(filteredResult.applications)) 
    ? filteredResult.applications 
    : [];
  
  const safeTotalCount = (filteredResult && typeof filteredResult.totalCount === 'number') 
    ? filteredResult.totalCount 
    : 0;

  // Calculate total pages safely - always return at least 1 page
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(safeTotalCount / validPageSize));
  }, [safeTotalCount, validPageSize]);

  // Return safe values with fallbacks
  return useMemo(() => ({
    applications: safeApplications,
    totalCount: safeTotalCount,
    totalPages
  }), [safeApplications, safeTotalCount, totalPages]);
};
