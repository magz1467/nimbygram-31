
import { useState, useEffect } from 'react';
import { useSearchState } from './search-views/SearchStateProvider';
import { LoadingView } from './search-views/LoadingView';
import { ErrorView } from './search-views/ErrorView';
import { ResultsView } from './search-views/ResultsView';
import { NoSearchStateView } from './NoSearchStateView';
import { ErrorType, detectErrorType } from '@/utils/errors';
import { StatusCounts } from '@/types/application-types';

export function SearchViewContent() {
  const { 
    initialSearch, 
    loadingState, 
    applications, 
    filters, 
    setFilters,
    retry,
    hasSearched,
    coordinates
  } = useSearchState();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (loadingState.error) {
      // Delay showing the error to avoid flashing
      const timer = setTimeout(() => {
        setShowError(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [loadingState.error]);

  // Initialize statusCounts with proper structure
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  });

  // Calculate status counts from applications
  useEffect(() => {
    if (applications?.length) {
      const counts: StatusCounts = {
        'Under Review': 0,
        'Approved': 0,
        'Declined': 0,
        'Other': 0
      };
      
      applications.forEach(app => {
        const status = app.status?.toLowerCase() || '';
        
        if (status.includes('under review') || status.includes('pending')) {
          counts['Under Review']++;
        } else if (status.includes('approved') || status.includes('granted')) {
          counts['Approved']++;
        } else if (status.includes('declined') || status.includes('refused') || status.includes('rejected')) {
          counts['Declined']++;
        } else {
          counts['Other']++;
        }
      });
      
      setStatusCounts(counts);
    }
  }, [applications]);
  
  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }
  
  // Show error view if there's an error and we've already searched
  if ((loadingState.error || loadingState.stage === 'error') && hasSearched && showError) {
    const error = loadingState.error || new Error('Unknown search error');
    const errorType = (error as any).type || detectErrorType(error);
    
    return (
      <ErrorView 
        error={error} 
        errorType={errorType} 
        onRetry={retry} 
      />
    );
  }
  
  // Show loading view if we're loading
  if (loadingState.isLoading || loadingState.stage !== 'complete') {
    return (
      <LoadingView 
        stage={loadingState.stage}
        isLongRunning={loadingState.longRunning}
        searchTerm={initialSearch.searchTerm}
        onRetry={retry}
      />
    );
  }
  
  // Show results view when we have applications
  return (
    <ResultsView 
      applications={applications}
      searchTerm={initialSearch.searchTerm}
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}
