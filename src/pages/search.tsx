
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchResults } from '@/components/search/SearchResults';
import { Header } from '@/components/Header';
import { SearchCoordinates } from '@/types/search';

export default function SearchPage() {
  const location = useLocation();
  const [coordinates, setCoordinates] = useState<SearchCoordinates | null>(
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
}
