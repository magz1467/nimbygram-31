
import { Application } from "@/types/planning";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { LoadMoreButton } from "./LoadMoreButton";

interface ResultsListProps {
  loadedApplications: Application[];
  applications: Application[];
  allApplications?: Application[];
  onSeeOnMap: (id: number) => void;
  selectedId?: number | null;
  coordinates?: [number, number] | null;
  handleMarkerClick?: (id: number) => void;
  isLoading?: boolean;
  postcode?: string;
  isLastPage: boolean;
  onRetry?: () => void;
  handleLoadMore: () => Promise<void>;
}

export const ResultsList = ({
  loadedApplications,
  applications,
  allApplications = [],
  onSeeOnMap,
  selectedId,
  coordinates,
  handleMarkerClick,
  isLoading = false,
  postcode = "",
  isLastPage,
  onRetry,
  handleLoadMore
}: ResultsListProps) => {
  // Make sure coordinates are valid before passing them
  const validSearchCoordinates = coordinates ? (Array.isArray(coordinates) && coordinates.length === 2 ? coordinates as [number, number] : undefined) : undefined;

  return (
    <div className="py-4">
      <div className="max-w-lg mx-auto space-y-6">
        {loadedApplications.map((application) => (
          <div 
            key={application.id}
            className="animate-fade-in"
          >
            <SearchResultCard
              application={application}
              onSeeOnMap={onSeeOnMap}
              applications={allApplications}
              selectedId={selectedId}
              coordinates={validSearchCoordinates} // Pass validated coordinates
              handleMarkerClick={handleMarkerClick}
              isLoading={isLoading}
              postcode={postcode}
            />
          </div>
        ))}
      </div>

      {applications.length > loadedApplications.length && (
        <div className="mt-8 max-w-lg mx-auto">
          <LoadMoreButton 
            onLoadMore={handleLoadMore}
            loadedCount={loadedApplications.length}
            totalCount={applications.length}
            isLastPage={isLastPage}
            hasError={false}
            onRetry={onRetry}
          />
        </div>
      )}
    </div>
  );
};
