
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchCoordinates } from '@/types/search';

const SearchResultsPage = () => {
  const location = useLocation();
  const [coordinates, setCoordinates] = React.useState<SearchCoordinates | null>(
    location.state?.coordinates || null
  );

  const handleRetry = () => {
    if (coordinates) {
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
