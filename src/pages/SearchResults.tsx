import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { useSearchResultsPage } from "@/hooks/applications/use-search-results-page";

const SearchResultsPage = () => {
  const {
    searchState,
    retryCount,
    isError,
    errorDetails,
    handleRetry,
    handleError,
    handleSearchComplete,
    handlePostcodeSelect
  } = useSearchResultsPage();

  // If no search state, show the no results view
  if (!searchState?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={handlePostcodeSelect} />;
  }

  // If error, show the error view
  if (isError) {
    return <SearchErrorView errorDetails={errorDetails} onRetry={handleRetry} />;
  }

  // Otherwise, show the search view
  return (
    <SearchView 
      initialSearch={searchState} 
      retryCount={retryCount}
      onError={handleError}
      onSearchComplete={handleSearchComplete}
    />
  );
};

export default SearchResultsPage;
