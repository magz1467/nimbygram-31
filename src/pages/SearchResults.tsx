
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  
  // Log the search params but don't trigger any additional effects
  if (location.state?.postcode || location.state?.location) {
    console.log('📍 Search params:', location.state);
  }

  return <SearchView />;
};

export default SearchResultsPage;

