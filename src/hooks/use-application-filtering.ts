import { useState, useMemo } from 'react';
import { Application } from "@/types/planning";

export type SortType = 'date' | 'relevance' | 'distance';
export type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

interface FilterConfig {
  status?: string;
  type?: string;
  search?: string;
  classification?: string;
}

interface UseApplicationFilteringProps {
  applications: Application[];
  initialSortType?: SortType;
  initialFilterType?: FilterType;
}

export function useApplicationFiltering({
  applications,
  initialSortType = 'date',
  initialFilterType = 'all'
}: UseApplicationFilteringProps) {
  const [sortType, setSortType] = useState<SortType>(initialSortType);
  const [filterType, setFilterType] = useState<FilterType>(initialFilterType);

  const filteredApplications = useMemo(() => {
    // First apply filters
    let filtered = [...applications];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(app => 
        app.status.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Then apply sorting
    return filtered.sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } 
      
      if (sortType === 'distance' && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      
      if (sortType === 'relevance' && a.relevanceScore !== undefined && b.relevanceScore !== undefined) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      return 0;
    });
  }, [applications, sortType, filterType]);

  return {
    filteredApplications,
    sortType,
    filterType,
    setSortType,
    setFilterType
  };
}
