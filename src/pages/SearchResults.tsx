
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const searchState = location.state;

  // Only log if we have valid search state
  if (searchState?.searchTerm) {
    console.log('📍 Processing search:', {
      type: searchState.searchType,
      term: searchState.searchTerm,
      timestamp: searchState.timestamp
    });
  }

  return <SearchView />;
};

export default SearchResultsPage;
