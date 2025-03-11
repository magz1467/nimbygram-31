
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Application, FilterType } from "@/types/planning";

interface SearchViewContentProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  applications: Application[];
  isLoading: boolean;
  filters: FilterType;
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

  useEffect(() => {
    hasResultsRef.current = applications && applications.length > 0;
  }, [applications]);

  useEffect(() => {
    if (onSearchComplete && !isLoading) {
      onSearchComplete();
    }
  }, [isLoading, onSearchComplete]);

  return (
    <div className="max-w-5xl mx-auto pb-16 pt-0">
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

      <div className="px-4 lg:px-8">
        <ResultsContainer
          applications={applications}
          isLoading={isLoading}
          searchTerm={initialSearch.searchTerm}
          displayTerm={initialSearch.displayTerm}
        />
      </div>
    </div>
  );
};
