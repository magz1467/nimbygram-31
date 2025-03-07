
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { Application } from "@/types/planning";

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
  return (
    <SearchResultsList 
      applications={applications}
      isLoading={isLoading}
      onSeeOnMap={onSeeOnMap}
      searchTerm={searchTerm}
      onRetry={onRetry}
    />
  );
};
