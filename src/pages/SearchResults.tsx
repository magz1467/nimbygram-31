
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchCoordinates } from '@/types/search';
import '../utils/debug-helpers';

const SearchResultsPage = () => {
  const location = useLocation();
  const [coordinates, setCoordinates] = React.useState<SearchCoordinates | null>(
    location.state?.coordinates || null
  );

  useEffect(() => {
    // Log page load and state
    console.log('🔍 [SearchResultsPage] Page loaded with state:', location.state);
    console.log('🔍 [SearchResultsPage] Initial coordinates:', coordinates);
    
    // Import diagnostics tools for console access
    import('../utils/search-console-diagnostics')
      .then(module => {
        console.log('✅ Search console diagnostics loaded and available via window.searchConsoleTools');
        (window as any).searchConsoleTools = module.default;
      })
      .catch(err => console.error('❌ Failed to load diagnostics:', err));
    
    // Load debug helpers
    import('../utils/debug-helpers')
      .then(() => console.log('✅ Debug helpers loaded'))
      .catch(err => console.error('❌ Failed to load debug helpers:', err));
  }, [location.state, coordinates]);

  const handleRetry = () => {
    console.log('🔄 [SearchResultsPage] Retry triggered');
    if (coordinates) {
      console.log('🔄 [SearchResultsPage] Refreshing coordinates:', coordinates);
      setCoordinates({ ...coordinates });
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchResults coordinates={coordinates} onRetry={handleRetry} />
      </main>
    </div>
  );
};

export default SearchResultsPage;
