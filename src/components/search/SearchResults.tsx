
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
  console.log('🔍 [SearchResults] Component rendering with coordinates:', coordinates);
  
  const { data, isLoading, isError, error } = useSpatialSearch(coordinates);

  useEffect(() => {
    console.log('🔍 [SearchResults] Effect running with dependencies:', { 
      hasCoordinates: !!coordinates, 
      isLoading, 
      isError, 
      hasData: !!data,
      errorMessage: error instanceof Error ? error.message : 'No error'
    });
    
    if (coordinates) {
      console.log('🔍 [SearchResults] Processing coordinates:', coordinates);
      
      // Ensure coordinates are converted to a proper tuple
      const coordsArray: [number, number] = Array.isArray(coordinates) 
        ? coordinates.length === 2 ? [coordinates[0], coordinates[1]] as [number, number] : [0, 0]
        : [coordinates.lat, coordinates.lng];
      
      console.log("🔍 [SearchResults] Search initiated with coordinates:", coordsArray);
      console.log("🔍 [SearchResults] Search radius:", SEARCH_RADIUS, "km");
      
      try {
        searchDiagnostics.logSearch(coordsArray, SEARCH_RADIUS);
        console.log('✅ [SearchResults] Search diagnostics logged successfully');
      } catch (err) {
        console.error('❌ [SearchResults] Failed to log search diagnostics:', err);
      }
    } else {
      console.log('⚠️ [SearchResults] No coordinates available for search');
    }
    
    if (data) {
      console.log(`📊 [SearchResults] Search results received: ${data.applications.length} applications found via ${data.method} method`);
      console.log('📊 [SearchResults] Search timing:', data.timing);
      
      if (data.applications.length > 0) {
        console.log("📊 [SearchResults] First few results:", data.applications.slice(0, 3));
      } else {
        console.log("⚠️ [SearchResults] No applications found in search results");
      }
      
      try {
        searchDiagnostics.logResults(data.applications, data.method, data.timing?.duration || 0);
        console.log('✅ [SearchResults] Results diagnostics logged successfully');
      } catch (err) {
        console.error('❌ [SearchResults] Failed to log results diagnostics:', err);
      }
    }
    
    if (isError) {
      console.error("❌ [SearchResults] Search error occurred:", error);
      console.error("❌ [SearchResults] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      try {
        searchDiagnostics.logError(error);
        console.log('✅ [SearchResults] Error diagnostics logged successfully');
      } catch (err) {
        console.error('❌ [SearchResults] Failed to log error diagnostics:', err);
      }
    }
  }, [coordinates, data, isLoading, isError, error]);

  console.log('🔍 [SearchResults] Current render state:', { isLoading, isError, hasData: !!data });

  if (isLoading) {
    console.log('⏳ [SearchResults] Rendering loading state');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
        <span>Searching for planning applications...</span>
      </div>
    );
  }

  if (isError) {
    console.log('❌ [SearchResults] Rendering error state:', error);
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
    console.log('⚠️ [SearchResults] Rendering no results state');
    return (
      <div className="text-center p-8">
        <div className="mb-4 flex justify-center">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="font-medium text-xl mb-2">No Results Found</h3>
        <p className="text-muted-foreground mb-6">
          No planning applications found within {SEARCH_RADIUS}km of this location.
          <br />
          Try searching for a different location or postcode.
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Another Search
        </Button>
      </div>
    );
  }

  console.log(`✅ [SearchResults] Rendering results: ${data.applications.length} applications`);
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
