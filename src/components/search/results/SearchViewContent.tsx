import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Application } from "@/types/planning";
import { SearchFilters } from "@/hooks/planning/use-planning-search";

interface SearchViewContentProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  applications: Application[];
  isLoading: boolean;
  filters: SearchFilters;
  onFilterChange: (type: string, value: any) => void;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  retryCount?: number;
}

export const SearchViewContent = ({
  initialSearch,
  applications = [],
  isLoading,
  filters,
  onFilterChange,
  onError,
  onSearchComplete,
  retryCount = 0
}: SearchViewContentProps) => {
  const hasResultsRef = useRef(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    hasResultsRef.current = applications && applications.length > 0;
  }, [applications]);

  useEffect(() => {
    if (onSearchComplete && !isLoading) {
      onSearchComplete();
    }
  }, [isLoading, onSearchComplete]);

  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      setCurrentPage(0);
    }
  }, [applications, isLoading]);

  return (
    <div className="max-w-4xl mx-auto pb-16 pt-0">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        displayTerm={initialSearch.displayTerm}
        resultsCount={applications?.length || 0}
        isLoading={isLoading}
        hasSearched={true}
        activeFilters={filters}
        onFilterChange={onFilterChange}
        applications={applications}
      />

      <div className="px-4 lg:px-6">
        <ResultsContainer
          applications={applications}
          isLoading={isLoading}
          searchTerm={initialSearch.searchTerm}
          displayTerm={initialSearch.displayTerm}
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
};
