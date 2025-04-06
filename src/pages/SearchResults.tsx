
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ResultsContainer } from "@/components/search/results/ResultsContainer";
import { SearchView } from "@/components/search/results/SearchView";
import { Header } from "@/components/Header";
import { Application } from "@/types/planning";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// This component needs to render the Header since it's not using AppLayout directly
const SearchResultsPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get applications from location state or initialize empty array
  const applications = location.state?.applications || [];
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  // Extract search parameters
  const searchTerm = searchParams.get("postcode") || searchParams.get("search") || "";
  const displayTerm = searchTerm || "Recent applications";
  
  // Get coordinates from location state
  const coordinates: [number, number] | null = location.state?.coordinates || null;
  
  // Additional state for status tracking
  const [isLoading, setIsLoading] = useState(false);
  const [hasPartialResults, setHasPartialResults] = useState(false);
  const [isSearchInProgress, setIsSearchInProgress] = useState(false);

  const handleMarkerClick = (id: number) => {
    setSelectedId(id);
  };

  // Create initialSearch object for the SearchView component
  const initialSearch = searchTerm ? {
    searchType: 'postcode' as const,
    searchTerm,
    displayTerm,
    timestamp: Date.now()
  } : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <SearchView
          initialSearch={initialSearch}
          applications={applications}
          isLoading={isLoading}
          searchTerm={searchTerm}
          displayTerm={displayTerm}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={handleMarkerClick}
          hasPartialResults={hasPartialResults}
          isSearchInProgress={isSearchInProgress}
        />
      </main>
    </div>
  );
};

export default SearchResultsPage;
