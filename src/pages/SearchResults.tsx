import React from 'react';
import { useMapViewStore } from '../store/mapViewStore';

function SearchResults() {
  const { isMapView } = useMapViewStore();
  
  return (
    <div className="search-results">
      <h1>Search Results</h1>
      {isMapView ? (
        <div className="map-view">
          <p>Map View is active</p>
          {/* Map component would go here */}
        </div>
      ) : (
        <div className="list-view">
          <p>List View is active</p>
          {/* List of results would go here */}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
