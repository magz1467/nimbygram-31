
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { useApplicationSorting } from './use-application-sorting';
import { filterByLocationRelevance, transformAndSortApplications } from '@/services/applications/transforms';

interface ActiveFilters {
  status?: string;
  type?: string;
  search?: string;
  classification?: string;
}

export const useFilteredApplications = (
  applications: Application[],
  activeFilters: ActiveFilters,
  activeSort?: SortType,
  searchCoordinates?: [number, number] | null,
  searchTerm?: string
) => {
  return useMemo(() => {
    console.log('useFilteredApplications - Input applications:', applications?.length);
    console.log('useFilteredApplications - Active filters:', activeFilters);
    console.log('useFilteredApplications - Active sort:', activeSort);
    console.log('useFilteredApplications - Search coordinates:', searchCoordinates);
    console.log('useFilteredApplications - Search term:', searchTerm);
    
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // Apply all generic filters first (status, type, etc.)
    const filteredApplications = applyAllFilters(applications, activeFilters);
    console.log('After applying filters:', filteredApplications.length);
    
    // For place names like Wendover, ensure we apply location relevance filtering
    // But don't apply it for partial searches or very short searches
    const isSpecificSearchTerm = searchTerm && 
      searchTerm.trim().length >= 3 && // At least 3 characters
      !/^\s*$/.test(searchTerm); // Not just whitespace
    
    // Add text relevance scores to applications - but don't filter out any yet
    const scoredApplications = isSpecificSearchTerm
      ? filterByLocationRelevance(filteredApplications, searchTerm)
      : filteredApplications;
    
    console.log('After adding location relevance scores:', scoredApplications.length);
    
    // If search coordinates available, transform and sort by distance + text score
    let applicationsFinal = scoredApplications;
    if (searchCoordinates) {
      console.log('Adding distance information and final sorting');
      applicationsFinal = transformAndSortApplications(scoredApplications, searchCoordinates);
    }
    
    // Apply explicit sorting based on active sort type, if different from default
    // Only do this if not using distance+relevance sorting
    if (activeSort && activeSort !== 'distance') {
      console.log('Applying explicit sorting by:', activeSort);
      applicationsFinal = useApplicationSorting({
        type: activeSort,
        applications: applicationsFinal
      });
    }

    console.log('useFilteredApplications - Final applications:', applicationsFinal?.length);
    
    // Log the final closest/most relevant applications for debugging
    if (applicationsFinal.length > 0) {
      const topApps = applicationsFinal.slice(0, 3).map(app => ({
        id: app.id,
        score: app.score,
        distance: app.distance,
        address: app.address
      }));
      console.log('Top applications in final result:', topApps);
    }
    
    return applicationsFinal;
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm]);
};
