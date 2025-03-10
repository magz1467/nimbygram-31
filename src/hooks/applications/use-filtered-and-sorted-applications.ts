
import { useMemo, useState } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { useFilteredApplications } from '@/hooks/use-filtered-applications';

interface UseFilteredAndSortedApplicationsResult {
  applications: Application[];
  totalCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
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
  initialPageSize: number = 25
): UseFilteredAndSortedApplicationsResult => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = initialPageSize;
  
  const result = useFilteredApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates,
    searchTerm,
    currentPage,
    pageSize
  );
  
  const totalPages = useMemo(() => {
    return Math.ceil(result.totalCount / pageSize);
  }, [result.totalCount, pageSize]);
  
  return {
    applications: result.applications,
    totalCount: result.totalCount,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages
  };
};
