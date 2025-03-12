
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Application } from "@/types/planning";
import { SearchFilters } from "@/hooks/planning/use-planning-search";
import { SortType } from "@/types/application-types";

interface SearchViewContentProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  applications: Application[];
  isLoading: boolean;
  filters: SearchFilters;
  onFilterChange: (type: string, value: any) => void;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  retryCount?: number;
}

export const SearchViewContent = ({
  initialSearch,
  applications = [],
  isLoading,
  filters,
  onFilterChange,
  onError,
  onSearchComplete,
  retryCount = 0
}: SearchViewContentProps) => {
  const componentId = useRef(`svc-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const hasResultsRef = useRef(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeSort, setActiveSort] = useState<SortType>('distance');
  const onSearchCompleteCalledRef = useRef(false);
  const pageSize = 10;

  // Track renders
  renderCountRef.current += 1;
  
  // Log mount/render information
  useEffect(() => {
    console.log(`🟩 SearchViewContent [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      searchTerm: initialSearch?.searchTerm,
      applications: applications.length,
      renderCount: renderCountRef.current
    });
    
    return () => {
      console.log(`🟥 SearchViewContent [${componentId}] UNMOUNTED after ${renderCountRef.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
        searchTerm: initialSearch?.searchTerm,
      });
    };
  }, [componentId, initialSearch?.searchTerm, applications.length]);

  // Track when applications change
  useEffect(() => {
    console.log(`📊 SearchViewContent applications changed [${componentId}]`, {
      count: applications.length,
      isLoading,
      time: new Date().toISOString(),
      renderCount: renderCountRef.current
    });
    
    hasResultsRef.current = applications && applications.length > 0;
  }, [applications, isLoading, componentId]);

  // Track onSearchComplete call
  useEffect(() => {
    console.log(`🔍 SearchViewContent checking onSearchComplete [${componentId}]`, {
      isLoading,
      hasOnSearchComplete: !!onSearchComplete,
      alreadyCalled: onSearchCompleteCalledRef.current,
      time: new Date().toISOString(),
      renderCount: renderCountRef.current
    });
    
    if (onSearchComplete && !isLoading && !onSearchCompleteCalledRef.current) {
      console.log(`✅ SearchViewContent calling onSearchComplete [${componentId}]`);
      onSearchCompleteCalledRef.current = true;
      onSearchComplete();
    }
  }, [isLoading, onSearchComplete, componentId]);

  // Reset page when new results are loaded
  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      console.log(`📄 SearchViewContent resetting page [${componentId}]`);
      setCurrentPage(0);
    }
  }, [applications, isLoading, componentId]);

  // Calculate status counts for the header with explicit initialization
  const statusCounts = applications.reduce((counts: { 'Under Review': number; 'Approved': number; 'Declined': number; 'Other': number }, app) => {
    const status = app.status || 'Other';
    const category = status.includes('Under Review') ? 'Under Review' :
                    status.includes('Approved') ? 'Approved' :
                    status.includes('Declined') ? 'Declined' : 'Other';
    
    // Use the category as a key to increment the count
    counts[category] += 1;
    return counts;
  }, { 'Under Review': 0, 'Approved': 0, 'Declined': 0, 'Other': 0 });

  return (
    <div className="max-w-4xl mx-auto pb-16 pt-0">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        resultCount={applications?.length || 0}
        isLoading={isLoading}
        isMapVisible={showMap}
        onToggleMapView={() => {
          console.log(`🗺️ SearchViewContent toggling map [${componentId}]`);
          setShowMap(!showMap);
        }}
        activeSort={activeSort}
        activeFilters={filters}
        onFilterChange={(type, value) => {
          console.log(`🔍 SearchViewContent filter changed [${componentId}]`, { type, value });
          onFilterChange(type, value);
        }}
        onSortChange={(sortType) => {
          console.log(`🔤 SearchViewContent sort changed [${componentId}]`, { sortType });
          setActiveSort(sortType);
        }}
        statusCounts={statusCounts}
      />

      <div className="px-4 lg:px-6">
        <ResultsContainer
          applications={applications}
          isLoading={isLoading}
          searchTerm={initialSearch.searchTerm}
          displayApplications={applications}
          coordinates={null}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={(id) => {
            console.log(`📌 SearchViewContent marker clicked [${componentId}]`, { id });
            setSelectedId(id);
          }}
        />
      </div>
    </div>
  );
};
