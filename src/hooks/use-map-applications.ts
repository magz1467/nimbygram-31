
import { useState, useEffect } from "react";
import { Application } from "@/types/planning";
import { toast } from "@/hooks/use-toast";
import { fetchNearbyApplications } from "@/services/applications/fetch-nearby-applications";
import { transformAndSortApplications } from "@/services/applications/transforms";

export const useMapApplications = (coordinates?: [number, number] | null) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSearchedCoords, setLastSearchedCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      // Skip if coordinates haven't changed from last search
      if (lastSearchedCoords && coordinates && 
          lastSearchedCoords[0] === coordinates[0] && 
          lastSearchedCoords[1] === coordinates[1] &&
          applications.length > 0 && !error) {
        console.log('🔍 Skipping fetch - using cached results for same coordinates');
        return;
      }
      
      console.log('🔍 Starting to fetch property data...');
      console.log('🌍 Search coordinates:', coordinates);
      setIsLoading(true);
      setError(null);
      
      try {
        if (!coordinates) {
          console.log('⚠️ No coordinates provided, skipping fetch');
          setApplications([]);
          setIsLoading(false);
          return;
        }

        // Keep track of coordinates we're searching
        setLastSearchedCoords(coordinates);

        // Fixed 10km radius
        const radius = 10;
        console.log(`🔍 Searching with ${radius}km radius`);
        
        // Fetch nearby applications with reduced radius
        const properties = await fetchNearbyApplications(coordinates, radius);
        
        if (!properties) {
          setError(new Error("Failed to fetch properties"));
          setApplications([]);
          setIsLoading(false);
          
          if (retryCount < 2) {
            // Auto-retry once
            console.log(`Auto-retrying (attempt ${retryCount + 1}/2)`);
            setRetryCount(prev => prev + 1);
          } else {
            toast({
              title: "Error loading properties",
              description: "Please try again later or search for a different location",
              variant: "destructive"
            });
          }
          return;
        }

        // Transform and sort applications
        const sortedData = transformAndSortApplications(properties, coordinates);
        setApplications(sortedData);
        setRetryCount(0); // Reset retry count on success

        if (sortedData.length === 0) {
          toast({
            title: "No properties found",
            description: "No properties found within 10km of this location. Try searching for a different area.",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        
        // Add more specific error message for timeouts
        if (String(error).includes('timeout') || String(error).includes('57014')) {
          errorInstance.message = "Search timed out. Try a more specific location or try again later.";
        }
        
        setError(errorInstance);
        setApplications([]);
        
        toast({
          title: "Error loading properties",
          description: errorInstance.message || "Please try again later or search for a different location",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        console.log('🏁 Property fetch completed');
      }
    };

    fetchPropertyData();
  }, [coordinates, retryCount]);

  // Expose retry functionality
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return { applications, isLoading, error, retry };
};
