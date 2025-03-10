
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterBarSection } from "./FilterBarSection";
import { ResultsContainer } from "./ResultsContainer";
import { LoadingOverlay } from "@/components/applications/dashboard/components/LoadingOverlay";
import { Application } from "@/types/planning";

interface SearchViewContentProps {
  isLoading: boolean;
  coordinates: [number, number] | null;
  hasSearched: boolean;
  applications: Application[] | undefined;
  activeFilters: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort: string;
  handleFilterChange: (filterType: string, value: string) => void;
  handleSortChange: (sortType: string) => void;
  statusCounts: Record<string, number>;
  displayApplications: Application[];
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  handleMarkerClick: (id: number) => void;
  searchTerm?: string;
  displayTerm?: string;
  onRetry?: () => void;
  error?: Error | null;
}

export const SearchViewContent = ({
  isLoading,
  coordinates,
  hasSearched,
  applications,
  activeFilters,
  activeSort,
  handleFilterChange,
  handleSortChange,
  statusCounts,
  displayApplications,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  searchTerm,
  displayTerm,
  onRetry,
  error
}: SearchViewContentProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isLoading && <LoadingOverlay />}
      
      <div className="w-full border-t">
        <div className={`mx-auto px-2 ${isMobile ? 'max-w-full' : 'container px-4'}`}>
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between p-1.5 overflow-hidden">
              <FilterBarSection
                coordinates={coordinates}
                hasSearched={hasSearched}
                isLoading={isLoading}
                applications={applications || []}
                activeFilters={activeFilters}
                activeSort={activeSort}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                statusCounts={statusCounts}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ResultsContainer
        displayApplications={displayApplications}
        applications={applications || []}
        coordinates={coordinates}
        showMap={showMap}
        setShowMap={setShowMap}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        handleMarkerClick={handleMarkerClick}
        isLoading={isLoading}
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        onRetry={onRetry}
        error={error}
      />
    </>
  );
};
