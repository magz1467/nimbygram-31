import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchForm } from '@/components/SearchForm';
import { SearchResultCard } from '@/components/SearchResultCard';
import { MapView } from '@/components/map/MapView';
import { useMapViewStore } from '@/store/mapViewStore';
import { useApplicationSearch } from '@/hooks/use-application-search';
import { useApplicationFiltering, SortType, FilterType } from '@/hooks/use-application-filtering';

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  relevanceScore?: number;
  imageUrl?: string;
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMapView, setMapView } = useMapViewStore();
  
  // Get search parameters from URL
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const radius = parseInt(searchParams.get('radius') || '5', 10);
  const viewParam = searchParams.get('view');
  
  // Set map view based on URL parameter
  useEffect(() => {
    if (viewParam === 'map' && !isMapView) {
      setMapView(true);
    } else if (viewParam !== 'map' && isMapView) {
      setMapView(false);
    }
  }, [viewParam, isMapView, setMapView]);
  
  // Search for applications
  const { 
    results, 
    loading, 
    error, 
    updateSearchParams 
  } = useApplicationSearch({
    query,
    location,
    radius
  });
  
  // Filter and sort applications
  const [sortType, setSortType] = useState<SortType>('date');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  const { 
    filteredApplications 
  } = useApplicationFiltering({
    applications: results as Application[],
    initialSortType: sortType,
    initialFilterType: filterType
  });
  
  // Handle search form submission
  const handleSearch = (newQuery: string, newLocation: string, newRadius: number) => {
    const params = new URLSearchParams(searchParams);
    
    if (newQuery) params.set('q', newQuery);
    else params.delete('q');
    
    if (newLocation) params.set('location', newLocation);
    else params.delete('location');
    
    if (newRadius) params.set('radius', newRadius.toString());
    else params.delete('radius');
    
    if (isMapView) params.set('view', 'map');
    else params.delete('view');
    
    setSearchParams(params);
    
    updateSearchParams({
      query: newQuery,
      location: newLocation,
      radius: newRadius
    });
  };
  
  // Handle view toggle
  const handleViewToggle = (mapView: boolean) => {
    setMapView(mapView);
    
    const params = new URLSearchParams(searchParams);
    if (mapView) params.set('view', 'map');
    else params.delete('view');
    
    setSearchParams(params);
  };
  
  // Handle sort change
  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
  };

  return (
    <div className="search-results-page">
      <Header />
      
      <div className="search-container">
        <SearchForm 
          onSearch={handleSearch}
          initialQuery={query}
          initialLocation={location}
          initialRadius={radius}
        />
        
        <div className="view-toggle">
          <button 
            className={!isMapView ? 'active' : ''} 
            onClick={() => handleViewToggle(false)}
          >
            List View
          </button>
          <button 
            className={isMapView ? 'active' : ''} 
            onClick={() => handleViewToggle(true)}
          >
            Map View
          </button>
        </div>
      </div>
      
      <div className="results-container">
        {loading ? (
          <div className="loading">Loading results...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <>
            <div className="results-header">
              <h2>
                {filteredApplications.length} 
                {filteredApplications.length === 1 ? ' result' : ' results'} 
                {query && ` for "${query}"`}
                {location && ` near "${location}"`}
              </h2>
              
              <div className="filters">
                <div className="sort">
                  <label htmlFor="sort">Sort by:</label>
                  <select 
                    id="sort" 
                    value={sortType}
                    onChange={(e) => handleSortChange(e.target.value as SortType)}
                  >
                    <option value="date">Date (newest)</option>
                    <option value="relevance">Relevance</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
                
                <div className="filter">
                  <label htmlFor="filter">Filter:</label>
                  <select 
                    id="filter" 
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                  >
                    <option value="all">All applications</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            {isMapView ? (
              <div className="map-container">
                <MapView 
                  applications={filteredApplications}
                  center={
                    filteredApplications.length > 0 && filteredApplications[0].location
                      ? filteredApplications[0].location
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="results-list">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map(app => (
                    <SearchResultCard 
                      key={app.id} 
                      application={app} 
                    />
                  ))
                ) : (
                  <div className="no-results">
                    No applications found. Try adjusting your search criteria.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
