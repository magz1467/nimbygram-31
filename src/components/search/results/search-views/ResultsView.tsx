
import { useState } from 'react';
import { Application } from "@/types/planning";
import { ResultsHeader } from "@/components/search/results/ResultsHeader";
import { ResultsContainer } from "@/components/search/results/ResultsContainer";
import { SortType, StatusCounts } from "@/types/application-types";

interface ResultsViewProps {
  applications: Application[];
  searchTerm: string;
  filters: Record<string, any>;
  onFilterChange: (type: string, value: any) => void;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
}

export function ResultsView({ 
  applications, 
  searchTerm, 
  filters, 
  onFilterChange,
  hasPartialResults = false,
  isSearchInProgress = false
}: ResultsViewProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState<SortType>('distance');
  
  // Calculate status counts with proper initialization
  const statusCounts: StatusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  };
  
  // Count applications by status
  applications.forEach(app => {
    const status = app.status || 'Other';
    if (status.includes('Under Review')) {
      statusCounts['Under Review']++;
    } else if (status.includes('Approved')) {
      statusCounts['Approved']++;
    } else if (status.includes('Declined')) {
      statusCounts['Declined']++;
    } else {
      statusCounts['Other']++;
    }
  });

  // Get coordinates from the first application with valid coordinates
  const firstAppWithCoordinates = applications.find(app => 
    app.coordinates && 
    Array.isArray(app.coordinates) && 
    app.coordinates.length === 2
  );
  
  const searchCoordinates = firstAppWithCoordinates?.coordinates || null;
  
  return (
    <div>
      <ResultsHeader 
        searchTerm={searchTerm}
        resultCount={applications?.length || 0}
        isLoading={false}
        isMapVisible={showMap}
        onToggleMapView={() => setShowMap(!showMap)}
        activeSort={activeSort}
        activeFilters={filters}
        onFilterChange={onFilterChange}
        onSortChange={(sortType) => setActiveSort(sortType)}
        statusCounts={statusCounts}
      />

      <div className="px-4 lg:px-6">
        <ResultsContainer
          applications={applications}
          isLoading={false}
          searchTerm={searchTerm}
          displayApplications={applications}
          coordinates={searchCoordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={(id) => setSelectedId(id)}
          hasPartialResults={hasPartialResults}
          isSearchInProgress={isSearchInProgress}
        />
      </div>
    </div>
  );
}
