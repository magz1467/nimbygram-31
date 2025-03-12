
import { useState } from 'react';
import { Application } from "@/types/planning";
import { ResultsHeader } from "@/components/search/results/ResultsHeader";
import { ResultsContainer } from "@/components/search/results/ResultsContainer";
import { SortType } from "@/types/application-types";
import { StatusCounts } from "@/types/application-types";

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
  
  // Calculate status counts for the header with default values
  const statusCounts: StatusCounts = applications.reduce((counts: StatusCounts, app) => {
    // Initialize with default values if this is the first iteration
    if (!counts['Under Review']) counts['Under Review'] = 0;
    if (!counts['Approved']) counts['Approved'] = 0;
    if (!counts['Declined']) counts['Declined'] = 0;
    if (!counts['Other']) counts['Other'] = 0;
    
    const status = app.status || 'Other';
    const category = status.includes('Under Review') ? 'Under Review' :
                    status.includes('Approved') ? 'Approved' :
                    status.includes('Declined') ? 'Declined' : 'Other';
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {} as StatusCounts);
  
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
