
import { useState, useEffect } from 'react-router-dom';
import { useApplicationData } from '../hooks/useApplicationData';
import { FilterBar } from '../components/FilterBar';
import { SplitView } from '../components/SplitView';
import { useMapViewStore } from '../store/mapViewStore';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const [activeSort, setActiveSort] = useState('date');
  const { applications, isLoading } = useApplicationData(postcode);
  const { isMapView, setMapView, setApplications } = useMapViewStore();
  
  // Store applications in the mapViewStore for consistency
  useEffect(() => {
    if (applications && applications.length > 0) {
      setApplications(applications);
    }
  }, [applications, setApplications]);
  
  // Check if we should display the map view based on URL state
  useEffect(() => {
    const state = history.state?.usr;
    if (state?.fromMap) {
      setMapView(true);
    }
  }, [setMapView]);
  
  const handleSortChange = (sortValue) => {
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
