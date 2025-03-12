
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
}

export function ResultsView({ applications, searchTerm, filters, onFilterChange }: ResultsViewProps) {
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
          coordinates={null}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={(id) => setSelectedId(id)}
        />
      </div>
    </div>
  );
}
