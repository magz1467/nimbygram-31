
import { useState, useEffect } from 'react';
import { ResultsHeader } from "./ResultsHeader";
import { SearchViewContent } from "./SearchViewContent";
import { NoResultsView } from "./NoResultsView";
import { useSearchResults } from "@/hooks/applications/use-search-results";
import { useSearchViewFilters } from "@/hooks/search/useSearchViewFilters";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string; 
    timestamp?: number;
  };
  retryCount?: number;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}

export const SearchView = ({ 
  initialSearch, 
  retryCount = 0, 
  onError,
  onSearchComplete
}: SearchViewProps) => {
  console.log('🔄 SearchView rendering with initialSearch:', initialSearch);

  // If not provided, use a valid but empty search
  const defaultSearch = initialSearch || {
    searchType: 'postcode' as const,
    searchTerm: '',
  };

  // Pass the search to our component
  return (
    <SearchViewContent
      initialSearch={defaultSearch}
      onError={onError}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
