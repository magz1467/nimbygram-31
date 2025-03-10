
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
  const validApplications = applications || [];
  const validFilters = activeFilters || {};
  const validCurrentPage = currentPage || 0;
  const validPageSize = pageSize || 25;

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
    const count = result ? (result.totalCount || 0) : 0;
    return Math.max(1, Math.ceil(count / validPageSize));
  }, [result, validPageSize]);

  // Return safe values with fallbacks
  return {
    applications: result ? (result.applications || []) : [],
    totalCount: result ? (result.totalCount || 0) : 0,
    totalPages
  };
};
