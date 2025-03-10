
import { useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType } from "@/types/application-types";
import { applyAllFilters } from "@/utils/applicationFilters";
import { addDistanceToApplications, sortApplicationsByDistance } from "@/utils/applicationDistance";
import { useApplicationSorting } from './use-application-sorting';
import { filterByLocationRelevance } from '@/services/applications/transform-applications';

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
    
    // Apply location relevance filtering only for exact postcode matches, not for partial matches
    // This helps prevent incorrect prioritization based on partial postcode matches
    const shouldApplyLocationFiltering = searchTerm && 
      searchTerm.trim().length >= 6 && // Only apply for full postcodes
      !searchTerm.includes(" "); // And only when searching for a specific term, not browsing
    
    const locationFilteredApplications = shouldApplyLocationFiltering
      ? filterByLocationRelevance(filteredApplications, searchTerm)
      : filteredApplications;
    
    console.log('After location relevance filtering:', locationFilteredApplications.length);
    
    // Add distance information if search coordinates are available
    let applicationsWithDistance = locationFilteredApplications;
    if (searchCoordinates) {
      console.log('Adding distance information using coordinates:', searchCoordinates);
      applicationsWithDistance = addDistanceToApplications(locationFilteredApplications, searchCoordinates);
      
      // Log the first few applications with their distances for debugging
      const sampleApps = applicationsWithDistance.slice(0, 5).map(app => ({
        id: app.id,
        distance: app.distance,
        coordinates: app.coordinates,
        address: app.address
      }));
      console.log('Sample applications with distances:', sampleApps);
    }
    
    // Apply sorting based on active sort type
    let finalSortedApplications = applicationsWithDistance;
    
    if ((activeSort === 'distance') && searchCoordinates) {
      console.log('Explicitly sorting by distance');
      finalSortedApplications = sortApplicationsByDistance(applicationsWithDistance, searchCoordinates);
    } else if (activeSort) {
      // Use the application sorting hook for other sort types
      finalSortedApplications = useApplicationSorting({
        type: activeSort,
        applications: applicationsWithDistance
      });
    } else if (searchCoordinates) {
      // If no sort specified but we have coordinates, default to distance sort
      console.log('No sort specified, defaulting to distance sort');
      finalSortedApplications = sortApplicationsByDistance(applicationsWithDistance, searchCoordinates);
    }

    console.log('useFilteredApplications - Final sorted applications:', finalSortedApplications?.length);
    
    // Log the final closest applications for debugging
    if (finalSortedApplications.length > 0 && searchCoordinates) {
      const closestApps = finalSortedApplications.slice(0, 3).map(app => ({
        id: app.id,
        distance: app.distance,
        address: app.address
      }));
      console.log('Closest applications after sorting:', closestApps);
    }
    
    return finalSortedApplications;
  }, [applications, activeFilters, activeSort, searchCoordinates, searchTerm]);
};
