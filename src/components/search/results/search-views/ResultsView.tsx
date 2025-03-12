
import { useState } from 'react';
import { Application } from "@/types/planning";
import { ResultsHeader } from "@/components/search/results/ResultsHeader";
import { ResultsContainer } from "@/components/search/results/ResultsContainer";
import { SortType } from "@/types/application-types";

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
  const statusCounts = applications.reduce((counts: Record<string, number>, app) => {
    const status = app.status || 'Other';
    const category = status.includes('Under Review') ? 'Under Review' :
                    status.includes('Approved') ? 'Approved' :
                    status.includes('Declined') ? 'Declined' : 'Other';
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, { 'Under Review': 0, 'Approved': 0, 'Declined': 0, 'Other': 0 });
  
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
