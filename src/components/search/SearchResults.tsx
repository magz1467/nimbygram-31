
import React, { useEffect } from "react";
import { useSpatialSearch } from "@/hooks/use-spatial-search";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SearchCoordinates, SEARCH_RADIUS } from "@/types/search";
import { Loader2 } from "lucide-react";
import ResultsContainer from "./results/ResultsContainer";
import { searchDiagnostics } from "@/utils/search-diagnostics";

interface SearchResultsProps {
  coordinates: SearchCoordinates | null;
  onRetry: () => void;
}

export function SearchResults({ coordinates, onRetry }: SearchResultsProps) {
  const { data, isLoading, isError, error } = useSpatialSearch(coordinates);

  // Log search diagnostics
  useEffect(() => {
    if (coordinates) {
      searchDiagnostics.logSearch([coordinates.lat, coordinates.lng], SEARCH_RADIUS);
    }
    if (data) {
      searchDiagnostics.logResults(data.applications, data.method, data.timing?.duration || 0);
    }
    if (isError) {
      searchDiagnostics.logError(error);
    }
  }, [coordinates, data, isError, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Searching for planning applications...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Search Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">Failed to retrieve planning applications. Please try again.</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            Retry Search
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.applications.length) {
    return (
      <div className="text-center p-8">
        <h3 className="font-medium mb-2">No Results Found</h3>
        <p className="text-sm text-muted-foreground">
          No planning applications found within {SEARCH_RADIUS}km radius.
        </p>
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
