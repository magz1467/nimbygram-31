import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import PlanningApplicationList from '../components/PlanningApplicationList';
import LoadingSpinner from '../components/LoadingSpinner';

// Unified Application interface
interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  location: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  // Optional fields
  distance?: number;
  relevanceScore?: number;
  imageUrl?: string;
  reference?: string;
  applicant?: string;
}

// Simple MapView component
const MapView: React.FC<{
  applications: Application[];
  center?: { lat: number; lng: number };
}> = ({ applications, center }) => (
  <div className="bg-gray-200 p-6 rounded-lg">
    <div className="mb-4 text-center">
      <p className="text-lg font-semibold">Map View Placeholder</p>
      <p className="text-sm text-gray-600">Showing {applications.length} applications</p>
      {center && <p className="text-sm text-gray-600">Centered at: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>}
    </div>
    
    <div className="space-y-2">
      {applications.map(app => (
        <div key={app.id} className="bg-white p-3 rounded shadow-sm">
          <p className="font-medium">{app.title}</p>
          <p className="text-sm text-gray-600">{app.location.address}</p>
        </div>
      ))}
    </div>
  </div>
);

// Sort and filter types
type SortType = 'date' | 'relevance' | 'distance';
type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMapView, setIsMapView] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get search parameters from URL
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const radius = parseInt(searchParams.get('radius') || '5', 10);
  const viewParam = searchParams.get('view');
  
  // Set map view based on URL parameter
  useEffect(() => {
    if (viewParam === 'map' && !isMapView) {
      setIsMapView(true);
    } else if (viewParam !== 'map' && isMapView) {
      setIsMapView(false);
    }
  }, [viewParam, isMapView]);
  
  // Filter and sort state
  const [sortType, setSortType] = useState<SortType>('date');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
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
  };
  
  // Handle view toggle
  const handleViewToggle = (mapView: boolean) => {
    setIsMapView(mapView);
    
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

  // Apply filtering and sorting
  useEffect(() => {
    if (!applications.length) {
      setFilteredApplications([]);
      return;
    }
    
    let filtered = [...applications];
    
    // Apply filters
    if (filterType !== 'all') {
      filtered = filtered.filter(app => {
        const status = app.status.toLowerCase();
        if (filterType === 'pending') return status.includes('pending') || status.includes('progress');
        if (filterType === 'approved') return status.includes('approved');
        if (filterType === 'rejected') return status.includes('rejected');
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortType === 'relevance' && a.relevanceScore !== undefined && b.relevanceScore !== undefined) {
        return b.relevanceScore - a.relevanceScore;
      }
      if (sortType === 'distance' && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });
    
    setFilteredApplications(filtered);
  }, [applications, filterType, sortType]);

  // Fetch applications when search parameters change
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockApplications: Application[] = [
          {
            id: '1',
            title: 'Two-story extension to existing dwelling',
            description: 'Proposed two-story side extension to create additional bedroom and enlarged kitchen area.',
            status: 'Pending',
            date: '2023-05-15',
            location: { 
              lat: 51.505, 
              lng: -0.09,
              address: '123 High Street, Anytown, AN1 2BC'
            },
            reference: 'APP/2023/0123',
            imageUrl: 'https://via.placeholder.com/400x300?text=House+Extension'
          },
          {
            id: '2',
            title: 'Change of use from retail to restaurant',
            description: 'Application for change of use from Class E(a) retail to Class E(b) restaurant with outdoor seating area.',
            status: 'Approved',
            date: '2023-04-22',
            location: { 
              lat: 51.507, 
              lng: -0.095,
              address: '45 Market Square, Anytown, AN1 3DF'
            },
            reference: 'APP/2023/0089',
            imageUrl: 'https://via.placeholder.com/400x300?text=Restaurant'
          },
          {
            id: '3',
            title: 'New residential development',
            description: 'Construction of 12 new residential units with associated parking and landscaping.',
            status: 'In Progress',
            date: '2023-06-01',
            location: { 
              lat: 51.51, 
              lng: -0.1,
              address: 'Land at West Road, Anytown, AN2 4GH'
            },
            reference: 'APP/2023/0156',
            imageUrl: 'https://via.placeholder.com/400x300?text=Housing+Development'
          }
        ];
        
        // Filter by query if provided
        let filtered = mockApplications;
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(app => 
            app.title.toLowerCase().includes(lowerQuery) || 
            app.description.toLowerCase().includes(lowerQuery)
          );
        }
        
        setApplications(filtered);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to fetch applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (query || location) {
      fetchApplications();
    } else {
      setApplications([]);
    }
  }, [query, location, radius]);

  // Handle application click
  const handleApplicationClick = (application: Application) => {
    console.log('Application clicked:', application.id);
    // Navigate to application detail page in a real implementation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Planning Applications</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <SearchForm 
            onSearch={handleSearch}
            initialQuery={query}
            initialLocation={location}
            initialRadius={radius}
          />
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-md ${!isMapView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => handleViewToggle(false)}
            >
              List View
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${isMapView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => handleViewToggle(true)}
            >
              Map View
            </button>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Sort by:</label>
              <select 
                id="sort" 
                value={sortType}
                onChange={(e) => handleSortChange(e.target.value as SortType)}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="date">Date (newest)</option>
                <option value="relevance">Relevance</option>
                <option value="distance">Distance</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-2 text-sm text-gray-600">Filter:</label>
              <select 
                id="filter" 
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="all">All applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading results..." />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            Error: {error}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {filteredApplications.length} 
                {filteredApplications.length === 1 ? ' result' : ' results'} 
                {query && ` for "${query}"`}
                {location && ` near "${location}"`}
              </h2>
            </div>
            
            {filteredApplications.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">No applications found. Try adjusting your search criteria.</p>
              </div>
            ) : isMapView ? (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <MapView 
                  applications={filteredApplications}
                  center={
                    filteredApplications.length > 0 && filteredApplications[0].location.lat && filteredApplications[0].location.lng
                      ? { lat: filteredApplications[0].location.lat, lng: filteredApplications[0].location.lng }
                      : undefined
                  }
                />
              </div>
            ) : (
              <div>
                <PlanningApplicationList 
                  applications={filteredApplications.map(app => ({
                    id: app.id,
                    title: app.title,
                    description: app.description,
                    status: app.status,
                    date: app.date,
                    location: { address: app.location.address }
                  }))} 
                  onApplicationClick={handleApplicationClick}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
