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
  const [loadedApplications, setLoadedApplications] = useState<Application[]>([]);
  const [isLongSearchDetected, setIsLongSearchDetected] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setIsLongSearchDetected(true);
      }, 20000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsLongSearchDetected(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (applications && applications.length > 0 && !isLoading) {
      if (currentPage === 0) {
        setLoadedApplications(applications.slice(0, pageSize));
      } else {
        setLoadedApplications(prev => {
          const existingIds = new Set(prev.map(app => app.id));
          const uniqueNewApps = applications
            .slice(0, (currentPage + 1) * pageSize)
            .filter(app => !existingIds.has(app.id));
          return [...prev, ...uniqueNewApps];
        });
      }
    }
  }, [applications, currentPage, isLoading, pageSize]);

  const handleLoadMore = async () => {
    if (onPageChange && currentPage < Math.ceil(applications.length / pageSize) - 1) {
      onPageChange(currentPage + 1);
    }
  };

  if (isLoading && currentPage === 0) {
    return (
      <div>
        <LoadingSkeletons isLongSearch={isLongSearchDetected} onRetry={onRetry} />
        {isLongSearchDetected && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
            <h3 className="text-amber-800 font-medium mb-1">This search is taking longer than usual</h3>
            <p className="text-sm text-amber-700">
              We're still looking for planning applications in this area. You can continue waiting or try a more specific search.
            </p>
          </div>
        )}
      </div>
    );
  }

  const isTimeoutError = error && 
    (error.message.includes('timeout') || 
     error.message.includes('57014') || 
     error.message.includes('canceling statement'));

  if (error || (!applications?.length && !loadedApplications?.length)) {
    return (
      <ErrorMessage 
        title={isTimeoutError ? "Search Timeout" : (error ? "Error loading results" : "No results found")}
        message={
          isTimeoutError ? 
            `The search for "${displayTerm || searchTerm || postcode}" is taking too long. Please try a more specific location or different filters.` :
            (error ? error.message : `We couldn't find any planning applications for ${displayTerm || searchTerm || postcode}. Please try another search.`)
        }
        onRetry={onRetry}
      />
    );
  }

  const remainingCount = applications.length - loadedApplications.length;
  const isLastPage = loadedApplications.length >= applications.length;

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
              coordinates={coordinates}
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
