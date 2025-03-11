
import { Application } from "@/types/planning";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useEffect, useState } from "react";
import { LoadingSkeletons } from "./components/LoadingSkeletons";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadMoreButton } from "./components/LoadMoreButton";

interface ResultsListViewProps {
  applications: Application[];
  isLoading: boolean;
  onSeeOnMap: (id: number) => void;
  searchTerm?: string;
  displayTerm?: string; 
  onRetry?: () => void;
  selectedId?: number | null;
  coordinates?: [number, number] | null;
  handleMarkerClick?: (id: number) => void;
  allApplications?: Application[];
  postcode?: string;
  error?: Error | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
}

export const ResultsListView = ({ 
  applications, 
  isLoading, 
  onSeeOnMap,
  searchTerm,
  displayTerm, 
  onRetry,
  selectedId,
  coordinates,
  handleMarkerClick,
  allApplications,
  postcode,
  error,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  totalCount = 0
}: ResultsListViewProps) => {
  // State to track all loaded applications
  const [loadedApplications, setLoadedApplications] = useState<Application[]>([]);
  const [isLongSearchDetected, setIsLongSearchDetected] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Effect to detect long-running searches
  useEffect(() => {
    if (isLoading && initialLoad) {
      // Set a timeout to detect long-running searches (more than 5 seconds)
      const timeoutId = setTimeout(() => {
        setIsLongSearchDetected(true);
      }, 5000);
      
      // Clean up the timeout if the loading state changes before the timeout
      return () => clearTimeout(timeoutId);
    } else {
      // Reset the long search state when loading is complete
      setIsLongSearchDetected(false);
      
      // If we've loaded data, mark initial load as complete
      if (!isLoading && applications.length > 0) {
        setInitialLoad(false);
      }
    }
  }, [isLoading, applications.length, initialLoad]);

  // Update loaded applications when new applications come in
  useEffect(() => {
    if (applications.length > 0) {
      if (currentPage === 0) {
        // Reset for new search
        setLoadedApplications(applications);
      } else {
        // Append new results, avoiding duplicates
        setLoadedApplications(prev => {
          const existingIds = new Set(prev.map(app => app.id));
          const uniqueNewApps = applications.filter(app => !existingIds.has(app.id));
          return [...prev, ...uniqueNewApps];
        });
      }
    }
  }, [applications, currentPage]);

  // Function to handle loading more results
  const handleLoadMore = async () => {
    if (onPageChange && currentPage < (totalPages - 1)) {
      onPageChange(currentPage + 1);
    }
  };

  // If initial loading, show skeleton cards
  if (isLoading && initialLoad) {
    return <LoadingSkeletons isLongSearch={isLongSearchDetected} onRetry={onRetry} />;
  }

  // If error or no applications found, show empty state
  if (error || (!applications.length && !loadedApplications.length)) {
    return (
      <ErrorMessage 
        title={error ? "Error loading results" : "No results found"}
        message={error ? error.message : `We couldn't find any planning applications for ${displayTerm || searchTerm || postcode}. Please try another search.`}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="py-4 space-y-8">
      {/* Display all loaded applications */}
      <div className="space-y-8">
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
              coordinates={coordinates}
              handleMarkerClick={handleMarkerClick}
              isLoading={isLoading}
              postcode={postcode}
            />
          </div>
        ))}
      </div>

      {/* Load More Button with improved loading state */}
      {loadedApplications.length > 0 && totalCount > loadedApplications.length && (
        <LoadMoreButton 
          onLoadMore={handleLoadMore}
          loadedCount={loadedApplications.length}
          totalCount={totalCount}
          isLastPage={currentPage >= totalPages - 1}
          isLoading={isLoading && !initialLoad}
        />
      )}
    </div>
  );
};
