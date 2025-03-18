
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplicationsData } from '@/hooks/use-applications-data';
import { PlanningApplicationList } from '@/components/PlanningApplicationList';
import { FilterBar } from '@/components/FilterBar';
import { MapToggle } from '@/components/MapToggle';
import { useMapViewStore } from '@/store/mapViewStore';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode') || '';
  const { applications, isLoading, error, coordinates, statusCounts } = useApplicationsData({ postcode });
  const { isMapView, setSelectedId } = useMapViewStore();
  const [activeSort, setActiveSort] = useState('distance');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSortChange = (sortType: string) => {
    setActiveSort(sortType);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSelectApplication = (id: number | null) => {
    setSelectedId(id);
  };

  if (isLoading) {
    return <div className="p-4">Loading applications...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="search-results-page">
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">
          {applications.length} Applications near {postcode}
        </h1>
        <MapToggle />
      </div>

      <div className="p-4">
        <FilterBar 
          onFilterChange={handleFilterChange} 
          onSortChange={handleSortChange}
          activeFilters={activeFilters} 
          activeSort={activeSort}
          statusCounts={statusCounts}
        />

        {isMapView ? (
          <div className="map-view mt-4">
            <p>Map View - Coming soon</p>
          </div>
        ) : (
          <div className="list-view mt-4">
            <PlanningApplicationList 
              applications={applications} 
              postcode={postcode}
              onSelectApplication={handleSelectApplication}
              activeSort={activeSort as any}
              coordinates={coordinates || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
