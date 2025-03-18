import React, { useState, useMemo } from 'react';
import { Application } from "@/types/planning";
import { ResultsHeader } from "@/components/search/results/ResultsHeader";
import { ResultsContainer } from "../ResultsContainer";
import { SortType, StatusCounts } from "@/types/application-types";
import { useSearchState } from '@/hooks/search/useSearchState';
import { useDebugLogger } from '@/hooks/useDebugLogger';

// Define the exact props interface based on what SearchView is passing
interface ResultsViewProps {
  applications: Application[];
  searchTerm?: string;
  displayTerm?: string;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  hasPartialResults: boolean;
  isSearchInProgress: boolean;
  onToggleMapView: () => void;
  retry?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  applications = [],
  searchTerm,
  displayTerm,
  filters = {},
  onFilterChange,
  hasPartialResults = false,
  isSearchInProgress = false,
  onToggleMapView,
  retry
}) => {
  // Debug logging
  useDebugLogger('ResultsView', {
    applicationsCount: applications?.length || 0,
    searchTerm,
    displayTerm,
    hasPartialResults,
    isSearchInProgress
  });

  // Local state
  const [showMap, setShowMap] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState<SortType>('distance');
  
  // Global state
  const { 
    error, 
    coordinates, 
    isLoading = false,
    retry: contextRetry
  } = useSearchState();
  
  // Use retry from props or context
  const handleRetry = retry || contextRetry;
  
  // Sort applications
  const sortedApplications = useMemo(() => {
    if (!applications || applications.length === 0) {
      return [];
    }

    const appsCopy = [...applications];
    
    switch (activeSort) {
      case 'distance':
        return appsCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'date':
        return appsCopy.sort((a, b) => {
          const dateA = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
          const dateB = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
          return dateB - dateA;
        });
      case 'status':
        return appsCopy.sort((a, b) => {
          const statusA = a.status || '';
          const statusB = b.status || '';
          return statusA.localeCompare(statusB);
        });
      default:
        return appsCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
  }, [applications, activeSort]);
  
  // Calculate status counts
  const statusCounts: StatusCounts = useMemo(() => {
    const counts: StatusCounts = {
      'Under Review': 0,
      'Approved': 0,
      'Declined': 0,
      'Other': 0
    };
    
    if (applications && applications.length > 0) {
      applications.forEach(app => {
        const status = app.status || 'Other';
        if (status.includes('Under Review')) {
          counts['Under Review']++;
        } else if (status.includes('Approved')) {
          counts['Approved']++;
        } else if (status.includes('Declined')) {
          counts['Declined']++;
        } else {
          counts['Other']++;
        }
      });
    }
    
    return counts;
  }, [applications]);
  
  // Handle map toggle
  const handleToggleMapView = () => {
    if (onToggleMapView) {
      onToggleMapView();
    } else {
      setShowMap(!showMap);
    }
  };
  
  // Handle marker click
  const handleMarkerClick = (id: number) => {
    setSelectedId(id);
  };

  // Show error state if needed
  if (error && (!applications || applications.length === 0)) {
    return (
      <div className="results-view error-state">
        <div className="error-message">
          <h2>Error loading results</h2>
          <p>{error.message}</p>
          <button onClick={handleRetry || (() => window.location.reload())}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="results-view">
      <ResultsHeader 
        searchTerm={searchTerm}
        resultCount={applications?.length || 0}
        isLoading={isLoading}
        isMapVisible={showMap}
        onToggleMapView={handleToggleMapView}
        activeSort={activeSort}
        activeFilters={filters}
        onFilterChange={onFilterChange}
        onSortChange={(sortType: SortType) => setActiveSort(sortType)}
        statusCounts={statusCounts}
      />

      <div className="px-4 lg:px-6">
        <ResultsContainer
          applications={applications}
          displayApplications={sortedApplications}
          isLoading={isLoading}
          searchTerm={searchTerm}
          displayTerm={displayTerm}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={handleMarkerClick}
          error={error}
        />
      </div>
    </div>
  );
};
