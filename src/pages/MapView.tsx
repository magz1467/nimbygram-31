
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplicationData } from '../hooks/useApplicationData';
import { FilterBar } from '../components/FilterBar';
import { MapComponent } from '../components/MapComponent';
import { StatusCounts } from '@/types/application-types';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const { applications } = useApplicationData(postcode);
  
  // Default status counts for the filter bar
  const statusCounts: StatusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  };
  
  // Count applications by status
  applications.forEach(app => {
    const status = app.status?.toLowerCase();
    if (status?.includes('review') || status?.includes('pending')) {
      statusCounts['Under Review']++;
    } else if (status?.includes('approved') || status?.includes('granted')) {
      statusCounts['Approved']++;
    } else if (status?.includes('declined') || status?.includes('refused')) {
      statusCounts['Declined']++;
    } else {
      statusCounts['Other']++;
    }
  });
  
  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter changed: ${filterType} = ${value}`);
    // Would handle filtering logic here
  };
  
  const handleSortChange = (sortType: string) => {
    console.log(`Sort changed: ${sortType}`);
    // Would handle sorting logic here
  };

  return (
    <div className="h-full">
      <FilterBar 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        activeFilters={{}}
        activeSort="distance"
        statusCounts={statusCounts}
      />
      <div className="h-[calc(100vh-120px)]">
        <MapComponent applications={applications} />
      </div>
    </div>
  );
};

export default MapView;
