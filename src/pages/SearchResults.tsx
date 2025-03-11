
import { SearchView } from "@/components/search/results/SearchView";
import { SearchErrorView } from "@/components/search/results/SearchErrorView";
import { NoSearchStateView } from "@/components/search/results/NoSearchStateView";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const [error, setError] = useState<Error | null>(null);
  const searchState = location.state;

  if (!searchState?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  if (error) {
    return <SearchErrorView errorDetails={error.message} onRetry={() => window.location.reload()} />;
  }

  return (
    <SearchView 
      initialSearch={searchState}
      onError={setError}
      onSearchComplete={() => console.log('Search complete')}
    />
  );
};

export default SearchResultsPage;
