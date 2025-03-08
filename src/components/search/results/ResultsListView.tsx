
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { Application } from "@/types/planning";
import { useCallback } from "react";

interface ResultsListViewProps {
  applications: Application[];
  isLoading: boolean;
  onSeeOnMap: (id: number) => void;
  searchTerm?: string;
  onRetry?: () => void;
}

export const ResultsListView = ({
  applications,
  isLoading,
  onSeeOnMap,
  searchTerm,
  onRetry,
}: ResultsListViewProps) => {
  // Create a stable handler for the onSeeOnMap callback
  const handleSeeOnMap = useCallback((id: number) => {
    console.log('🗺️ ResultsListView - See on Map clicked for ID:', id);
    onSeeOnMap(id);
  }, [onSeeOnMap]);

  return (
    <SearchResultsList 
      applications={applications}
      isLoading={isLoading}
      onSeeOnMap={handleSeeOnMap}
      searchTerm={searchTerm}
      onRetry={onRetry}
    />
  );
};
