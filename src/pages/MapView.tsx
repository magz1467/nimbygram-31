
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

const MapViewPage = () => {
  const isMobile = useIsMobile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postcode, setPostcode] = useState("SW1A 1AA");
  const { activeFilters, activeSort, isMapView, handleFilterChange, handleSortChange } = useFilterSortState();
  const { coordinates } = useCoordinates(postcode);

  // Default coordinates for central London
  const defaultCoordinates: [number, number] = [51.5074, -0.1278];

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log('🔍 Starting to fetch property data...');
      setIsLoading(true);
      
      try {
        const { data: properties, error } = await supabase
          .from('property_data_api')
          .select('id, geom, proposal')
          .range(0, 99)
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

        console.log('📦 Received property data:', properties?.length || 0, 'records');

        const transformedData = properties?.map((item: any) => {
          let coordinates: [number, number] | undefined;
          try {
            if (item.geom?.coordinates && Array.isArray(item.geom.coordinates)) {
              const coords = Array.isArray(item.geom.coordinates[0]) 
                ? item.geom.coordinates[0] 
                : item.geom.coordinates;
              
              coordinates = [
                coords[1],
                coords[0]
              ];
            }
          } catch (err) {
            console.warn('⚠️ Error parsing coordinates for item:', item.id, err);
            return null;
          }

          if (!coordinates) {
            console.warn('⚠️ Missing coordinates for item:', item.id);
            return null;
          }

          return {
            id: item.id || Math.random(),
            title: item.proposal || `Property ${item.id}`, // Use proposal as title, fallback to Property ID
            address: 'Address pending',
            status: 'Under Review',
            reference: item.id?.toString() || '',
            description: item.proposal || '', // Also use proposal as description
            submissionDate: '',
            coordinates: coordinates,
            postcode: 'N/A',
            applicant: 'Not specified',
            decisionDue: '',
            type: 'Planning Application',
            ward: 'Not specified',
            officer: 'Not assigned',
            consultationEnd: '',
            image: undefined,
            image_map_url: undefined,
            ai_title: undefined,
            last_date_consultation_comments: undefined,
            valid_date: undefined,
            centroid: undefined,
            impact_score: null,
            impact_score_details: undefined,
            impacted_services: undefined
          } as Application;
        }).filter((app): app is Application => app !== null);

        console.log('✨ Transformed data:', {
          totalTransformed: transformedData?.length,
          firstItem: transformedData?.[0],
          hasCoordinates: transformedData?.some(app => app.coordinates)
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

  console.log('🎯 Rendering MapContent with:', {
    applicationCount: applications.length,
    selectedId,
    isMapView: true,
    isLoading,
    firstCoordinates: applications[0]?.coordinates,
    searchedCoordinates: coordinates
  });
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <SearchSection 
          onPostcodeSelect={handlePostcodeSelect}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          isMapView={isMapView}
          applications={applications}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <SidebarSection
              isMobile={isMobile}
              isMapView={true}
              applications={applications}
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
              applications={applications}
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
