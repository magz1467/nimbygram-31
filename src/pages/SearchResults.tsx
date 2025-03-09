
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { NoResultsView } from "@/components/search/results/NoResultsView";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchState = location.state;
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Validate that we have search state
  useEffect(() => {
    if (!searchState?.searchTerm) {
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
      type: searchState.searchType,
      term: searchState.searchTerm,
      timestamp: searchState.timestamp
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
  }, [searchState, navigate, toast]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsError(false);
    setErrorDetails(null);
    
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
    }
  };

  // Function to handle errors from SearchView
  const handleError = (error: Error | null) => {
    if (!error) return; // Early return if no error is provided
    
    console.error('Search error detected:', error);
    setIsError(true);
    
    // Extract more detailed error message if available
    // Fixed: Use message property instead of code which doesn't exist on Error type
    if (error.message?.includes('timeout') || error.message?.includes('57014')) {
      setErrorDetails('The search timed out. This area may have too many results or the database is busy.');
    } else {
      setErrorDetails(error.message || 'Unknown error occurred while searching.');
    }
  };

  // Only render SearchView if we have valid search state
  if (!searchState?.searchTerm) {
    return null;
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
    onError={handleError} // Fixed: handleError function now matches expected signature
  />;
};

export default SearchResultsPage;
