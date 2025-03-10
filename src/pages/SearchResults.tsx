
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { NoResultsView } from "@/components/search/results/NoResultsView";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchState, setSearchState] = useState(location.state);
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchComplete, setSearchComplete] = useState(false);

  // Validate that we have search state
  useEffect(() => {
    // Update search state when location.state changes
    if (location.state) {
      setSearchState(location.state);
    }
    
    if (!location.state?.searchTerm) {
      console.warn('No search term provided in state, redirecting to homepage');
      toast({
        title: "Search Error",
        description: "No search term provided. Please try your search again.",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }

    console.log('📍 Processing search:', {
      type: location.state.searchType,
      term: location.state.searchTerm,
      timestamp: location.state.timestamp
    });
    
    // Ensure we don't have stale data in session storage
    if (typeof window !== 'undefined') {
      // Mark that we need to refresh data
      window.sessionStorage.setItem('forceRefresh', 'true');
      
      // Clear any cached query data to ensure fresh results
      const cacheKeys = Object.keys(window.sessionStorage).filter(key => 
        key.startsWith('tanstack-query-')
      );
      
      cacheKeys.forEach(key => {
        window.sessionStorage.removeItem(key);
      });
    }
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Reset the search complete flag when starting a new search
    setSearchComplete(false);
    setIsError(false);
    setErrorDetails(null);
    
    // Set a global timeout for the search - if it takes more than 2 minutes, consider it failed
    searchTimeoutRef.current = setTimeout(() => {
      if (!searchComplete) {
        console.error('Search timed out after 2 minutes');
        setIsError(true);
        setErrorDetails('The search took too long to complete. Please try searching with a more specific location.');
        
        toast({
          title: "Search Timeout",
          description: "The search took too long. Please try a more specific location.",
          variant: "destructive",
        });
      }
    }, 120000); // 2 minutes
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location.state, navigate, toast]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsError(false);
    setErrorDetails(null);
    setSearchComplete(false);
    
    toast({
      title: "Retrying search",
      description: "Searching again for planning applications...",
    });
    
    // Force refresh by updating the timestamp in the search state
    if (searchState) {
      const updatedState = {
        ...searchState,
        timestamp: Date.now()
      };
      
      // Use replace to avoid adding to history stack
      navigate('/search-results', { 
        state: updatedState,
        replace: true 
      });
      
      // Update local state too
      setSearchState(updatedState);
    }
  };

  // Function to handle errors from SearchView
  const handleError = (error: Error | null) => {
    if (!error) return; // Early return if no error is provided
    
    // Clear any search timeout since we've already detected an error
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    console.error('Search error detected:', error);
    setIsError(true);
    
    // Format the error for display, handling various error types
    let formattedErrorMessage: string;
    
    if (error instanceof Error) {
      formattedErrorMessage = error.message;
    } else if (typeof error === 'object') {
      // Handle when error is an object (but not Error instance)
      formattedErrorMessage = error ? 
        (error.toString() !== '[object Object]' ? 
          error.toString() : 'Unknown error occurred') 
        : 'Unknown error occurred';
      
      // Try to extract message if it exists
      if (error && 'message' in error) {
        formattedErrorMessage = String(error.message);
      }
    } else {
      formattedErrorMessage = String(error);
    }
    
    // Extract more detailed error message if available
    const errorMessage = formattedErrorMessage || '';
    if (errorMessage.includes('timeout') || errorMessage.includes('57014') || errorMessage.includes('statement canceled')) {
      setErrorDetails('The search timed out. This area may have too many results or the database is busy. Try a more specific location.');
    } else if (errorMessage.includes('location') || errorMessage.includes('coordinates') || errorMessage.includes('find')) {
      setErrorDetails(`We couldn't find this location. Please try a more specific UK location name or postcode.`);
    } else {
      setErrorDetails(formattedErrorMessage || 'We encountered an unexpected error. Please try your search again.');
    }
  };

  // Handle search completion
  const handleSearchComplete = () => {
    console.log('Search completed successfully');
    setSearchComplete(true);
    
    // Clear the timeout when search completes successfully
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  };

  // Only render SearchView if we have valid search state
  if (!searchState?.searchTerm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <NoResultsView onPostcodeSelect={(value) => {
            navigate('/search-results', {
              state: {
                searchType: 'postcode',
                searchTerm: value,
                timestamp: Date.now()
              }
            });
          }} />
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
          <h2 className="text-2xl font-bold mb-4">Search Error</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            {errorDetails || 'We had trouble finding planning applications for this location.'}
          </p>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return <SearchView 
    initialSearch={searchState} 
    retryCount={retryCount}
    onError={handleError}
    onSearchComplete={handleSearchComplete}
  />;
};

export default SearchResultsPage;
