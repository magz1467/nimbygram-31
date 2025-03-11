
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
  // Use the visible applications or all applications array, whichever is available
  const appArray = allApplications?.length ? allApplications : applications;
  // Use displayTerm if available, otherwise use searchTerm
  const displayLocation = displayTerm || searchTerm || postcode;
  
  // State to detect long-running searches
  const [isLongSearch, setIsLongSearch] = useState(false);
  
  // State to track loaded applications
  const [loadedApps, setLoadedApps] = useState<Application[]>([]);
  const [visiblePages, setVisiblePages] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Set a timer to detect long-running searches
  useEffect(() => {
    let timer: number | null = null;
    
    if (isLoading && !isLoadingMore) {
      // After 10 seconds of loading, mark as a long search
      timer = window.setTimeout(() => {
        setIsLongSearch(true);
      }, 10000);
    } else {
      setIsLongSearch(false);
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isLoading, isLoadingMore]);

  // Reset loaded apps when applications change completely (new search)
  useEffect(() => {
    if (!isLoadingMore && applications.length > 0) {
      setLoadedApps(applications);
      setVisiblePages(1);
    }
  }, [applications, isLoadingMore]);

  // When new results come in after a page change, add them to loadedApps
  useEffect(() => {
    if (currentPage > 0 && applications.length > 0 && isLoadingMore) {
      // Avoid duplicates by checking IDs
      const existingIds = new Set(loadedApps.map(app => app.id));
      const uniqueNewApps = applications.filter(app => !existingIds.has(app.id));
      
      if (uniqueNewApps.length > 0) {
        setLoadedApps(prev => [...prev, ...uniqueNewApps]);
        setVisiblePages(currentPage + 1);
      }
      
      setIsLoadingMore(false);
    }
  }, [applications, currentPage, loadedApps, isLoadingMore]);

  // Function to load more results
  const handleLoadMore = async () => {
    if (onPageChange && currentPage < totalPages - 1) {
      setIsLoadingMore(true);
      // Use setTimeout to prevent UI freeze
      setTimeout(() => {
        onPageChange(currentPage + 1);
      }, 0);
      return true; // Signal successful load initiation
    }
    return false; // Signal no more pages to load
  };

  // If initial loading, show skeleton cards
  if (isLoading && !isLoadingMore) {
    return <LoadingSkeletons isLongSearch={isLongSearch} onRetry={onRetry} />;
  }

  // Parse error message for better display
  const getErrorInfo = () => {
    let errorTitle = "No results found";
    let errorMessage = `We couldn't find any planning applications for ${displayLocation}. Please try another search.`;
    
    if (error) {
      // Format error message properly to avoid [object Object] display
      let errorText: string;
      
      if (error instanceof Error) {
        errorText = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorText = error && 'message' in error ? String((error as any).message) : 'Unknown error occurred';
      } else {
        errorText = String(error);
      }
      
      const isTimeoutError = errorText.includes("timeout") || errorText.includes("57014") || errorText.includes("statement canceled");
      const isLocationError = errorText.includes("find coordinates") || 
                             errorText.includes("location") ||
                             errorText.includes("Failed to get") ||
                             errorText.includes("INVALID_REQUEST") ||
                             errorText.includes("Geocoder failed");
      
      errorTitle = isTimeoutError ? "Search Timeout" : 
                  isLocationError ? "Location Error" : 
                  "Error loading results";
                  
      errorMessage = isTimeoutError ? 
        `The search for "${displayLocation}" timed out. This area may have too many results or the database is busy. Please try again with a more specific location.` :
        isLocationError ? 
        `We couldn't find the exact location for "${displayLocation}". Please try using a postcode or more specific location name.` :
        `We encountered an error while searching: ${errorText || "Please try another location or search term."}`;
    }

    return { errorTitle, errorMessage };
  };

  // If error or no applications found, show empty state
  if (error || (!applications.length && !loadedApps.length)) {
    const { errorTitle, errorMessage } = getErrorInfo();
    return <ErrorMessage title={errorTitle} message={errorMessage} onRetry={onRetry} />;
  }

  // Otherwise, render the application cards with loaded applications
  return (
    <div className="py-4 space-y-8">
      {/* Display all loaded applications */}
      {loadedApps.map((application) => (
        <SearchResultCard
          key={application.id}
          application={application}
          onSeeOnMap={onSeeOnMap}
          applications={appArray}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          postcode={postcode}
        />
      ))}
      
      {/* "See More" Button */}
      <LoadMoreButton 
        onLoadMore={handleLoadMore}
        loadedCount={loadedApps.length}
        totalCount={totalCount}
        isLastPage={visiblePages >= totalPages}
      />
    </div>
  );
};
