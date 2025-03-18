
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar';
import { SplitView } from '../components/SplitView';
import { useMapViewStore } from '../store/mapViewStore';
import { useApplicationData } from '../hooks/useApplicationData';
import { SortType } from '@/types/application-types';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const [activeSort, setActiveSort] = useState<SortType>('distance');
  const { applications } = useApplicationData(postcode);
  const { isMapView, setMapView, setApplications } = useMapViewStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Store applications in the mapViewStore for consistency
  useEffect(() => {
    if (applications && applications.length > 0) {
      setApplications(applications);
      setIsLoading(false);
    }
  }, [applications, setApplications]);
  
  // Check if we should display the map view based on URL state
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.fromMap) {
      setMapView(true);
    }
  }, [setMapView]);
  
  const handleSortChange = (sortValue: SortType) => {
    setActiveSort(sortValue);
    // Implement your sorting logic here
  };
  
  if (isLoading) {
    return <div className="p-4">Loading applications...</div>;
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <FilterBar 
        activeSort={activeSort} 
        onSortChange={handleSortChange} 
      />
      <SplitView applications={applications} />
    </div>
  );
}

export default SearchResultsPage;
