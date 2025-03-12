
import { Application } from "@/types/planning";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useEffect, useState } from "react";
import { LoadingSkeletons } from "./components/LoadingSkeletons";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadMoreButton } from "./components/LoadMoreButton";
import { Clock } from "lucide-react";

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
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const pageSize = 10;

  // Track if loading has ever started to prevent showing "no results" too early
  useEffect(() => {
    if (isLoading && !hasStartedLoading) {
      setHasStartedLoading(true);
      setInitialLoadComplete(false);
    }
    
    // When loading completes after having started, mark initial load as complete
    if (!isLoading && hasStartedLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading, hasStartedLoading, initialLoadComplete]);

  // Reset search timer when a new search starts
  useEffect(() => {
    if (isLoading) {
      setSearchStartTime(Date.now());
      setIsLongSearchDetected(false);
      setShowErrorMessage(false);
      
      // After 5 seconds of loading, show "long search" message
      const timeoutId = setTimeout(() => {
        setIsLongSearchDetected(true);
      }, 5000);
      
      // Only show error message after 30 seconds if we're still loading 
      // and have no results
      const errorTimeoutId = setTimeout(() => {
        if (applications.length === 0) {
          setShowErrorMessage(true);
        }
      }, 30000);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(errorTimeoutId);
      };
    } else {
      setSearchStartTime(null);
    }
  }, [isLoading, applications.length]);

  useEffect(() => {
    if (applications && applications.length > 0 && !isLoading) {
      // Hide any error messages if we got results
      setShowErrorMessage(false);
      
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

  // Always show loading skeleton during initial load or active search
  if (isLoading || (!initialLoadComplete && hasStartedLoading)) {
    return (
      <div>
        <LoadingSkeletons isLongSearch={isLongSearchDetected} onRetry={onRetry} />
        
        {isLongSearchDetected && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-amber-800 font-medium mb-1">This search is taking longer than usual</h3>
                <p className="text-sm text-amber-700">
                  We're still looking for planning applications in this area. Results will appear as soon as they're ready.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {showErrorMessage && error && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
            <h3 className="text-amber-800 font-medium mb-1">Search is still in progress</h3>
            <p className="text-sm text-amber-700 mb-2">
              We're experiencing some delays with this search. You can wait for it to complete or try again with a more specific location.
            </p>
            {onRetry && (
              <button 
                onClick={onRetry} 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Retry with current search
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Only show full error when we're not loading anymore and have no results
  const isTimeoutError = error && 
    (error.message.includes('timeout') || 
     error.message.includes('57014') || 
     error.message.includes('canceling statement'));

  if (!isLoading && error && (!applications?.length && !loadedApplications?.length)) {
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

  // Show "no results" message only when initial load is complete and we have no results
  if (!isLoading && !error && (!applications?.length && !loadedApplications?.length) && initialLoadComplete) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any planning applications for {displayTerm || searchTerm || postcode}.
        </p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
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
