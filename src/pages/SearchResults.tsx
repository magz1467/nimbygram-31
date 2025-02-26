
import { SearchView } from "@/components/search/results/SearchView";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SearchResultsPage = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Only dispatch if we have search params
    if (location.state?.postcode || location.state?.location) {
      console.log('📍 Search params detected:', location.state);
    }
  }, [location]);

  return <SearchView />;
};

export default SearchResultsPage;
