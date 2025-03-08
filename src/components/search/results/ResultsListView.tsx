
import { Application } from "@/types/planning";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsListViewProps {
  applications: Application[];
  isLoading: boolean;
  onSeeOnMap?: (id: number) => void;
  searchTerm?: string;
  onRetry?: () => void;
}

export const ResultsListView = ({ 
  applications, 
  isLoading, 
  onSeeOnMap,
  searchTerm,
  onRetry 
}: ResultsListViewProps) => {
  const isMobile = useIsMobile();

  const handleSeeOnMap = (id: number) => {
    console.log('💡 See on map button clicked');
    console.log('📍 See on map clicked for application:', id);
    
    if (onSeeOnMap) {
      onSeeOnMap(id);
    }
  };

  return (
    <div className="p-4">
      <SearchResultsList 
        applications={applications}
        isLoading={isLoading}
        onSeeOnMap={handleSeeOnMap}
        searchTerm={searchTerm}
        onRetry={onRetry}
      />
    </div>
  );
};
