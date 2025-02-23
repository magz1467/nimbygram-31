
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

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data from crystal_roof...');
      setIsLoading(true);
      
      try {
        const { data: properties, error } = await supabase
          .from('crystal_roof')
          .select('id, geometry, description, address, status, streetview_url, authority, short_title')
          .not('geometry', 'is', null);

        if (error) {
          console.error('❌ Error fetching property data:', error);
          toast({
            title: "Error loading properties",
            description: "Please try again later",
            variant: "destructive"
          });
          return;
        }

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          try {
            if (item.geometry?.coordinates && Array.isArray(item.geometry.coordinates)) {
              const coords = Array.isArray(item.geometry.coordinates[0]) 
                ? item.geometry.coordinates[0]
                : item.geometry.coordinates;
              coordinates = [coords[1], coords[0]];
            }
          } catch (err) {
            console.error('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates) return null;

          const result: Application = {
            id: item.id || Math.random(),
            title: item.short_title || item.description || `Property ${item.id}`,
            address: item.address || 'Address unavailable',
            status: item.status || 'Status unavailable',
            reference: item.id?.toString() || '',
            description: item.description || '',
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
            impacted_services: undefined
          };

          return result;
        }).filter((app): app is Application => app !== null);

        console.log(`📊 Found ${transformedData?.length || 0} valid applications`);
        
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

  // Filter applications by distance and other filters
  const filteredByDistance = applications.filter(app => {
    if (!coordinates || !app.coordinates) return false;
    const distance = calculateDistance(coordinates, app.coordinates);
    return distance <= 3;
  });

  // Use the filtered applications hook with distance-filtered applications
  const filteredApplications = useFilteredApplications(filteredByDistance, activeFilters, activeSort);

  // Default coordinates for central London
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

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
