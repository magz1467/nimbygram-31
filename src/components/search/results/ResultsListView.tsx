
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
  isLongSearch?: boolean;
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
  totalCount = 0,
  isLongSearch = false
}: ResultsListViewProps) => {
  // State to track all loaded applications
  const [loadedApplications, setLoadedApplications] = useState<Application[]>([]);

  // Update loaded applications when new applications come in
  useEffect(() => {
    if (applications.length > 0 && !isLoading) {
      if (currentPage === 0) {
        // Reset for new search
        setLoadedApplications(applications);
      } else {
        // Append new results
        setLoadedApplications(prev => {
          const existingIds = new Set(prev.map(app => app.id));
          const uniqueNewApps = applications.filter(app => !existingIds.has(app.id));
          return [...prev, ...uniqueNewApps];
        });
      }
    }
  }, [applications, currentPage, isLoading]);

  // For debugging purposes
  useEffect(() => {
    console.log('ResultsListView state:', {
      applicationsCount: applications.length,
      loadedApplicationsCount: loadedApplications.length,
      isLoading,
      currentPage,
      totalPages,
      isLongSearch
    });
  }, [applications, loadedApplications, isLoading, currentPage, totalPages, isLongSearch]);

  // Function to handle loading more results
  const handleLoadMore = async () => {
    if (onPageChange && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  // If initial loading, show skeleton cards
  if (isLoading && currentPage === 0 && loadedApplications.length === 0) {
    return <LoadingSkeletons isLongSearch={isLongSearch} onRetry={onRetry} />;
  }

  // If error or no applications found, show empty state
  if (error || (!isLoading && loadedApplications.length === 0)) {
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

      {/* Loading state for pagination */}
      {isLoading && currentPage > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && loadedApplications.length > 0 && (
        <LoadMoreButton 
          onLoadMore={handleLoadMore}
          loadedCount={loadedApplications.length}
          totalCount={totalCount}
          isLastPage={currentPage >= totalPages - 1}
        />
      )}
    </div>
  );
};
