
import { Application } from "@/types/planning";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

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
  error
}: ResultsListViewProps) => {
  // Use the visible applications or all applications array, whichever is available
  const appArray = allApplications?.length ? allApplications : applications;
  // Use displayTerm if available, otherwise use searchTerm
  const displayLocation = displayTerm || searchTerm || postcode;

  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto h-[300px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // If error or no applications found, show empty state
  if (error || !applications.length) {
    let errorTitle = "No results found";
    let errorMessage = `We couldn't find any planning applications for ${displayLocation}. Please try another search.`;
    
    if (error) {
      const errorText = error.message || "";
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
        `We encountered an error while searching. ${errorText || "Please try another location or search term."}`;
    }

    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
        <p className="text-gray-500 mb-6">{errorMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  // Otherwise, render the application cards
  return (
    <div className="py-4 space-y-8">
      {applications.map((application) => (
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
    </div>
  );
};
