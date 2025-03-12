
import React, { useEffect } from "react";
import { useSpatialSearch } from "@/hooks/use-spatial-search";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SearchCoordinates, SEARCH_RADIUS } from "@/types/search";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import ResultsContainer from "./results/ResultsContainer";
import { searchDiagnostics } from "@/utils/search-diagnostics";

interface SearchResultsProps {
  coordinates: SearchCoordinates | [number, number] | null;
  onRetry: () => void;
}

export function SearchResults({ coordinates, onRetry }: SearchResultsProps) {
  const { data, isLoading, isError, error } = useSpatialSearch(coordinates);

  // Log search diagnostics
  useEffect(() => {
    if (coordinates) {
      // Ensure coordinates are converted to a proper tuple
      const coordsArray: [number, number] = Array.isArray(coordinates) 
        ? [coordinates[0], coordinates[1]] 
        : [coordinates.lat, coordinates.lng];
      
      console.log("🔍 Search initiated for coordinates:", coordinates);
      console.log("🔍 Search radius:", SEARCH_RADIUS, "km");
      searchDiagnostics.logSearch(coordsArray, SEARCH_RADIUS);
    }
    
    if (data) {
      console.log(`📊 Search results: ${data.applications.length} applications found via ${data.method} method`);
      console.log("📊 First few results:", data.applications.slice(0, 3));
      searchDiagnostics.logResults(data.applications, data.method, data.timing?.duration || 0);
    }
    
    if (isError) {
      console.error("❌ Search error:", error);
      searchDiagnostics.logError(error);
    }
  }, [coordinates, data, isError, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
        <span>Searching for planning applications...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Search Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            {error instanceof Error 
              ? error.message 
              : "Failed to retrieve planning applications. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry Search
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.applications.length) {
    return (
      <div className="text-center p-8">
        <div className="mb-4 flex justify-center">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="font-medium text-xl mb-2">No Results Found</h3>
        <p className="text-muted-foreground mb-6">
          No planning applications found within 10km of this location.
          <br />
          Try searching for a different location or postcode.
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Another Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Found {data.applications.length} applications
        </h2>
        {data.timing && (
          <span className="text-sm text-muted-foreground">
            Search took {data.timing.duration}ms using {data.method} method
          </span>
        )}
      </div>

      <ResultsContainer 
        applications={data.applications} 
        isLoading={isLoading} 
        error={error as Error | null} 
      />
    </div>
  );
}

export default SearchResults;
