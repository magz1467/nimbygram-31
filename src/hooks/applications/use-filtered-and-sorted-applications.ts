
import { useMemo, useState } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { useFilteredApplications } from '@/hooks/use-filtered-applications';

interface UseFilteredAndSortedApplicationsResult {
  applications: Application[];
  totalCount: number;
  totalPages: number;
}

export const useFilteredAndSortedApplications = (
  applications: Application[],
  activeFilters: {
    status?: string;
    type?: string;
    search?: string;
    classification?: string;
  },
  activeSort?: SortType,
  coordinates?: [number, number] | null,
  searchTerm?: string,
  pageSize: number = 25,
  currentPage: number = 0
): UseFilteredAndSortedApplicationsResult => {
  // Ensure we have valid inputs
  const validApplications = applications || [];
  const validFilters = activeFilters || {};
  
  const result = useFilteredApplications(
    validApplications,
    validFilters,
    activeSort,
    coordinates,
    searchTerm,
    currentPage,
    pageSize
  );
  
  const totalPages = useMemo(() => {
    const count = result.totalCount || 0;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [result.totalCount, pageSize]);
  
  return {
    applications: result.applications || [],
    totalCount: result.totalCount || 0,
    totalPages
  };
};
