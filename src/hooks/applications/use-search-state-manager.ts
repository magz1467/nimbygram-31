
import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

export const useSearchStateManager = (initialPostcode = '') => {
  const location = useLocation();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Track search performance
  useEffect(() => {
    if (searchStartTime && isSearching) {
      const timeoutId = setTimeout(() => {
        if (isSearching) {
          const elapsedTime = Date.now() - searchStartTime;
          console.warn(`Search is taking longer than expected (${elapsedTime}ms) for postcode ${postcode}`);
          
          // Add to errors list after 10 seconds
          if (elapsedTime > 10000) {
            setSearchErrors(prev => [...prev, `Search timeout for ${postcode}`]);
            toast({
              title: "Search is taking longer than expected",
              description: "We're still looking for planning applications in this area.",
              variant: "default",
            });
          }
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchStartTime, isSearching, toast, postcode]);
  
  // Handle postcode selection
  const handlePostcodeSelect = useCallback((newPostcode: string) => {
    if (!newPostcode) {
      toast({
        title: "Invalid Postcode",
        description: "Please enter a valid postcode to search.",
        variant: "destructive",
      });
      return;
    }
    
    // Log all searches for debugging
    console.log('🔍 Starting new postcode search:', newPostcode);
    setIsSearching(true);
    setPostcode(newPostcode);
    setSearchStartTime(Date.now());
    // Reset any previous search points to ensure fresh search
    setSearchPoint(null);
    
    // Clear previous search errors for this new search
    setSearchErrors([]);
  }, [toast]);

  // Log search completion
  const completeSearch = useCallback((results: number) => {
    if (searchStartTime) {
      const endTime = Date.now();
      const duration = endTime - searchStartTime;
      console.log(`📊 Search completed in ${duration}ms with ${results} results for "${postcode}"`);
      
      // Track results for zero-result searches for debugging
      if (results === 0) {
        setSearchErrors(prev => [...prev, `No results found for ${postcode}`]);
        console.warn(`⚠️ Zero results found for "${postcode}"`);
      }
    }
    setIsSearching(false);
  }, [searchStartTime, postcode]);

  return {
    postcode,
    setPostcode,
    isSearching, 
    setIsSearching,
    searchStartTime,
    setSearchStartTime,
    searchPoint,
    setSearchPoint,
    handlePostcodeSelect,
    completeSearch,
    searchErrors,
    locationState: location.state
  };
};
