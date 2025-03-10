
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
  // Ensure we have valid inputs
  const validApplications = Array.isArray(applications) ? applications : [];
  const validFilters = activeFilters || {};
  const validCurrentPage = typeof currentPage === 'number' ? Math.max(0, currentPage) : 0;
  const validPageSize = typeof pageSize === 'number' ? Math.max(1, pageSize) : 25;

  // Get filtered applications using the filtered applications hook
  const filteredResult = useFilteredApplications(
    validApplications,
    validFilters,
    activeSort,
    coordinates,
    searchTerm,
    validCurrentPage,
    validPageSize
  );

  // Calculate total pages
  const totalPages = useMemo(() => {
    const totalCount = filteredResult.totalCount;
    return Math.max(1, Math.ceil(totalCount / validPageSize));
  }, [filteredResult.totalCount, validPageSize]);

  return useMemo(() => ({
    applications: filteredResult.applications || [],
    totalCount: filteredResult.totalCount || 0,
    totalPages
  }), [filteredResult, totalPages]);
};
