
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MapContent } from "@/components/map/MapContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { toast } from "@/components/ui/use-toast";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SidebarSection } from "@/components/applications/dashboard/components/SidebarSection";
import { useFilterSortState } from "@/hooks/applications/use-filter-sort-state";
import { useCoordinates } from "@/hooks/use-coordinates";
import Header from "@/components/Header";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { calculateDistance } from "@/utils/distance";

const MapViewPage = () => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postcode, setPostcode] = useState("SW1A 1AA");
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates } = useCoordinates(postcode);

  // Filter applications by distance and other filters
  const filteredByDistance = applications.filter(app => {
    if (!coordinates || !app.coordinates) {
      console.log('Filtered out due to missing coordinates:', app.id);
      return false;
    }
    const distance = calculateDistance(coordinates, app.coordinates);
    const isWithinRadius = distance <= 25; // Increased from 5km to 25km
    if (!isWithinRadius) {
      console.log(`Filtered out due to distance (${distance.toFixed(2)}km):`, app.id);
    }
    return isWithinRadius;
  });

  // Use the filtered applications hook with distance-filtered applications
  const filteredApplications = useFilteredApplications(filteredByDistance, activeFilters, activeSort);

  // Default coordinates for central London
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data...');
      setIsLoading(true);
      
      try {
        // Let's specifically query Westminster properties first to see how many there are
        const { data: westminsterCount, error: countError } = await supabase
          .from('property_data_api')
          .select('id', { count: 'exact' })
          .ilike('authority', '%westminster%');

        if (countError) {
          console.error('Error getting Westminster count:', countError);
        } else {
          console.log('Total Westminster properties in database:', westminsterCount?.length);
        }

        // Removed the .range(0, 99) to get all properties
        const { data: properties, error } = await supabase
          .from('property_data_api')
          .select('id, geom, proposal, address, status, streetview_url, category, authority')
          .not('geom', 'is', null);

        if (error) {
          console.error('❌ Error fetching property data:', error);
          toast({
            title: "Error loading properties",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }

        console.log('📦 Raw property data count:', properties?.length);
        
        // Log ALL Westminster properties before any filtering
        const westminsterProps = properties?.filter(p => p.authority?.toLowerCase().includes('westminster'));
        console.log('📦 Westminster properties found:', westminsterProps?.length);
        
        // Detailed logging of each Westminster property's coordinates
        westminsterProps?.forEach(prop => {
          console.log('Westminster property raw data:', {
            id: prop.id,
            address: prop.address,
            authority: prop.authority,
            rawGeom: prop.geom,
            coordinates: prop.geom?.coordinates ? 
              Array.isArray(prop.geom.coordinates[0]) ? 
                [prop.geom.coordinates[0][1], prop.geom.coordinates[0][0]] :
                [prop.geom.coordinates[1], prop.geom.coordinates[0]]
              : null
          });
        });

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          try {
            if (item.geom?.coordinates && Array.isArray(item.geom.coordinates)) {
              // Handle both single coordinate pair and array of coordinates
              const coords = Array.isArray(item.geom.coordinates[0]) 
                ? item.geom.coordinates[0]  // Take first coordinate if array
                : item.geom.coordinates;    // Use directly if single pair
              
              // IMPORTANT: Swap lat/lng if needed - log this for Westminster properties
              coordinates = [coords[1], coords[0]];
              
              if (item.authority?.toLowerCase().includes('westminster')) {
                console.log('Westminster property coordinate transformation:', {
                  id: item.id,
                  address: item.address,
                  originalCoords: coords,
                  transformedCoords: coordinates,
                  distance: defaultCoordinates ? calculateDistance(defaultCoordinates, coordinates) : 'No default coordinates'
                });
              }
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            if (item.authority?.toLowerCase().includes('westminster')) {
              console.error('Failed to parse Westminster property coordinates:', {
                id: item.id,
                geom: item.geom,
                error: err
              });
            }
            return null;
          }

          if (!coordinates) {
            if (item.authority?.toLowerCase().includes('westminster')) {
              console.warn('⚠️ Missing coordinates for Westminster property:', {
                id: item.id,
                geom: item.geom
              });
            }
            return null;
          }

          const result: Application = {
            id: item.id || Math.random(),
            title: item.proposal || `Property ${item.id}`,
            address: item.address || 'Address unavailable',
            status: item.status || 'Status unavailable',
            reference: item.id?.toString() || '',
            description: item.proposal || '',
            submissionDate: '',
            coordinates: coordinates,
            postcode: 'N/A',
            applicant: 'Not specified',
            decisionDue: '',
            type: 'Planning Application',
            ward: 'Not specified',
            officer: 'Not assigned',
            consultationEnd: '',
            image: item.streetview_url,
            image_map_url: undefined,
            ai_title: undefined,
            last_date_consultation_comments: undefined,
            valid_date: undefined,
            centroid: undefined,
            impact_score: null,
            impact_score_details: undefined,
            impacted_services: undefined,
            category: item.category || 'New Build'
          };

          return result;
        }).filter((app): app is Application => app !== null);

        console.log('✨ Transformed data count:', transformedData?.length);
        
        // Log final Westminster properties
        const finalWestminsterProps = transformedData?.filter(app => 
          properties?.find(p => p.id === app.id)?.authority?.toLowerCase().includes('westminster')
        );
        
        console.log('Final Westminster properties check:', {
          total: finalWestminsterProps?.length,
          properties: finalWestminsterProps?.map(app => ({
            id: app.id,
            address: app.address,
            coordinates: app.coordinates,
            distance: coordinates ? calculateDistance(coordinates, app.coordinates!) : 'No search coordinates'
          }))
        });

        if (!transformedData?.length) {
          toast({
            title: "No properties found",
            description: "No properties with valid coordinates were found",
            variant: "destructive"
          });
        }

        setApplications(transformedData || []);
      } catch (error) {
        console.error('💥 Error in fetchPropertyData:', error);
        toast({
          title: "Error loading properties",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, []);

  const handlePostcodeSelect = (newPostcode: string) => {
    console.log('New postcode selected:', newPostcode);
    setPostcode(newPostcode);
  };

  console.log('🎯 MapContent rendering stats:', {
    rawApplicationCount: applications.length,
    filteredByDistanceCount: filteredByDistance.length,
    finalFilteredCount: filteredApplications.length,
    searchCoordinates: coordinates,
    activeFilters
  });
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <Header />
        <SearchSection 
          onPostcodeSelect={handlePostcodeSelect}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          isMapView={isMapView}
          applications={filteredApplications}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <SidebarSection
              isMobile={isMobile}
              isMapView={true}
              applications={filteredApplications}
              selectedId={selectedId}
              postcode={postcode}
              coordinates={coordinates || defaultCoordinates}
              activeFilters={activeFilters}
              activeSort={activeSort}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onSelectApplication={setSelectedId}
              onClose={() => setSelectedId(null)}
            />
          )}
          
          <div className="flex-1 relative">
            <MapContent 
              applications={filteredApplications}
              selectedId={selectedId}
              coordinates={coordinates || defaultCoordinates}
              isMobile={isMobile}
              isMapView={true}
              onMarkerClick={(id) => {
                console.log('🖱️ Marker clicked:', id);
                setSelectedId(id);
              }}
              isLoading={isLoading}
              postcode={postcode}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MapViewPage;
