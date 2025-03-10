
import { Application } from "@/types/planning";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { Button } from "@/components/ui/button";
import { RotateCw, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  // Add state to detect long-running searches
  const [isLongSearch, setIsLongSearch] = useState(false);
  
  // Set a timer to detect long-running searches
  useEffect(() => {
    let timer: number | null = null;
    
    if (isLoading) {
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
  }, [isLoading]);

  // State to track loaded applications
  const [loadedApps, setLoadedApps] = useState<Application[]>([]);
  const [visiblePages, setVisiblePages] = useState<number>(1);
  
  // Reset loaded apps when applications change
  useEffect(() => {
    if (applications.length > 0) {
      setLoadedApps(applications);
      setVisiblePages(1);
    }
  }, [applications]);

  // Function to load more results
  const handleLoadMore = () => {
    if (onPageChange && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  // When new results come in after a page change, add them to loadedApps
  useEffect(() => {
    if (currentPage > 0 && applications.length > 0) {
      // Avoid duplicates by checking IDs
      const existingIds = new Set(loadedApps.map(app => app.id));
      const uniqueNewApps = applications.filter(app => !existingIds.has(app.id));
      
      if (uniqueNewApps.length > 0) {
        setLoadedApps(prev => [...prev, ...uniqueNewApps]);
        setVisiblePages(currentPage + 1);
      }
    }
  }, [applications, currentPage]);

  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto h-[300px] animate-pulse"
          >
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
        
        {/* Show message for long-running searches */}
        {isLongSearch && (
          <div className="text-center mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
            <h4 className="text-amber-800 font-medium">Search taking longer than usual</h4>
            <p className="text-amber-700 text-sm mt-1">
              We're still looking for applications in this area. This might be a busy area with many applications.
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="mt-3 gap-2">
                <RotateCw className="h-3 w-3" />
                Try again
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // If error or no applications found, show empty state
  if (error || !applications.length) {
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

    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          {errorMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Otherwise, render the application cards
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
      
      {/* "See More" Button - only show if there are more pages to load */}
      {visiblePages < totalPages && (
        <div className="flex justify-center py-8 border-t mt-6">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLoadMore}
            className="gap-2 px-8"
          >
            See More Results
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="text-sm text-gray-500 ml-4 self-center">
            Showing {loadedApps.length} of {totalCount} results
          </div>
        </div>
      )}
      
      {/* Show completion message when all results are loaded */}
      {visiblePages >= totalPages && totalPages > 1 && (
        <div className="text-center py-6 border-t mt-6">
          <p className="text-sm text-gray-500">
            Showing all {loadedApps.length} results
          </p>
        </div>
      )}
    </div>
  );
};
